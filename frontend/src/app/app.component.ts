import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BackendService } from './backend.service';
import { SessionService } from './session.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private api: BackendService,
    private session: SessionService
  ) {
    let sessionData = session.retrieve();
    console.log('SESSION:', sessionData);
    // api.test();
  }
  
  ngOnInit() {
    // Always keep stored route up to date
    this.router.events
      .filter(e => e instanceof NavigationEnd)
      .subscribe((e) => {
        console.log('ROUTE:', e.url);
        this.session.store({route: e.url});
    });
  }
}
