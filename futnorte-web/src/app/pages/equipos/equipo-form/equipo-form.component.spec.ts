import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipoFormComponent } from './equipo-form.component';

describe('EquipoFormComponent', () => {
  let component: EquipoFormComponent;
  let fixture: ComponentFixture<EquipoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
