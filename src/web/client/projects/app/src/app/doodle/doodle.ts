import { Component, signal } from '@angular/core';
import { BlockDoodleComponent } from './block/block';
import { HashDoodleComponent } from './hash/hash';
import { OutlineDoodleComponent } from './outline/outline';
import { SlimDoodleComponent } from './slim/slim';

const DOODLE_COUNT = 4;

@Component({
  selector: 'app-doodle',
  imports: [BlockDoodleComponent, HashDoodleComponent, OutlineDoodleComponent, SlimDoodleComponent],
  template: `
    <div (click)="next()" class="cursor-pointer select-none flex items-center justify-center aspect-[3/1] [container-type:inline-size]">
      @switch (index()) {
        @case (0) { <app-block-doodle /> }
        @case (1) { <app-outline-doodle /> }
        @case (2) { <app-hash-doodle /> }
        @case (3) { <app-slim-doodle /> }
      }
    </div>
  `,
})
export class DoodleComponent {
  protected readonly index = signal(Math.floor(Math.random() * DOODLE_COUNT));

  protected next(): void {
    this.index.update(i => (i + 1) % DOODLE_COUNT);
  }
}
