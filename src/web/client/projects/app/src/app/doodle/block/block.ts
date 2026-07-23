import { Component, input } from '@angular/core';
import { FlickerDirective } from '../flicker.directive';
import { corruptLine } from '../corrupt';
import { BLOCK_LINES } from './block.data';

@Component({
  selector: 'app-block-doodle',
  imports: [FlickerDirective],
  templateUrl: './block.html',
  host: { class: 'contents' },
})
export class BlockDoodle {
  readonly animate = input(false);
  readonly originals = BLOCK_LINES.map((line) => line.text);
  private readonly corrupted = BLOCK_LINES.map((line) =>
    line.text ? corruptLine(line.text) : { text: '', segments: [] },
  );
  readonly lines = this.corrupted.map((c, i) => ({
    text: c.text,
    css: BLOCK_LINES[i].css,
  }));
  readonly segments = this.corrupted.map((c) => c.segments);
}
