import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { CommandInput } from './command-input/command-input';
import { DoodleComponent } from './doodle/doodle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DoodleComponent, CommandInput],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly routeName = computed(() => this.url());
}
