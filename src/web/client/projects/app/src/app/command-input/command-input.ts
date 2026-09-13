import {
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { form, FormField } from '@angular/forms/signals';
import { SearchService } from '../search.service';
import { CommandFocusService } from '../command-focus.service';
import { COMMAND_COLORS } from '../command-colors';

interface Command {
  name: string;
  route: string;
  showInDefault: boolean;
}

const COMMANDS: Command[] = [
  { name: 'home', route: '/', showInDefault: false },
  { name: 'blog', route: '/blog', showInDefault: true },
  { name: 'notes', route: '/notes', showInDefault: true },
  { name: 'contact', route: '/contact', showInDefault: true },
];

@Component({
  selector: 'app-command-input',
  imports: [FormField],
  host: { class: 'block' },
  template: `
    <div class="relative">
      <div [class]="borderClass()">
        <span [class]="pillClass()" aria-hidden="true">/{{ activeCommand() ?? 'root' }}</span>
        <div class="relative flex-1 flex items-center">
          <input
            #inputEl
            type="text"
            role="combobox"
            [attr.aria-expanded]="showSearchResults()"
            aria-controls="command-listbox"
            [attr.aria-activedescendant]="
              highlightedResult() ? 'command-option-' + selectedIndex() : null
            "
            aria-autocomplete="list"
            aria-label="Navigate to page"
            placeholder="search…"
            [class]="
              isExactMatch()
                ? 'w-full bg-transparent text-sky-300 caret-zinc-300 outline-none placeholder:text-zinc-600'
                : 'w-full bg-transparent text-zinc-300 caret-zinc-300 outline-none placeholder:text-zinc-600'
            "
            [formField]="inputForm.query"
            (input)="onInput()"
            (keydown)="onKeydown($event)"
            (focus)="isOpen.set(true)"
            (blur)="onBlur()"
          />
          @if (searchService.isLoading()) {
            <span class="ml-1 text-zinc-500 animate-spin text-xs" aria-label="Searching">⠋</span>
          }
        </div>
      </div>

      <nav aria-label="Site navigation" class="flex gap-4 px-3 py-1 font-mono">
        @for (cmd of navCommands(); track cmd.name) {
          <button type="button" [class]="navCommandClass(cmd)" (click)="execute(cmd)">
            /{{ displayName(cmd) }}
          </button>
        }
      </nav>

      @if (showSearchResults()) {
        <ul
          id="command-listbox"
          role="listbox"
          [class]="
            'mt-1 w-full' +
            (activeCommandColor() ? ' border-b-2 ' + activeCommandColor()!.border : '')
          "
          (pointerleave)="selectedIndex.set(-1)"
        >
          @for (result of searchResults(); track $index; let i = $index) {
            <li
              [id]="'command-option-' + i"
              role="option"
              [attr.aria-selected]="i === selectedIndex()"
              [class]="
                i === selectedIndex()
                  ? 'cursor-pointer px-3 py-1 font-mono bg-zinc-800/50 text-zinc-300'
                  : 'cursor-pointer px-3 py-1 font-mono text-zinc-500'
              "
              (pointerenter)="selectedIndex.set(i)"
            >
              <button
                type="button"
                class="w-full text-left bg-transparent border-none p-0 font-mono cursor-pointer"
                (click)="execute(result)"
              >
                {{ result.name }}
              </button>
            </li>
          }
          @if (noResults()) {
            <li class="px-3 py-1 font-mono text-zinc-500">No results for "{{ searchQuery() }}"</li>
          }
        </ul>
      }
    </div>
  `,
})
export class CommandInput {
  protected readonly searchService = inject(SearchService);
  protected readonly inputModel = signal({ query: '' });
  protected readonly inputForm = form(this.inputModel);
  protected readonly query = computed(() => this.inputModel().query);
  protected readonly isOpen = signal(false);
  protected readonly activeCommand = signal<string | null>(null);
  protected readonly searchQuery = signal<string | undefined>(undefined);

  protected readonly isExactMatch = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return false;
    return COMMANDS.some((cmd) => this.displayName(cmd) === q);
  });

  protected readonly navCommands = computed(() => {
    const active = this.activeCommand();
    const defaults = COMMANDS.filter((c) => c.showInDefault && c.name !== active);
    if (this.currentRoute() !== '/') {
      return [COMMANDS.find((c) => c.name === 'home')!, ...defaults];
    }
    return defaults;
  });

  protected readonly searchResults = computed(() =>
    this.searchService.results().map((r) => ({
      name: r.title ?? r.slug ?? '',
      route: r.slug ? `/${r.type}/${r.slug}` : '/',
      showInDefault: false,
    })),
  );

  protected readonly selectedIndex = linkedSignal(() => {
    this.searchResults();
    return 0;
  });

  protected readonly highlightedResult = computed(() => {
    const results = this.searchResults();
    const i = this.selectedIndex();
    return i >= 0 && i < results.length ? results[i] : null;
  });

  protected readonly noResults = computed(() => {
    const status = this.searchService.searchResults.status();
    return (
      (status === 'resolved' || status === 'error') &&
      this.searchService.results().length === 0 &&
      !!this.searchQuery()
    );
  });

  protected readonly activeCommandColor = computed(
    () => COMMAND_COLORS[this.activeCommand() ?? ''] ?? null,
  );

  protected readonly pillClass = computed(() => {
    const base = 'select-none inline-flex items-center mr-1 font-mono';
    const color = COMMAND_COLORS[this.activeCommand() ?? 'home'];
    return `${base} ${color.text}`;
  });

  protected readonly borderClass = computed(() => {
    const color = COMMAND_COLORS[this.activeCommand() ?? 'home'];
    return 'flex items-center gap-0 border-y-2 px-3 py-2 font-mono text-zinc-300 ' + color.border;
  });

  protected readonly showSearchResults = computed(() => {
    if (!this.isOpen()) return false;
    return (
      this.searchService.results().length > 0 || this.searchService.isLoading() || this.noResults()
    );
  });

  private blurTimer: ReturnType<typeof setTimeout> | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly router = inject(Router);
  private readonly commandFocusService = inject(CommandFocusService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  private readonly currentRoute = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    effect(() => {
      const rawUrl = this.currentRoute();
      untracked(() => {
        const url = rawUrl.split('?')[0];
        if (url === '/') {
          this.activeCommand.set(null);
        } else {
          const segments = url.slice(1).split('/');
          const cmd = COMMANDS.find((c) => c.name === segments[0]);
          this.activeCommand.set(cmd?.name ?? segments[0]);
        }
        this.inputModel.set({ query: '' });
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

    this.commandFocusService.requestFocus$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.inputEl().nativeElement.focus();
        this.isOpen.set(true);
      });

    effect((onCleanup) => {
      const q = this.query();
      const route = this.currentRoute();

      if (this.debounceTimer) clearTimeout(this.debounceTimer);

      const onSearchPage = route.startsWith('/search');
      const hasCommandMatch =
        q && COMMANDS.some((c) => this.displayName(c).includes(q.toLowerCase().trim()));

      if (q && !onSearchPage && !hasCommandMatch) {
        this.debounceTimer = setTimeout(() => {
          this.searchQuery.set(q);
          this.searchService.search(q);
        }, 500);
      } else if (!onSearchPage) {
        this.searchQuery.set(undefined);
        this.searchService.clear();
      }

      onCleanup(() => {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
      });
    });
  }

  protected displayName(cmd: Command): string {
    return cmd.name === 'home' ? 'root' : cmd.name;
  }

  protected navCommandClass(cmd: Command): string {
    const color = COMMAND_COLORS[cmd.name]?.text ?? 'text-zinc-500';
    const q = this.query().toLowerCase().trim();
    if (!q) return `cursor-pointer hover:text-white transition-colors ${color}`;
    return this.displayName(cmd).includes(q)
      ? `cursor-pointer transition-colors ${color}`
      : 'cursor-pointer transition-colors text-zinc-700 hover:text-zinc-500';
  }

  protected onInput(): void {
    this.isOpen.set(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const results = this.searchResults();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (results.length) {
          this.selectedIndex.update((i) => (i + 1) % results.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (results.length) {
          this.selectedIndex.update((i) => (i - 1 + results.length) % results.length);
        }
        break;
      case 'Enter': {
        event.preventDefault();
        const highlighted = this.highlightedResult();
        if (highlighted) {
          this.execute(highlighted);
        } else if (this.isExactMatch()) {
          const q = this.query().toLowerCase().trim();
          const cmd = COMMANDS.find((c) => this.displayName(c) === q);
          if (cmd) this.execute(cmd);
        } else if (this.query().trim()) {
          this.router.navigate(['/search'], { queryParams: { q: this.query().trim() } });
        } else {
          this.router.navigate(['/']);
        }
        break;
      }
      case 'Escape':
        this.inputModel.set({ query: '' });
        this.isOpen.set(false);
        break;
    }
  }

  protected execute(cmd: Command): void {
    this.isOpen.set(false);
    this.router.navigate([cmd.route]);
  }

  protected onBlur(): void {
    this.blurTimer = setTimeout(() => {
      this.isOpen.set(false);
      this.blurTimer = null;
    }, 150);
  }
}
