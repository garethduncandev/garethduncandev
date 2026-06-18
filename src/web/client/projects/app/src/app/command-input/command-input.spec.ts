import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandInput } from './command-input';

describe('CommandInput', () => {
  let component: CommandInput;
  let fixture: ComponentFixture<CommandInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandInput],
    }).compileComponents();

    fixture = TestBed.createComponent(CommandInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
