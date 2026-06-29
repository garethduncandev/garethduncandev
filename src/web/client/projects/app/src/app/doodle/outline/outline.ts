import { Component, input } from '@angular/core';
import { TypewriterDirective } from '../typewriter.directive';

@Component({
  selector: 'app-outline-doodle',
  imports: [TypewriterDirective],
  templateUrl: './outline.html',
  host: { class: 'contents' },
})
export class OutlineDoodleComponent {
  readonly animate = input(false);
}
