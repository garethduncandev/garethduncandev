import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMMAND_COLORS } from '../command-colors';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <p class="font-mono text-zinc-200 leading-relaxed">
      Hi, I'm a Solutions Architect. I design and build full-stack cloud applications using .NET,
      Angular, and AWS CDK. This website is my personal sandbox. Read my
      <a routerLink="/blog" [class]="blogLink"><span aria-hidden="true">/</span>blog</a>, browse my
      <a routerLink="/notes" [class]="notesLink"><span aria-hidden="true">/</span>notes</a>,
      <a routerLink="/find" [class]="findLink"><span aria-hidden="true">/</span>search</a>
      for something specific, or get in
      <a routerLink="/contact" [class]="contactLink"><span aria-hidden="true">/</span>touch</a>.
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

/*

Hi, I'm a Solutions Architect. I design and build full-stack cloud applications using .NET, Angular, and AWS CDK. This website is my personal sandbox. Read my blog, look through my notes, search both, or get in touch.

Hi, I'm a Solutions Architect.I build full-stack applications with .NET and Angular, and define cloud environments using AWS Infrastructure as Code. This website is my personal sandbox. Here, you can read my blog, look through my notes, search my technical repository, or get in touch to collaborate.

Hi, I'm a Solutions Architect.I specialize in .NET, Angular, and cloud deployment via AWS CDK. I write code for the frontend, backend, and infrastructure. This website is my personal sandbox. Here, you can read my blog, look through my notes, search my technical repository, or get in touch to collaborate.



Hi, I'm a Solutions Architect.I build full-stack applications with .NET and Angular, and deploy them using Infrastructure as Code (IaC) via AWS CDK. This website is my personal sandbox. Here, you can read my blog, look through my notes, search my technical repository, or get in touch to collaborate.

*/
