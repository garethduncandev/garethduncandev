import { Component, input } from '@angular/core';
import { TypewriterDirective } from '../typewriter.directive';

@Component({
  selector: 'app-block-doodle',
  imports: [TypewriterDirective],
  templateUrl: './block.html',
  host: { class: 'contents' },
})
export class BlockDoodleComponent {
  readonly animate = input(false);
}
