import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMMAND_COLORS } from '../command-colors';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <p class="font-mono text-zinc-200 leading-relaxed">
      I architect cloud systems. This is my personal sandbox — built with .Net, Angular, and AWS
      CDK. Read my
      <a routerLink="/blog" [class]="blogLink">blog</a>, browse my
      <a routerLink="/notes" [class]="notesLink">notes</a>,
      <a routerLink="/search" [class]="findLink">search</a>
      for something specific, or get in
      <a routerLink="/contact" [class]="contactLink">touch</a>.
    </p>
  `,
})
export class Home {
  protected readonly blogLink = linkClass(COMMAND_COLORS['blog'].text);
  protected readonly notesLink = linkClass(COMMAND_COLORS['notes'].text);
  protected readonly findLink = linkClass(COMMAND_COLORS['search'].text);
  protected readonly contactLink = linkClass(COMMAND_COLORS['contact'].text);
}

function linkClass(textColor: string): string {
  const decoration = textColor.replace('text-', 'decoration-');
  return `${textColor} underline decoration-2 ${decoration}`;
}
