import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SessionService } from './session.service';

// global google analytics.js
declare var ga: any;

interface PageviewOptions {
  title?: string;
  location?: string;
  page?: string;
}

interface EventOptions {
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
}

@Injectable()
export class AnalyticsService {

  constructor(private router: Router, private session: SessionService) {
    // Track route navigation
    this.router.events
      .filter(e => e instanceof NavigationEnd)
      .subscribe((e: any) => {
        this.sendPageview({
          page: e.urlAfterRedirects,
          title: this.titleFromPath(e.urlAfterRedirects)
        });
    });
  }
  
  private titleFromPath(path: string): string {
    return path.replace('/', '').toUpperCase();
  }
  
  private processId(user) {
    // pad with zeroes
    let id = String("000" + user.id).slice(-3);
    // mangle email
    let name = user.email.replace(/[aeiou]/ig, '').replace(/[@\.]/ig, '/');
    return id + '_' + name;
  }
  
  init() {
    let user = this.session.get().user;
    if (user) {
      // console.log('ANALYTICS: userId', this.processId(user));
      ga('set', 'userId', this.processId(user));
    }
  }
  
  sendPageview(options: PageviewOptions = {}) {
    // console.log('ANALYTICS: pageview', options);
    options['hitType'] = 'pageview';
    ga('send', options);
  }
  
  sendEvent(options: EventOptions) {
    // console.log('ANALYTICS: event', options);
    options['hitType'] = 'event';
    ga('send', options);
  }
  
}
