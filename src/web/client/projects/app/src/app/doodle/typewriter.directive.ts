import { Directive, afterNextRender, input } from '@angular/core';

@Directive({
  selector: '[appTypewriter]',
  host: { class: 'typewriter' },
})
export class TypewriterDirective {
  readonly animate = input(false);

  constructor() {
    afterNextRender(() => {
      if (!this.animate()) return;
      this.runAnimation();
    });
  }

  private runAnimation(): void {
    //
  }
}
