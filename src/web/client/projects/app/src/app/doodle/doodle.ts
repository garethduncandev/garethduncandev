import { Component, signal } from '@angular/core';
import { BlockDoodleComponent } from './block/block';

const DOODLE_COUNT = 1;

@Component({
  selector: 'app-doodle',
  imports: [BlockDoodleComponent],
  template: `
    <div
      tabindex="0"
      role="button"
      (click)="next()"
      (keydown.enter)="next()"
      class="cursor-pointer select-none relative w-full aspect-3/1 @container"
    >
      @switch (index()) {
        @case (0) {
          <app-block-doodle [animate]="true" />
        }
      }
    </div>
  `,
})
export class DoodleComponent {
  protected readonly index = signal(Math.floor(Math.random() * DOODLE_COUNT));
  protected next(): void {
    this.index.update((i) => (i + 1) % DOODLE_COUNT);
  }
}
