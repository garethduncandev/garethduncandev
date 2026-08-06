import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMMAND_COLORS } from '../command-colors';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <p class="font-mono text-zinc-200 leading-relaxed">
      Hi — this is my tiny area of the web. I have some
      <a routerLink="/blog" [class]="blogLink">blog</a>
      posts and
      <a routerLink="/notes" [class]="notesLink">notes</a>.
      Have a
      <a routerLink="/find" [class]="findLink">look</a>
      around or give me a
      <a routerLink="/contact" [class]="contactLink">shout</a>.
    </p>
  `,
})
export class Home {
  protected readonly blogLink = linkClass(COMMAND_COLORS['blog'].text);
  protected readonly notesLink = linkClass(COMMAND_COLORS['notes'].text);
  protected readonly findLink = linkClass(COMMAND_COLORS['find'].text);
  protected readonly contactLink = linkClass(COMMAND_COLORS['contact'].text);
}

function linkClass(textColor: string): string {
  const decoration = textColor.replace('text-', 'decoration-');
  return `${textColor} underline decoration-2 ${decoration}`;
}
