import {
  Directive,
  ElementRef,
  DestroyRef,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

const GLITCH_CHARS = '█░▒▓╬╠╣║═─┼@#$%&!~*^';

@Directive({
  selector: '[appTypewriter]',
})
export class TypewriterDirective {
  readonly animate = input(false);

  private readonly el = inject(ElementRef<HTMLPreElement>);
  private readonly destroyRef = inject(DestroyRef);
  private animationFrameId: number | null = null;

  constructor() {

    afterNextRender(() => {
      if (!this.animate()) return;
      this.runAnimation();
    });

    this.destroyRef.onDestroy(() => {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }
    });
  }

  private runAnimation(): void {
    const pre = this.el.nativeElement;
    const spans = Array.from(
      pre.querySelectorAll('span'),
    ) as HTMLSpanElement[];

    const originalLines = spans.map((span) => span.textContent ?? '');
    const totalChars = originalLines.reduce(
      (sum, line) => sum + line.length,
      0,
    );

    const currentLines = spans.map(() => '');
    spans.forEach((span) => {
      span.textContent = '';
    });

    const charsPerFrame = Math.ceil(totalChars / 100);
    let cursor = 0;
    const glitchPositions = new Map<
      number,
      { lineIdx: number; charIdx: number; correctChar: string; framesLeft: number }
    >();

    const step = () => {
      const newChars = Math.min(charsPerFrame, totalChars - cursor);

      for (let i = 0; i < newChars; i++) {
        const pos = cursor + i;
        const { lineIdx, charIdx } = this.posToLineChar(pos, originalLines);
        const correctChar = originalLines[lineIdx][charIdx];

        if (correctChar === ' ') {
          currentLines[lineIdx] = this.setChar(
            currentLines[lineIdx],
            charIdx,
            ' ',
          );
        } else {
          const glitchChar =
            GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          currentLines[lineIdx] = this.setChar(
            currentLines[lineIdx],
            charIdx,
            glitchChar,
          );
          glitchPositions.set(pos, {
            lineIdx,
            charIdx,
            correctChar,
            framesLeft: 2 + Math.floor(Math.random() * 2),
          });
        }
      }
      cursor += newChars;

      for (const [pos, data] of glitchPositions) {
        data.framesLeft--;
        if (data.framesLeft <= 0) {
          currentLines[data.lineIdx] = this.setChar(
            currentLines[data.lineIdx],
            data.charIdx,
            data.correctChar,
          );
          glitchPositions.delete(pos);
        }
      }

      const dirtyLines = new Set<number>();
      for (let i = 0; i < newChars; i++) {
        dirtyLines.add(this.posToLineChar(cursor - newChars + i, originalLines).lineIdx);
      }
      for (const [, data] of glitchPositions) {
        dirtyLines.add(data.lineIdx);
      }
      for (const lineIdx of dirtyLines) {
        spans[lineIdx].textContent = currentLines[lineIdx];
      }

      if (cursor < totalChars || glitchPositions.size > 0) {
        this.animationFrameId = requestAnimationFrame(step);
      } else {
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(step);
  }

  private posToLineChar(
    pos: number,
    lines: string[],
  ): { lineIdx: number; charIdx: number } {
    let remaining = pos;
    for (let i = 0; i < lines.length; i++) {
      if (remaining < lines[i].length) {
        return { lineIdx: i, charIdx: remaining };
      }
      remaining -= lines[i].length;
    }
    return { lineIdx: lines.length - 1, charIdx: lines[lines.length - 1].length - 1 };
  }

  private setChar(line: string, charIdx: number, char: string): string {
    const padded = line.padEnd(charIdx + 1, ' ');
    return (
      padded.substring(0, charIdx) + char + padded.substring(charIdx + 1)
    );
  }
}
