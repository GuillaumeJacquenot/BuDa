import { TestBed, inject } from '@angular/core/testing';

import { ExternalMessagesService } from './external-messages.service';

describe('ExternalMessagesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExternalMessagesService]
    });
  });

  it('should be created', inject([ExternalMessagesService], (service: ExternalMessagesService) => {
    expect(service).toBeTruthy();
  }));
});
