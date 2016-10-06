import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor (
    private api: BackendService, 
    private session: SessionService,
    private router: Router
  ) {}

  ngOnInit() {}

  loginUser(email: string, password: string) {
    this.api.login(email, password).subscribe({
      next: (res) => {
        console.log('login success', res.json());
        this.session.userData = res.json().data; // save user data
        this.router.navigate(['/upload']); // navigate to upload view
      },
      error: (res) => {
        console.log('error', res);
      },
      complete: () => {
        console.log('complete');
      }
    });
  }

}
