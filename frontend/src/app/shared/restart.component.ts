import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { BackendService } from '../backend.service';
import { SessionService } from '../session.service';
import { ResumeService } from '../resume.service';


@Component({
  selector: 'app-restart',
  template: `<div>Sie werden weitergeleitet...</div>`
})
export class RestartComponent implements OnInit {

  constructor(
    private router: Router, 
    private backend: BackendService, 
    private session: SessionService,
    private resume: ResumeService
  ) {}

  ngOnInit() {
    Observable.fromPromise(this.resume.resumeIsDone())
    .ignoreElements() // make sure this doesn't emit values
    .do(() => console.log('restarting session...'))
    .concat(this.backend.resetSession())
    .subscribe({
      next: (res) => {
        console.info('success restarting session', res.json());
        let session = this.session.get();
        // keep user and token data
        this.session.reset( {user:session.user, token:session.token} ); 
        this.router.navigate(['upload']);
      },
      error: (err) => {
        console.log('error restarting session', err.json());
        this.router.navigate(['upload']);
      }
    });
  }

}
