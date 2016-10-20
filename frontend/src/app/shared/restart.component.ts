import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { SessionService } from '../session.service';


@Component({
  selector: 'app-restart',
  template: `<div>Sie werden weitergeleitet...</div>`
})
export class RestartComponent implements OnInit {

  constructor(
    private router: Router, 
    private backend: BackendService, 
    private session: SessionService
  ) {}

  ngOnInit() {
    console.log('restarting session...');
    this.backend.resetSession().subscribe({
      next: (res) => {
        console.info('success restarting session', res.json());
        this.session.reset();
        this.router.navigate(['upload']);
      },
      error: (err) => {
        console.log('error restarting session', err.json());
        this.router.navigate(['upload']);
      }
    });
  }

}
