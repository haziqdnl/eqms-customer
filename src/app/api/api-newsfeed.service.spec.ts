import { TestBed } from '@angular/core/testing';

import { ApiNewsfeedService } from './api-newsfeed.service';

describe('ApiNewsfeedService', () => {
  let service: ApiNewsfeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiNewsfeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
