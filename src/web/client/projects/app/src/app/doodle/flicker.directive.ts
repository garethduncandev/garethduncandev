import { Directive, DestroyRef, ElementRef, afterNextRender, inject, input } from '@angular/core';

interface FlickerTarget {
  span: HTMLElement;
  original: string[];
  current: string[];
  corrupted: Map<number, string>;
}

const CORRUPTION_CHARS = [
  '░',
  '▒',
  '@',
  '┤',
  '~',
  '¦',
  '╫',
  '¬',
  '⌐',
  'Ã',
  '¢',
  '€',
  'Â',
  '¿',
  '�',
  'Ð',
];

const enum FlickerPhase {
  Idle,
  Showing,
}

@Directive({
  selector: '[appFlicker]',
})
export class FlickerDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  public readonly appFlicker = input.required<string[]>();

  constructor() {
    afterNextRender(() => this.start());
  }

  private start(): void {
    const spans = this.el.nativeElement.querySelectorAll('span');
    const originals = this.appFlicker();
    const targets: FlickerTarget[] = [];

    for (let i = 0; i < spans.length; i++) {
      const original = [...(originals[i] ?? '')];
      const current = [...((spans[i] as HTMLElement).textContent ?? '')];
      const corrupted = new Map<number, string>();
      for (let j = 0; j < Math.min(original.length, current.length); j++) {
        if (current[j] !== original[j]) corrupted.set(j, current[j]);
      }
      if (original.length > 0) {
        targets.push({ span: spans[i] as HTMLElement, original, current, corrupted });
      }
    }

    if (!targets.some((t) => t.corrupted.size > 0)) return;

    let phase = FlickerPhase.Idle;
    let activeTarget = targets[0];
    let activePos = 0;
    let lastKey = '';
    let timeout: ReturnType<typeof setTimeout>;

    const pickCorrupted = (): { target: FlickerTarget; idx: number; pos: number } | null => {
      const all: { target: FlickerTarget; idx: number; pos: number; key: string }[] = [];
      targets.forEach((t, i) => {
        for (const pos of t.corrupted.keys())
          all.push({ target: t, idx: i, pos, key: `${i}:${pos}` });
      });
      const candidates = all.filter((c) => c.key !== lastKey);
      if (!candidates.length) return null;
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const pickClean = (): { target: FlickerTarget; pos: number } | null => {
      const candidates: { target: FlickerTarget; pos: number }[] = [];
      for (const t of targets) {
        for (let j = 0; j < t.original.length; j++) {
          const ch = t.original[j];
          if (!t.corrupted.has(j) && ch !== ' ' && ch.trim())
            candidates.push({ target: t, pos: j });
        }
      }
      if (!candidates.length) return null;
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const randomDelay = (): number => 800 + Math.floor(Math.random() * 1700);
    const schedule = (ms: number): void => {
      timeout = setTimeout(tick, ms);
    };

    const tick = (): void => {
      if (phase === FlickerPhase.Idle) {
        const pick = pickCorrupted();
        if (!pick) return;
        lastKey = `${pick.idx}:${pick.pos}`;
        activeTarget = pick.target;
        activePos = pick.pos;
        activeTarget.current[activePos] = activeTarget.original[activePos];
        activeTarget.span.textContent = activeTarget.current.join('');
        phase = FlickerPhase.Showing;
        schedule(150);
      } else {
        if (Math.random() < 0.2) {
          // Evolve: fix this position permanently, corrupt a new clean one
          activeTarget.corrupted.delete(activePos);
          const next = pickClean();
          if (next) {
            const ch = CORRUPTION_CHARS[Math.floor(Math.random() * CORRUPTION_CHARS.length)];
            next.target.corrupted.set(next.pos, ch);
            next.target.current[next.pos] = ch;
            next.target.span.textContent = next.target.current.join('');
          }
        } else {
          // Restore: put the corrupted char back
          activeTarget.current[activePos] = activeTarget.corrupted.get(activePos)!;
          activeTarget.span.textContent = activeTarget.current.join('');
        }
        phase = FlickerPhase.Idle;
        schedule(randomDelay());
      }
    };

    schedule(randomDelay());
    this.destroyRef.onDestroy(() => clearTimeout(timeout));
  }
}
