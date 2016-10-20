import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { BackendService } from './backend.service';
import { SessionService } from './session.service';
import { ResumeService } from './resume.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  
  loading = true;
  
  constructor(
    private router: Router,
    private backend: BackendService,
    private session: SessionService,
    private resume: ResumeService
  ) {
    console.log('SESSION:', session.get());
  }
  
  ngOnInit() {
    // Resume the session (if possible)
    this.resume.resumeSession().finally(() => {
      this.loading = false;
      
      // Keep stored route up to date
      this.router.events
        .filter(e => e instanceof NavigationEnd)
        .subscribe((e) => {
          console.log('ROUTE:', e.url);
          this.session.store({route: e.url});
      });
      
      console.log("RESUME DONE");
    }).subscribe();
  }
  
}
