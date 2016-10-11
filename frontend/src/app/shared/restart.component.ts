import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restart',
  template: `<div>Sie werden weitergeleitet...</div>`
})
export class RestartComponent implements OnInit {

  constructor(private backend: BackendService, private router: Router) { }

  ngOnInit() {
    console.log('restarting session...');
    this.backend.resetSession().subscribe({
      next: (res) => {
        console.info('success restarting session', res.json());
        this.router.navigate(['upload']);
      },
      error: (err) => {
        console.log('error restarting session', err.json());
        this.router.navigate(['upload']);
      }
    });
  }

}
