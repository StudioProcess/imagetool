import { Component, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/Rx';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor (private http: Http) {}

  ngOnInit() {
  }

  loginUser(userLogin: string, passwordLogin: string) {

    var url = 'http://ito.process.studio/api/user/login';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify({ email: userLogin, password: passwordLogin });

    this.http.post(url, body, options)
                  .map(this.extractData)
                  .catch(this.handleError).subscribe();
    //post
  }

  private extractData(res: Response) {
   let body = res.json();
   console.log(body.data);
   return body.data || { };
 }

  private handleError (error: any) {
   // In a real world app, we might use a remote logging infrastructure
   // We'd also dig deeper into the error to get a better message
   let errMsg = (error.message) ? error.message :
     error.status ? `${error.status} - ${error.statusText}` : 'Server error';
   console.error(errMsg); // log to console instead
   return Observable.throw(errMsg);
 }

}
