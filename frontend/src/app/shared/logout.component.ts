import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-logout',
  template: `<div>Sie werden ausgeloggt...</div>`
})
export class LogoutComponent implements OnInit {

  constructor(
    private router: Router, 
    private backend: BackendService, 
    private session: SessionService
  ) {}

  ngOnInit() {
    console.log('logging out...');
    this.backend.logout().subscribe({
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
