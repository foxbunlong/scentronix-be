import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { TerminusModule } from '@nestjs/terminus';
import { HealthModule } from './health.module';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule, HealthModule],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should successfully get highest priority server', () => {
    const endpoints = [
      {
        url: 'https://gitlab.com',
        priority: 4,
        name: 'gitlab', // Support logging
      },
      {
        url: 'https://google.com.vn',
        priority: 1,
        name: 'google', // Support logging
      },
    ];
    expect(service.getHighestPriorityLiveEndpoint(endpoints)).toEqual({
      url: 'https://google.com.vn',
      priority: 1,
      name: 'google',
    });
  });

  it('Should successfully get one server if only 1 server found', () => {
    const endpoints = [
      {
        url: 'https://gitlab.com',
        priority: 4,
        name: 'gitlab', // Support logging
      },
    ];
    expect(service.getHighestPriorityLiveEndpoint(endpoints)).toEqual({
      url: 'https://gitlab.com',
      priority: 4,
      name: 'gitlab',
    });
  });

  it('Should throw bad gateway exception if list of endpoints is empty', () => {
    const endpoints = [];
    try {
      service.getHighestPriorityLiveEndpoint(endpoints);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.status).toEqual(HttpStatus.BAD_GATEWAY);
    }
  });

  it('Should successfully get highest priority live server if 1 or more server(s) is down', async () => {
    const endpoints = [
      {
        url: 'https://does-not-work.perfume.new',
        priority: 1,
        name: 'does-not-work', // Support logging
      },
      {
        url: 'https://gitlab.com',
        priority: 4,
        name: 'gitlab', // Support logging
      },
      {
        url: 'http://app.scnt.me',
        priority: 3,
        name: 'app-scnt', // Support logging
      },
      {
        url: 'https://offline.scentronix.com',
        priority: 2,
        name: 'offline', // Support logging
      },
    ];
    const liveEndpoints = await service.getLiveEndpoints(endpoints);
    expect(service.getHighestPriorityLiveEndpoint(liveEndpoints)).toEqual({
      url: 'http://app.scnt.me',
      priority: 3,
      name: 'app-scnt',
    });
  });

  it('Should successfully get highest priority live server if all servers are up', async () => {
    const endpoints = [
      {
        url: 'https://gitlab.com',
        priority: 4,
        name: 'gitlab', // Support logging
      },
      {
        url: 'https://google.com.vn',
        priority: 1,
        name: 'google', // Support logging
      },
    ];
    const liveEndpoints = await service.getLiveEndpoints(endpoints);
    const result = service.getHighestPriorityLiveEndpoint(liveEndpoints);
    expect(result).toEqual({
      url: 'https://google.com.vn',
      priority: 1,
      name: 'google',
    });
  });

  it('Should throw bad gateway exception if all servers are down', async () => {
    const endpoints = [
      {
        url: 'https://does-not-work.perfume.new',
        priority: 1,
        name: 'does-not-work', // Support logging
      },
      {
        url: 'https://offline.scentronix.com',
        priority: 2,
        name: 'offline', // Support logging
      },
    ];
    try {
      await service.getLiveEndpoints(endpoints); // No returned data
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.status).toEqual(HttpStatus.BAD_GATEWAY);
    }
  });
});
