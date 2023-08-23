import { TestBed } from '@angular/core/testing';

import { ApiStateService } from './api-state.service';

describe('ApiStateService', () => {
  let service: ApiStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
