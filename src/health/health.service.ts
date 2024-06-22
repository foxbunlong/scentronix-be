import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

// const endpoints = [
//   {
//     url: 'https://gitlab.com',
//     priority: 4,
//     name: 'gitlab', // Support logging
//   },
//   {
//     url: 'https://google.com.vn',
//     priority: 1,
//     name: 'google', // Support logging
//   },
// ];

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

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  async findServer() {
    const checks = await endpoints.map(
      (endpoint) => () =>
        this.http.responseCheck(
          endpoint.name,
          endpoint.url,
          (res) => res.status >= 200 && res.status <= 299,
          {
            timeout: 5000,
          },
        ),
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
    if (liveEndpoints.length === 0) {
      throw new HttpException('All servers are down', HttpStatus.BAD_GATEWAY);
    }
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

  checkResponse() {
    return this.health.check([
      () =>
        this.http.responseCheck(
          endpoints[1].name,
          endpoints[1].url,
          (res) => res.status >= 200 && res.status <= 299,
          {
            timeout: 5000,
          },
        ),
    ]);
  }
}
