import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
// import { Http, Response, Headers, RequestOptions } from '@angular/http';
// import { Observable }     from 'rxjs/Observable';
// import 'rxjs/Rx';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor (private api: BackendService) {}

  ngOnInit() {}

  loginUser(email: string, password: string) {
    this.api.login(email, password).subscribe({
      next: (res) => {
        console.log('next', res);
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
