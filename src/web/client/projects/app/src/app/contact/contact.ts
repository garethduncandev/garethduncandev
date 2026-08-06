import { Component } from '@angular/core';
import { COMMAND_COLORS } from '../command-colors';

@Component({
  selector: 'app-contact',
  template: `
    <h1 class="text-2xl font-mono">
      <span [class]="colors.text">/</span><span class="text-zinc-200">contact</span>
    </h1>
  `,
})
export class Contact {
  protected readonly colors = COMMAND_COLORS['contact'];
}
