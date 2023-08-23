import { TestBed } from '@angular/core/testing';

import { ApiApptService } from './api-appt.service';

describe('ApiApptService', () => {
  let service: ApiApptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiApptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
