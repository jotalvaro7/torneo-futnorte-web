import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JugadorSearchComponent } from './jugador-search.component';

describe('JugadorSearchComponent', () => {
  let component: JugadorSearchComponent;
  let fixture: ComponentFixture<JugadorSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JugadorSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JugadorSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
