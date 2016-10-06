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
  
  error: 'LoginWrong'|'Other' = null;
  errorMessage: string;
  submitDisabled: boolean;

  ngOnInit() {}

  loginUser(email: string, password: string) {
    this.error = null;
    this.errorMessage = null;
    this.submitDisabled = true;
    this.api.login(email, password).subscribe({
      next: (res) => {
        console.log('login success', res.json());
        this.session.userData = res.json().data; // save user data
        this.router.navigate(['/upload']); // navigate to upload view
      },
      error: (res) => {
        console.log('login error', res.json());
        this.submitDisabled = false;
        if (res.status == 401) { // 401 Unauthorized
          // Show email/password error callout
          this.error = 'LoginWrong';
        } else {
          // Show catchall error callout
          this.error = 'Other';
          this.errorMessage = res.status + ' ' + res.json().message;
        }
      }
    });
  }

}
