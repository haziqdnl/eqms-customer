import { TestBed } from '@angular/core/testing';

import { ApiProfileService } from './api-profile.service';

describe('ApiProfileService', () => {
  let service: ApiProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
