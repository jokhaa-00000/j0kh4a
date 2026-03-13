import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rentout } from './rentout';

describe('Rentout', () => {
  let component: Rentout;
  let fixture: ComponentFixture<Rentout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rentout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rentout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
