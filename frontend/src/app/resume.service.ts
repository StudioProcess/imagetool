import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs/Rx';
import { BackendService } from './backend.service';
import { SessionService } from './session.service';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class ResumeService {
  private _resume$: Observable<any>;
  private _done: Promise<any>;
  
  constructor(
    private router:Router,
    private backend:BackendService,
    private session:SessionService,
    private analytics:AnalyticsService
  ) { 
    /*
     get user data
     -> error (401 unauthorized)
        -> navigate to login page
     -> success
        -> get images
           -> save to local session
           -> navigate to stored route
     */

    // Refresh session token
    let refreshSession = this.backend.refreshSession();
    
    // Update local session data
    let updateSession = this.backend.sessionData().do(res => {
      this.session.resume(res.json().data); // save session data
    });
     
     
    /*
      ok we need a promise-like observable that tells us if the resume is done.
      
     */
    let resolveDone;
    this._done = new Promise((resolve, reject) => {
      resolveDone = resolve;
    });

    let resumeSession = refreshSession
      .switchMapTo(updateSession)
      .do(res => {
        console.log('resuming');
        this.analytics.init();
        // Don't resume to URL if /login, /logout or /restart are requested
        if (['/login', '/logout', '/restart'].indexOf(this.router.url) > -1) return;
        let url = this.session.get().route;
        if (!url) url = '/upload';
        this.router.navigateByUrl(url);
      }).catch(err => {
        if (err.status == 401) { // Unauthorized i.e. not logged in
          console.info('No valid token, redirecting to login', err.json());
        } else {
          console.error('resume error', err);
        }
        this.router.navigate(['login']);
        return Observable.empty();
      }).finally(resolveDone);
    
    this._resume$ = resumeSession;
  }

  // Refresh and update session.
  resumeSession() {
    return this._resume$;
  }
  
  // Return a promise that resolves when the first resume completes succesfully.
  resumeIsDone() {
    return this._done;
  }
}
