import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { BackendService } from './backend.service';
import { SessionService } from './session.service';

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
    private session: SessionService
  ) {
    console.log('SESSION:', session.get());
  }
  
  ngOnInit() {
    // Resume the session (if possible)
    this.resumeSession().finally(() => {
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
  
  resumeSession() {
    /*
     get user data
     -> error (401 unauthorized)
        -> navigate to login page
     -> success
        -> get images
           -> save to local session
           -> navigate to stored route
     */
    
    // Update local session data
    let updateSession = this.backend.sessionData().do(res => {
      this.session.store(res.json().data); // Save session data
    });
    
    return updateSession.do(res => {
      console.log('resuming', res.json());
      let url = this.session.get().route;
      if (!url) url = '/upload';
      console.info('resuming to', url);
      this.router.navigateByUrl(url);
    }).catch(err => {
      if (err.status == 401) { // Unauthorized i.e. not logged in
        console.info('No valid token, redirecting to login', err);
        this.router.navigate(['login']);
      } else {
        console.error('resume error', err);
      }
      return Observable.empty();
    });
  }
}
