import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorneoFixtureComponent } from './torneo-fixture.component';

describe('TorneoFixtureComponent', () => {
  let component: TorneoFixtureComponent;
  let fixture: ComponentFixture<TorneoFixtureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorneoFixtureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TorneoFixtureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
