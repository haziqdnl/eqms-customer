import { TestBed } from '@angular/core/testing';

import { ApiUtilityService } from './api-utility.service';

describe('ApiUtilityService', () => {
  let service: ApiUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
