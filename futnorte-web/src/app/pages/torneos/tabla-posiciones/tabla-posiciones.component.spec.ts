import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaPosicionesComponent } from './tabla-posiciones.component';

describe('TablaPosicionesComponent', () => {
  let component: TablaPosicionesComponent;
  let fixture: ComponentFixture<TablaPosicionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaPosicionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaPosicionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
