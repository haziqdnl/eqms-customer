import { TestBed } from '@angular/core/testing';

import { ApiOutletService } from './api-outlet.service';

describe('ApiOutletService', () => {
  let service: ApiOutletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiOutletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
