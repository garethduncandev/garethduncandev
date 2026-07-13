import { Directive, DestroyRef, ElementRef, afterNextRender, inject, input } from '@angular/core';

interface FlickerTarget {
  span: HTMLElement;
  original: string[];
  corrupted: string[];
  current: string[];
  corruptedPositions: number[];
}

const enum FlickerPhase {
  ShowOriginal,
  ShowCorrupted,
  Done,
}

@Directive({
  selector: '[appFlicker]',
})
export class FlickerDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  readonly appFlicker = input.required<string[]>();
  readonly appFlickerSegments = input.required<string[][]>();

  constructor() {
    afterNextRender(() => this.start());
  }

  private start(): void {
    const spans = this.el.nativeElement.querySelectorAll('span');
    const originals = this.appFlicker();
    const segments = this.appFlickerSegments();
    const targets: FlickerTarget[] = [];

    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      const original = originals[i];
      const corrupted = segments[i];
      if (!corrupted || !original) continue;

      const originalChars = [...original];
      const corruptedPositions: number[] = [];

      for (let j = 0; j < Math.min(corrupted.length, originalChars.length); j++) {
        if (corrupted[j] !== originalChars[j]) {
          corruptedPositions.push(j);
        }
      }

      if (corruptedPositions.length === 0) continue;

      targets.push({
        span,
        original: originalChars,
        corrupted,
        current: [...corrupted],
        corruptedPositions,
      });
    }

    if (targets.length === 0) return;

    let phase = FlickerPhase.Done;
    let activeTarget: FlickerTarget | undefined;
    let activePos = 0;
    let lastKey = '';

    const allPositions = targets.flatMap((t, i) =>
      t.corruptedPositions.map((p) => ({ target: t, targetIdx: i, pos: p, key: `${i}:${p}` })),
    );

    let timeout: ReturnType<typeof setTimeout>;

    const schedule = (delay: number): void => {
      timeout = setTimeout(tick, delay);
    };

    const randomDelay = (): number => 800 + Math.floor(Math.random() * 1700);

    function tick(): void {
      switch (phase) {
        case FlickerPhase.Done: {
          const candidates = allPositions.filter((c) => c.key !== lastKey);
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          lastKey = pick.key;
          activeTarget = pick.target;
          activePos = pick.pos;
          activeTarget.current[activePos] = activeTarget.original[activePos];
          activeTarget.span.textContent = activeTarget.current.join('');
          phase = FlickerPhase.ShowOriginal;
          schedule(150);
          break;
        }
        case FlickerPhase.ShowOriginal: {
          activeTarget!.current[activePos] = activeTarget!.corrupted[activePos];
          activeTarget!.span.textContent = activeTarget!.current.join('');
          phase = FlickerPhase.ShowCorrupted;
          schedule(randomDelay());
          break;
        }
        case FlickerPhase.ShowCorrupted: {
          phase = FlickerPhase.Done;
          schedule(0);
          break;
        }
      }
    }

    schedule(randomDelay());
    this.destroyRef.onDestroy(() => clearTimeout(timeout));
  }
}
