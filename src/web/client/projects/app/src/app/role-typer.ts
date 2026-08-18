import { Component, signal, OnInit, OnDestroy } from '@angular/core';

const ROLES = [
  'Architect',
  'Developer',
  'Software Engineer',
  'Solutions Architect',
  'Fullstack Developer',
  'Software Architect',
];

const TYPE_SPEED = 80;
const DELETE_SPEED = 50;
const PAUSE_AFTER_TYPE = 5000;
const PAUSE_AFTER_DELETE = 500;

@Component({
  selector: 'app-role-typer',
  host: { class: 'inline-block', 'aria-label': 'Solutions Architect' },
  template: `<span aria-hidden="true">{{ text() }}<span class="animate-pulse">▌</span></span>`,
})
export class RoleTyper implements OnInit, OnDestroy {
  private roleIndex = 0;
  protected readonly text = signal(ROLES[this.roleIndex]);
  private timeout: ReturnType<typeof setTimeout> | null = null;

  public ngOnInit() {
    this.timeout = setTimeout(() => this.deleteRole(), PAUSE_AFTER_TYPE);
  }

  public ngOnDestroy() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  private typeRole() {
    const role = ROLES[this.roleIndex];
    let charIndex = 0;

    const typeNext = () => {
      charIndex++;
      this.text.set(role.slice(0, charIndex));
      if (charIndex < role.length) {
        this.timeout = setTimeout(typeNext, TYPE_SPEED);
      } else {
        this.timeout = setTimeout(() => this.deleteRole(), PAUSE_AFTER_TYPE);
      }
    };

    this.timeout = setTimeout(typeNext, TYPE_SPEED);
  }

  private deleteRole() {
    const role = ROLES[this.roleIndex];
    let charIndex = role.length;

    const deleteNext = () => {
      charIndex--;
      this.text.set(role.slice(0, charIndex));
      if (charIndex > 0) {
        this.timeout = setTimeout(deleteNext, DELETE_SPEED);
      } else {
        this.roleIndex = (this.roleIndex + 1) % ROLES.length;
        this.timeout = setTimeout(() => this.typeRole(), PAUSE_AFTER_DELETE);
      }
    };

    this.timeout = setTimeout(deleteNext, DELETE_SPEED);
  }
}
