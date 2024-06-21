import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';

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

// const endpoints = [
//   {
//     url: 'https://does-not-work.perfume.new',
//     priority: 1,
//     name: 'does-not-work', // Support logging
//   },
//   {
//     url: 'https://offline.scentronix.com',
//     priority: 2,
//     name: 'offline', // Support logging
//   },
// ];

// const endpoints = [
//   {
//     url: 'https://does-not-work.perfume.new',
//     priority: 1,
//     name: 'does-not-work', // Support logging
//   },
//   {
//     url: 'https://gitlab.com',
//     priority: 4,
//     name: 'gitlab', // Support logging
//   },
//   {
//     url: 'http://app.scnt.me',
//     priority: 3,
//     name: 'app-scnt', // Support logging
//   },
//   {
//     url: 'https://offline.scentronix.com',
//     priority: 2,
//     name: 'offline', // Support logging
//   },
// ];

@ApiTags('HealthCheck')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get('findServer')
  @HealthCheck()
  async findServer() {
    const checks = await endpoints.map(
      (endpoint) => () =>
        this.http.pingCheck(endpoint.name, endpoint.url, {
          timeout: 5000,
        }),
    );

    try {
      const checkResponse = await this.health.check(checks);
      if (checkResponse.status === 'ok') {
        const liveEndpoints = [];
        endpoints.forEach((endpoint) => {
          if (checkResponse.details[endpoint.name].status === 'up') {
            liveEndpoints.push(endpoint);
          }
        });
        return this.getHighestPriorityLiveEndpoint(liveEndpoints);
      }
    } catch (error) {
      const liveEndpoints = [];
      endpoints.forEach((endpoint) => {
        if (error.response.details[endpoint.name].status === 'up') {
          liveEndpoints.push(endpoint);
        }
      });
      return this.getHighestPriorityLiveEndpoint(liveEndpoints);
    }

    // Cannot be reached
    return 'This response cannot be reached';
  }

  getHighestPriorityLiveEndpoint(liveEndpoints: any[]) {
    const sortedEndpoints = liveEndpoints.sort((a, b) => {
      if (a.priority < b.priority) {
        return -1;
      }
      if (a.priority > b.priority) {
        return 1;
      }
      return 0;
    });
    return sortedEndpoints[0];
  }

  @Get('check')
  @HealthCheck()
  checkResponse() {
    return this.health.check([
      () =>
        this.http.responseCheck(
          endpoints[1].name,
          endpoints[1].url,
          (res) => res.status === 204,
          {
            timeout: 5000,
          },
        ),
    ]);
  }
}
