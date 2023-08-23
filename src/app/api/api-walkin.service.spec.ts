import { TestBed } from '@angular/core/testing';

import { ApiWalkinService } from './api-walkin.service';

describe('ApiWalkinService', () => {
  let service: ApiWalkinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiWalkinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
