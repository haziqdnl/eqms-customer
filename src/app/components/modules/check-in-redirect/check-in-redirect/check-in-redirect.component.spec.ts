import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInRedirectComponent } from './check-in-redirect.component';

describe('CheckInRedirectComponent', () => {
  let component: CheckInRedirectComponent;
  let fixture: ComponentFixture<CheckInRedirectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CheckInRedirectComponent]
    });
    fixture = TestBed.createComponent(CheckInRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
