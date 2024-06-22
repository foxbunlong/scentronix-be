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
    const liveEndpoints = await this.getLiveEndpoints(endpoints);
    return this.getHighestPriorityLiveEndpoint(liveEndpoints);
  }

  async getLiveEndpoints(_endpoints: any[]) {
    const checks = _endpoints.map(
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
        _endpoints.forEach((endpoint) => {
          if (checkResponse.details[endpoint.name].status === 'up') {
            liveEndpoints.push(endpoint);
          }
        });
        return liveEndpoints;
      }
    } catch (error) {
      const liveEndpoints = [];
      _endpoints.forEach((endpoint) => {
        if (error.response.details[endpoint.name].status === 'up') {
          liveEndpoints.push(endpoint);
        }
      });
      return liveEndpoints;
    }
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
}
