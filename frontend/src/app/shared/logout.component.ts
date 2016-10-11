import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: `<div>Sie werden ausgeloggt...</div>`
})
export class LogoutComponent implements OnInit {

  constructor(private backend: BackendService, private router: Router) { }

  ngOnInit() {
    console.log('logging out...');
    this.backend.logout().subscribe({
      next: (res) => {
        console.info('success logging out', res.json());
        this.router.navigate(['login']);
      },
      error: (err) => {
        console.log('error logging out', err.json());
        this.router.navigate(['login']);
      }
    });
  }

}
