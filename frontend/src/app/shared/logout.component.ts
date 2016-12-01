import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { BackendService } from '../backend.service';
import { SessionService } from '../session.service';
import { ResumeService } from '../resume.service';

@Component({
  selector: 'app-logout',
  template: `<div>Sie werden ausgeloggt...</div>`
})
export class LogoutComponent implements OnInit {

  constructor(
    private router: Router, 
    private backend: BackendService, 
    private session: SessionService,
    private resume: ResumeService
  ) {}

  ngOnInit() {
    // Don't process logout for Rudi ("Rudi Rule")
    let user = this.session.get().user;
    if ( user && user.id == 10 ) {
      this.router.navigate(['login']);
      return;
    }
    
    Observable.fromPromise(this.resume.resumeIsDone())
    .ignoreElements() // make sure this doesn't emit values
    .do(() => console.log('logging out...'))
    .concat(this.backend.logout())
    .subscribe({
      next: (res) => {
        console.info('success logging out', res.json());
        this.session.reset();
        this.router.navigate(['login']);
      },
      error: (err) => {
        console.log('error logging out', err.json());
        this.router.navigate(['login']);
      }
    });
  }

}
