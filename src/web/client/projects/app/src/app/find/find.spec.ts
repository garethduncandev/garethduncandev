import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Find } from './find';

describe('Find', () => {
  let component: Find;
  let fixture: ComponentFixture<Find>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Find],
    }).compileComponents();

    fixture = TestBed.createComponent(Find);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
