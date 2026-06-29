import {
  afterRenderEffect,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  linkedSignal,
  resource,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { form, FormField } from '@angular/forms/signals';

interface CommandMode {
  placeholder: string;
  searchCategory: string;
  enterActivates: boolean;
  entries: ModeEntry[];
}

interface ModeEntry {
  name: string;
  route: string;
}

interface Command {
  name: string;
  route: string | null;
  mode: CommandMode | false;
  showInDefault: boolean;
  enterHint: string;
}

export interface SearchResult {
  name: string;
  route: string;
}

interface ContentIndexEntry {
  slug: string;
  title: string;
  date: string;
  description: string;
}

const COMMANDS: Command[] = [
  {
    name: 'blog',
    route: '/blog',
    mode: {
      placeholder: 'search blog posts',
      searchCategory: 'blog',
      enterActivates: false,
      entries: [],
    },
    showInDefault: true,
    enterHint: 'view all blog posts',
  },
  { name: 'clear', route: null, mode: false, showInDefault: false, enterHint: 'reset navigation' },
  {
    name: 'contact',
    route: '/contact',
    mode: false,
    showInDefault: true,
    enterHint: 'get in touch',
  },
  {
    name: 'find',
    route: null,
    mode: {
      placeholder: 'type something to find',
      searchCategory: 'all',
      enterActivates: true,
      entries: [],
    },
    showInDefault: true,
    enterHint: 'search for something',
  },
  { name: 'home', route: '/', mode: false, showInDefault: false, enterHint: 'go to homepage' },
  {
    name: 'notes',
    route: '/notes',
    mode: {
      placeholder: 'search notes',
      searchCategory: 'notes',
      enterActivates: false,
      entries: [],
    },
    showInDefault: true,
    enterHint: 'view all notes',
  },
];


@Component({
  selector: 'app-command-input',
  imports: [FormField],
  host: { class: 'block' },
  template: `
    <div class="relative">
      @if (inputHintText()) {
        <span
          class="block sm:hidden px-3 py-1 text-xs text-zinc-600 select-none font-mono"
          aria-hidden="true"
          >{{ inputHintText() }}</span
        >
      }
      <div
        class="flex items-center gap-0 border-y border-zinc-700/50 px-3 py-2 font-mono text-zinc-300"
      >
        <span class="select-none text-zinc-500" aria-hidden="true">/</span>
        @if (activeMode()) {
          <span class="select-none text-green-400" aria-hidden="true"
            >{{ activeMode()!.command }}&nbsp;</span
          >
        }
        <div class="relative flex-1 flex items-center">
          <input
            #inputEl
            type="text"
            role="combobox"
            [attr.aria-expanded]="showSuggestions()"
            aria-controls="command-listbox"
            [attr.aria-activedescendant]="
              highlightedCommand() ? 'command-option-' + selectedIndex() : null
            "
            aria-autocomplete="list"
            aria-label="Navigate to page"
            [placeholder]="activeMode()?.mode?.placeholder ?? ''"
            [class]="
              isExactMatch()
                ? 'w-full bg-transparent text-sky-300 caret-zinc-300 outline-none placeholder:text-zinc-600'
                : 'w-full bg-transparent text-zinc-300 caret-zinc-300 outline-none placeholder:text-zinc-600'
            "
            [formField]="inputForm.query"
            (input)="onInput($event)"
            (keydown)="onKeydown($event)"
            (focus)="isOpen.set(true)"
            (blur)="onBlur()"
          />
          @if (ghostText()) {
            <span
              class="pointer-events-none absolute top-0 left-0 text-zinc-600"
              aria-hidden="true"
            >
              <span class="invisible">{{ query() }}</span
              >{{ ghostText() }}
            </span>
          }
          @if (searchResource.isLoading()) {
            <span class="ml-1 text-zinc-500 animate-spin text-xs" aria-label="Searching">⠋</span>
          }
        </div>
        @if (inputHintText()) {
          <span
            class="ml-2 hidden sm:inline text-xs text-zinc-600 select-none whitespace-nowrap"
            aria-hidden="true"
            >{{ inputHintText() }}</span
          >
        }
      </div>

      <ul
        id="command-listbox"
        role="listbox"
        [class]="showSuggestions() ? 'mt-1 w-full border-zinc-700/50 bg-zinc-900' : 'hidden'"
      >
        @for (cmd of displayedCommands(); track cmd.name; let i = $index) {
          <li
            [id]="'command-option-' + i"
            role="option"
            tabindex="0"
            [attr.aria-selected]="i === selectedIndex()"
            [class]="
              i === selectedIndex()
                ? 'cursor-pointer px-3 py-1 font-mono text-white bg-zinc-800'
                : 'cursor-pointer px-3 py-1 font-mono text-zinc-500'
            "
            (pointerenter)="selectedIndex.set(i)"
            (click)="execute(cmd)"
            (keydown.enter)="execute(cmd)"
          >
            /{{ cmd.name === 'home' ? '' : cmd.name }}
          </li>
        }
        @if (noResults()) {
          <li class="px-3 py-1 font-mono text-zinc-500">No results for "{{ searchQuery() }}"</li>
        }
      </ul>
    </div>
  `,
})
export class CommandInput {
  private readonly router = inject(Router);
  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  private readonly blogIndex = httpResource<ContentIndexEntry[]>(() => '/content/blog/index.json');
  private readonly notesIndex = httpResource<ContentIndexEntry[]>(() => '/content/notes/index.json');

  private readonly blogEntries = computed<ModeEntry[]>(() =>
    (this.blogIndex.value() ?? []).map((e) => ({ name: e.title.toLowerCase(), route: `/blog/${e.slug}` })),
  );
  private readonly notesEntries = computed<ModeEntry[]>(() =>
    (this.notesIndex.value() ?? []).map((e) => ({ name: e.title.toLowerCase(), route: `/notes/${e.slug}` })),
  );

  private readonly currentRoute = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly inputModel = signal({ query: '' });
  protected readonly inputForm = form(this.inputModel);
  protected readonly query = computed(() => this.inputModel().query);
  protected readonly isOpen = signal(false);
  protected readonly activeMode = signal<{ command: string; mode: CommandMode } | null>(null);
  protected readonly searchQuery = signal<string | undefined>(undefined);

  protected readonly searchResource = resource({
    params: () => {
      const q = this.searchQuery();
      if (!q) return undefined;
      const mode = this.activeMode();
      return { q, category: mode?.mode.searchCategory ?? 'all' };
    },
    loader: async ({ params }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const term = params.q.toLowerCase();
      let entries: ModeEntry[] = [];
      if (params.category === 'blog' || params.category === 'all')
        entries = [...entries, ...this.blogEntries()];
      if (params.category === 'notes' || params.category === 'all')
        entries = [...entries, ...this.notesEntries()];
      return entries
        .filter((e) => e.name.includes(term))
        .map((e) => ({ name: e.name, route: e.route }));
    },
  });

  protected readonly isExactMatch = computed(() => {
    if (this.activeMode()) return false;
    const q = this.query().toLowerCase();
    if (!q || q !== q.trimEnd()) return false;
    return COMMANDS.some((cmd) => cmd.name === q);
  });

  protected readonly filteredCommands = computed(() => {
    if (this.activeMode()) return [];
    const q = this.query().toLowerCase();
    if (!q) return COMMANDS.filter((cmd) => cmd.showInDefault);
    if (q !== q.trimEnd()) return [];
    return COMMANDS.filter((cmd) => cmd.name.includes(q.trim()));
  });

  protected readonly modeEntries = computed((): Command[] => {
    const mode = this.activeMode();
    if (!mode) return [];
    const q = this.query().toLowerCase();
    let entries: ModeEntry[] = [];
    if (mode.command === 'blog') entries = this.blogEntries();
    else if (mode.command === 'notes') entries = this.notesEntries();
    const filtered = q ? entries.filter((e) => e.name.includes(q)) : entries.slice(0, 10);
    return filtered.map((e) => ({
      name: e.name,
      route: e.route,
      mode: false,
      showInDefault: false,
      enterHint: '',
    }));
  });

  protected readonly displayedCommands = computed((): Command[] => {
    if (this.activeMode()) {
      const entries = this.modeEntries();
      if (entries.length > 0) return entries;
      const results = this.searchResource.value() ?? [];
      return results.map((r) => ({
        name: r.name,
        route: r.route || null,
        mode: false,
        showInDefault: false,
        enterHint: '',
      }));
    }
    const q = this.query().toLowerCase();
    const filtered = this.filteredCommands();
    if (!q || filtered.length > 0) return filtered;
    const results = this.searchResource.value() ?? [];
    return results.map((r) => ({
      name: r.name,
      route: r.route || null,
      mode: false,
      showInDefault: false,
      enterHint: '',
    }));
  });

  protected readonly selectedIndex = linkedSignal(() => {
    this.displayedCommands();
    return 0;
  });

  protected readonly highlightedCommand = computed(() => {
    const cmds = this.displayedCommands();
    return cmds[this.selectedIndex()] ?? null;
  });

  protected readonly ghostText = computed(() => {
    const cmd = this.highlightedCommand();
    const q = this.query();
    if (!cmd || !q || !cmd.name.startsWith(q.toLowerCase())) return '';
    return cmd.name.slice(q.length);
  });

  protected readonly inputHintText = computed(() => {
    if (!this.inputForm.query().dirty() && !this.inputForm.query().touched()) return '';
    const cmd = this.highlightedCommand();
    if (!cmd) return '';
    if (this.activeMode()) return '[enter] to open';
    const full = COMMANDS.find((c) => c.name === cmd.name);
    if (!full) return '[enter] to open';
    if (full.mode && full.mode.enterActivates) {
      return `[enter/tab] ${full.enterHint}`;
    }
    const enter = `[enter] ${full.enterHint}`;
    if (full.mode) return `${enter} · [tab] ${full.mode.placeholder}`;
    return enter;
  });

  protected readonly noResults = computed(() => {
    const hasSearched = this.searchResource.status() === 'resolved';
    return hasSearched && this.displayedCommands().length === 0 && !!this.searchQuery();
  });

  protected readonly showSuggestions = computed(() => {
    if (this.isExactMatch()) return false;
    const cmds = this.displayedCommands();
    if (cmds.length === 1) {
      const q = this.query().toLowerCase().trim();
      if (q && cmds[0].name.toLowerCase() === q) return false;
    }
    return cmds.length > 0 || this.searchResource.isLoading() || this.noResults();
  });

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const url = this.currentRoute();
      const blogEntries = this.blogEntries();
      const notesEntries = this.notesEntries();
      untracked(() => {
        if (url === '/') {
          this.inputModel.set({ query: '' });
          this.activeMode.set(null);
        } else {
          const segments = url.slice(1).split('/');
          const cmd = COMMANDS.find((c) => c.name === segments[0]);
          if (cmd?.mode && segments.length > 1) {
            this.activeMode.set({ command: cmd.name, mode: cmd.mode });
            const slug = segments.slice(1).join('/');
            const entries = cmd.name === 'blog' ? blogEntries : cmd.name === 'notes' ? notesEntries : [];
            const entry = entries.find((e) => e.route === `/${segments[0]}/${slug}`);
            this.inputModel.set({ query: entry?.name ?? slug });
          } else {
            this.activeMode.set(null);
            this.inputModel.set({ query: segments[0] });
          }
        }
        this.searchQuery.set(undefined);
      });
    });

    afterRenderEffect({
      write: () => {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        const el = this.inputEl().nativeElement;
        if (document.activeElement !== el) {
          el.focus();
        }
        this.isOpen.set(document.activeElement === el);
      },
    });

    effect((onCleanup) => {
      const q = this.query();
      const mode = this.activeMode();
      const hasNavResults = untracked(() => this.filteredCommands().length > 0);
      const hasModeEntries = untracked(() => this.modeEntries().length > 0);

      if (this.debounceTimer) clearTimeout(this.debounceTimer);

      const shouldSearch = q && (mode ? !hasModeEntries : !hasNavResults);

      if (shouldSearch) {
        if (!mode) {
          const findCmd = COMMANDS.find((c) => c.name === 'find')!;
          this.activeMode.set({ command: findCmd.name, mode: findCmd.mode as CommandMode });
        }
        this.debounceTimer = setTimeout(() => {
          this.searchQuery.set(q);
        }, 500);
      } else {
        this.searchQuery.set(undefined);
      }

      onCleanup(() => {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
      });
    });
  }

  protected onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!this.activeMode()) {
      const match = value.match(/^(\w+)\s$/);
      if (match) {
        const cmd = COMMANDS.find((c) => c.name === match[1].toLowerCase());
        if (cmd?.mode) {
          this.activeMode.set({ command: cmd.name, mode: cmd.mode });
          input.value = '';
          this.inputModel.set({ query: '' });
          this.searchQuery.set(undefined);
          return;
        }
      }
    }

    this.isOpen.set(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.activeMode() && event.key === 'Backspace' && this.query() === '') {
      const commandName = this.activeMode()!.command;
      this.activeMode.set(null);
      this.searchQuery.set(undefined);
      this.inputModel.set({ query: commandName });
      event.preventDefault();
      return;
    }

    const cmds = this.displayedCommands();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (cmds.length) {
          this.selectedIndex.update((i) => (i + 1) % cmds.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (cmds.length) {
          this.selectedIndex.update((i) => (i - 1 + cmds.length) % cmds.length);
        }
        break;
      case 'Enter': {
        event.preventDefault();
        const highlighted = this.highlightedCommand();
        if (highlighted) {
          this.execute(highlighted);
        } else if (!this.query() && !this.activeMode()) {
          this.router.navigate(['/']);
        } else if (this.query() && this.filteredCommands().length === 0) {
          if (!this.activeMode()) {
            const findCmd = COMMANDS.find((c) => c.name === 'find')!;
            this.activeMode.set({ command: findCmd.name, mode: findCmd.mode as CommandMode });
          }
          this.searchQuery.set(this.query());
        }
        break;
      }
      case 'Escape':
        this.inputModel.set({ query: '' });
        this.activeMode.set(null);
        this.searchQuery.set(undefined);
        this.isOpen.set(false);
        break;
      case 'Tab':
        event.preventDefault();
        if (!this.activeMode()) {
          const highlighted = this.highlightedCommand();
          const full = highlighted ? COMMANDS.find((c) => c.name === highlighted.name) : undefined;
          if (full?.mode) {
            this.activeMode.set({ command: full.name, mode: full.mode });
            this.inputModel.set({ query: '' });
            this.searchQuery.set(undefined);
            break;
          }
        }
        if (this.ghostText()) {
          this.inputModel.set({ query: this.highlightedCommand()!.name });
        }
        break;
    }
  }

  protected execute(cmd: Command): void {
    if (cmd.mode && cmd.mode.enterActivates) {
      this.activeMode.set({ command: cmd.name, mode: cmd.mode });
      this.inputModel.set({ query: '' });
      this.searchQuery.set(undefined);
    } else if (cmd.name === 'clear') {
      this.inputModel.set({ query: '' });
      this.activeMode.set(null);
      this.searchQuery.set(undefined);
      this.router.navigate(['/']);
    } else if (cmd.route) {
      if (this.currentRoute() === cmd.route) {
        this.inputModel.set({ query: cmd.name });
        return;
      }
      const navCmd = COMMANDS.find((c) => c.route === cmd.route);
      this.inputModel.set({ query: navCmd?.name ?? '' });
      this.activeMode.set(null);
      this.searchQuery.set(undefined);
      this.router.navigate([cmd.route]);
    }
  }

  protected onBlur(): void {
    setTimeout(() => this.isOpen.set(false), 150);
  }
}
