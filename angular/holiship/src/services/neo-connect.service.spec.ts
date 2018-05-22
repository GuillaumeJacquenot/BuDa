import { TestBed, inject } from '@angular/core/testing';

import { NeoConnectService } from './neo-connect.service';

describe('NeoConnectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NeoConnectService]
    });
  });

  it('should be created', inject([NeoConnectService], (service: NeoConnectService) => {
    expect(service).toBeTruthy();
  }));
});
