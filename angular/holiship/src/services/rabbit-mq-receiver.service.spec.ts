import { TestBed, inject } from '@angular/core/testing';

import { RabbitMqReceiverService } from './rabbit-mq-receiver.service';

describe('RabbitMqReceiverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RabbitMqReceiverService]
    });
  });

  it('should be created', inject([RabbitMqReceiverService], (service: RabbitMqReceiverService) => {
    expect(service).toBeTruthy();
  }));
});
