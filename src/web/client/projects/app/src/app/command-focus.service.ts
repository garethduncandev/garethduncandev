import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommandFocusService {
  private readonly focus = new Subject<void>();
  public readonly requestFocus$ = this.focus.asObservable();

  public requestFocus(): void {
    this.focus.next();
  }
}
