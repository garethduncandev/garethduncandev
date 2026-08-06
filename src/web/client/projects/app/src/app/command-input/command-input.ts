import {
  afterRenderEffect,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { form, FormField } from '@angular/forms/signals';
import { SearchService } from '../search.service';
import { COMMAND_COLORS } from '../command-colors';

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
    enterHint: 'view',
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
    route: '/find',
    mode: {
      placeholder: 'type something to find',
      searchCategory: 'all',
      enterActivates: true,
      entries: [],
    },
    showInDefault: true,
    enterHint: 'search',
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
    enterHint: 'view',
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
      <div [class]="borderClass()">
        <button
          type="button"
          [class]="pillClass()"
          [attr.aria-label]="activeCommand() ? 'Show commands. Currently on ' + activeCommand() : 'Show commands. Currently at root'"
          (click)="toggleCommandSwitcher()"
        >
          <span aria-hidden="true">▾</span>
          <span>{{ activeCommand() ?? 'root' }}</span>
        </button>
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
          @if (searchService.isLoading()) {
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
        (pointerleave)="selectedIndex.set(-1)"
      >
        @for (cmd of displayedCommands(); track cmd.name; let i = $index) {
          <li
            [id]="'command-option-' + i"
            role="option"
            tabindex="0"
            [attr.aria-selected]="i === selectedIndex()"
            [class]="
              i === selectedIndex()
                ? 'cursor-pointer px-3 py-1 font-mono bg-zinc-800 ' + commandTextColor(cmd.name)
                : 'cursor-pointer px-3 py-1 font-mono ' + commandTextColor(cmd.name)
            "
            (pointerenter)="selectedIndex.set(i)"
            (click)="execute(cmd)"
            (keydown.enter)="execute(cmd)"
          >
            <span [class]="commandTextColor(cmd.name)">{{ cmd.name === 'home' ? '/root' : '/' + cmd.name }}</span>
          </li>
        }
        @if (noResults()) {
          <li class="px-3 py-1 font-mono text-zinc-500">No results for "{{ searchQuery() }}"</li>
        }
      </ul>
      <span class="sr-only" aria-live="polite" aria-atomic="true">{{ modeAnnouncement() }}</span>
    </div>
  `,
})
export class CommandInput {
  private readonly router = inject(Router);
  protected readonly searchService = inject(SearchService);
  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  private readonly blogIndex = httpResource<ContentIndexEntry[]>(() => '/content/blog/index.json');
  private readonly notesIndex = httpResource<ContentIndexEntry[]>(
    () => '/content/notes/index.json',
  );

  private readonly blogEntries = computed<ModeEntry[]>(() =>
    (this.blogIndex.value() ?? []).map((e) => ({
      name: e.title.toLowerCase(),
      route: `/blog/${e.slug}`,
    })),
  );
  private readonly notesEntries = computed<ModeEntry[]>(() =>
    (this.notesIndex.value() ?? []).map((e) => ({
      name: e.title.toLowerCase(),
      route: `/notes/${e.slug}`,
    })),
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
  protected readonly activeCommand = signal<string | null>(null);
  protected readonly searchQuery = signal<string | undefined>(undefined);
  private readonly userNavigatedList = signal(false);
  protected readonly showCommandSwitcher = signal(false);
  protected readonly modeAnnouncement = signal('');

  protected readonly isExactMatch = computed(() => {
    if (this.activeMode()) return false;
    const q = this.query().toLowerCase();
    if (!q || q !== q.trimEnd()) return false;
    return COMMANDS.some((cmd) => cmd.name === q);
  });

  protected readonly filteredCommands = computed(() => {
    if (this.activeMode()) return [];
    const q = this.query().toLowerCase();
    if (!q) {
      const defaults = COMMANDS.filter((cmd) => cmd.showInDefault);
      if (this.currentRoute() !== '/') {
        const home = COMMANDS.find((cmd) => cmd.name === 'home')!;
        return [home, ...defaults];
      }
      return defaults;
    }
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
    if (this.showCommandSwitcher()) {
      const defaults = COMMANDS.filter((cmd) => cmd.showInDefault);
      if (this.currentRoute() !== '/') {
        const home = COMMANDS.find((cmd) => cmd.name === 'home')!;
        return [home, ...defaults];
      }
      return defaults;
    }
    if (this.activeMode()) {
      const entries = this.modeEntries();
      if (entries.length > 0) return entries;
      return this.searchService.results().map((r) => ({
        name: r.title ?? r.slug ?? '',
        route: r.slug ? `/${r.type}/${r.slug}` : null,
        mode: false as const,
        showInDefault: false,
        enterHint: '',
      }));
    }
    const q = this.query().toLowerCase();
    const filtered = this.filteredCommands();
    if (!q || filtered.length > 0) return filtered;
    return this.searchService.results().map((r) => ({
      name: r.title ?? r.slug ?? '',
      route: r.slug ? `/${r.type}/${r.slug}` : null,
      mode: false as const,
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
    if (this.activeMode() && !this.showCommandSwitcher()) {
      if (!this.showSuggestions()) return '';
      const cmd = this.highlightedCommand();
      if (cmd) return '[esc] back · [enter] open';
      return '[esc] back · [/] commands';
    }
    if (!this.showSuggestions() && !this.isExactMatch()) return '';
    const cmd = this.highlightedCommand();
    if (!cmd) return '';
    const full = COMMANDS.find((c) => c.name === cmd.name);
    if (!full) return '[enter] to open';
    return `[enter] ${full.enterHint}`;
  });

  protected readonly noResults = computed(() => {
    const status = this.searchService.searchResults.status();
    const hasSearched = status === 'resolved' || status === 'error';
    return hasSearched && this.displayedCommands().length === 0 && !!this.searchQuery();
  });

  protected readonly activeCommandColor = computed(() => COMMAND_COLORS[this.activeCommand() ?? ''] ?? null);

  protected readonly pillClass = computed(() => {
    const base = 'select-none cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded ml-1 mr-1';
    const color = COMMAND_COLORS[this.activeCommand() ?? 'home'];
    return `${base} ${color.pillBg} ${color.pillText}`;
  });

  protected readonly slashClass = computed(() => {
    const color = COMMAND_COLORS[this.activeCommand() ?? 'home'];
    return 'select-none ' + color.text;
  });

  protected readonly borderClass = computed(() => {
    const color = COMMAND_COLORS[this.activeCommand() ?? 'home'];
    return 'flex items-center gap-0 border-y-2 px-3 py-2 font-mono text-zinc-300 ' + color.border;
  });

  protected commandTextColor(name: string): string {
    return COMMAND_COLORS[name]?.text ?? 'text-zinc-500';
  }

  protected readonly showSuggestions = computed(() => {
    if (this.isExactMatch()) return false;
    if (this.activeCommand() && !this.query() && !this.showCommandSwitcher()) return false;
    const cmds = this.displayedCommands();
    if (cmds.length === 1) {
      const q = this.query().toLowerCase().trim();
      if (q && cmds[0].name.toLowerCase() === q) return false;
    }
    return cmds.length > 0 || this.searchService.isLoading() || this.noResults();
  });

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private blurTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const mode = this.activeMode();
      untracked(() => {
        if (mode) {
          this.modeAnnouncement.set(
            `Entered ${mode.command} mode. ${mode.mode.placeholder}. Press Escape to return to commands.`,
          );
        } else {
          this.modeAnnouncement.set('Returned to command navigation.');
        }
      });
    });

    effect(() => {
      const rawUrl = this.currentRoute();
      const blogEntries = this.blogEntries();
      const notesEntries = this.notesEntries();
      untracked(() => {
        const url = rawUrl.split('?')[0];
        if (url === '/') {
          this.inputModel.set({ query: '' });
          this.activeMode.set(null);
          this.activeCommand.set(null);
        } else {
          const segments = url.slice(1).split('/');
          const cmd = COMMANDS.find((c) => c.name === segments[0]);
          if (cmd?.mode && segments.length > 1) {
            this.activeMode.set({ command: cmd.name, mode: cmd.mode });
            this.activeCommand.set(cmd.name);
            const slug = segments.slice(1).join('/');
            const entries =
              cmd.name === 'blog' ? blogEntries : cmd.name === 'notes' ? notesEntries : [];
            const entry = entries.find((e) => e.route === `/${segments[0]}/${slug}`);
            this.inputModel.set({ query: entry?.name ?? slug });
          } else if (cmd && cmd.mode && cmd.mode.enterActivates) {
            this.activeMode.set({ command: cmd.name, mode: cmd.mode });
            this.activeCommand.set(cmd.name);
            const queryString = rawUrl.split('?')[1] ?? '';
            const q = new URLSearchParams(queryString).get('q') ?? '';
            this.inputModel.set({ query: q });
          } else if (cmd?.mode) {
            this.activeMode.set({ command: cmd.name, mode: cmd.mode });
            this.activeCommand.set(cmd.name);
            this.inputModel.set({ query: '' });
          } else if (cmd) {
            this.activeMode.set(null);
            this.activeCommand.set(cmd.name);
            this.inputModel.set({ query: '' });
          } else {
            this.activeMode.set(null);
            this.activeCommand.set(null);
            this.inputModel.set({ query: segments[0] });
          }
        }
        this.searchQuery.set(undefined);
        this.showCommandSwitcher.set(false);
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
      const route = this.currentRoute();
      const hasNavResults = untracked(() => this.filteredCommands().length > 0);
      const hasModeEntries = untracked(() => this.modeEntries().length > 0);

      if (this.debounceTimer) clearTimeout(this.debounceTimer);

      const onFindPage = route.startsWith('/find');
      const shouldSearch = q && !onFindPage && (mode ? !hasModeEntries : !hasNavResults);

      if (shouldSearch) {
        if (!mode) {
          const findCmd = COMMANDS.find((c) => c.name === 'find')!;
          this.activeMode.set({ command: findCmd.name, mode: findCmd.mode as CommandMode });
          this.activeCommand.set(findCmd.name);
        }
        this.debounceTimer = setTimeout(() => {
          this.searchQuery.set(q);
          this.searchService.search(q, mode?.mode.searchCategory);
        }, 500);
      } else if (!onFindPage) {
        this.searchQuery.set(undefined);
        this.searchService.clear();
      }

      onCleanup(() => {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
      });
    });
  }

  protected onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (this.activeMode() && value === '/') {
      input.value = '';
      this.inputModel.set({ query: '' });
      this.showCommandSwitcher.set(true);
      this.isOpen.set(true);
      return;
    }

    if (this.showCommandSwitcher()) {
      this.showCommandSwitcher.set(false);
    }

    if (!this.activeMode()) {
      const match = value.match(/^(\w+)\s$/);
      if (match) {
        const cmd = COMMANDS.find((c) => c.name === match[1].toLowerCase());
        if (cmd?.mode) {
          this.activeMode.set({ command: cmd.name, mode: cmd.mode });
          this.activeCommand.set(cmd.name);
          input.value = '';
          this.inputModel.set({ query: '' });
          this.searchQuery.set(undefined);
          return;
        }
      }
    }

    this.isOpen.set(true);
    this.userNavigatedList.set(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Backspace' && this.query() === '' && this.activeCommand()) {
      this.activeMode.set(null);
      this.activeCommand.set(null);
      this.searchQuery.set(undefined);
      this.inputModel.set({ query: '' });
      this.showCommandSwitcher.set(true);
      this.isOpen.set(true);
      event.preventDefault();
      return;
    }

    const cmds = this.displayedCommands();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.activeCommand() && !this.showCommandSwitcher() && !this.query()) {
          this.showCommandSwitcher.set(true);
          this.isOpen.set(true);
        } else if (cmds.length) {
          this.selectedIndex.update((i) => (i + 1) % cmds.length);
          this.userNavigatedList.set(true);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.activeCommand() && !this.showCommandSwitcher() && !this.query()) {
          this.showCommandSwitcher.set(true);
          this.isOpen.set(true);
        } else if (cmds.length) {
          this.selectedIndex.update((i) => (i - 1 + cmds.length) % cmds.length);
          this.userNavigatedList.set(true);
        }
        break;
      case 'Enter': {
        event.preventDefault();
        const mode = this.activeMode();
        if (mode?.command === 'find' && this.query() && !this.userNavigatedList()) {
          this.router.navigate(['/find'], { queryParams: { q: this.query() } });
        } else if (this.showSuggestions()) {
          const highlighted = this.highlightedCommand();
          if (highlighted) {
            this.execute(highlighted);
          }
        } else {
          const exactCmd = COMMANDS.find((c) => c.name === this.query().toLowerCase().trim());
          if (exactCmd) {
            this.execute(exactCmd);
          } else if (!this.query() && !mode && !this.activeCommand()) {
            this.router.navigate(['/']);
          } else if (this.query() && this.filteredCommands().length === 0) {
            this.router.navigate(['/find'], { queryParams: { q: this.query() } });
          }
        }
        break;
      }
      case 'Escape':
        this.showCommandSwitcher.set(false);
        if (this.activeMode()) {
          this.activeMode.set(null);
          this.activeCommand.set(null);
          this.searchQuery.set(undefined);
          this.inputModel.set({ query: '' });
        } else {
          this.activeCommand.set(null);
          this.inputModel.set({ query: '' });
          this.isOpen.set(false);
        }
        break;
      case 'Tab':
        event.preventDefault();
        if (!this.activeMode()) {
          const highlighted = this.highlightedCommand();
          const full = highlighted ? COMMANDS.find((c) => c.name === highlighted.name) : undefined;
          if (full?.mode) {
            this.activeMode.set({ command: full.name, mode: full.mode });
            this.activeCommand.set(full.name);
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
    this.showCommandSwitcher.set(false);
    if (cmd.mode && cmd.mode.enterActivates) {
      this.activeMode.set({ command: cmd.name, mode: cmd.mode });
      this.activeCommand.set(cmd.name);
      this.inputModel.set({ query: '' });
      this.searchQuery.set(undefined);
    } else if (cmd.name === 'clear') {
      this.inputModel.set({ query: '' });
      this.activeMode.set(null);
      this.searchQuery.set(undefined);
      this.router.navigate(['/']);
    } else if (cmd.route) {
      if (this.currentRoute() === cmd.route) {
        this.activeCommand.set(cmd.name);
        if (cmd.mode) {
          this.activeMode.set({ command: cmd.name, mode: cmd.mode });
        }
        this.inputModel.set({ query: '' });
        return;
      }
      const navCmd = COMMANDS.find((c) => c.route === cmd.route);
      this.inputModel.set({ query: navCmd?.name ?? '' });
      this.activeMode.set(null);
      this.searchQuery.set(undefined);
      this.router.navigate([cmd.route]);
    }
  }

  protected toggleCommandSwitcher(): void {
    if (this.blurTimer) {
      clearTimeout(this.blurTimer);
      this.blurTimer = null;
    }
    this.showCommandSwitcher.update((v) => !v);
    this.isOpen.set(true);
    this.inputEl().nativeElement.focus();
  }

  protected onBlur(): void {
    this.blurTimer = setTimeout(() => {
      this.isOpen.set(false);
      this.showCommandSwitcher.set(false);
      this.blurTimer = null;
    }, 150);
  }
}
