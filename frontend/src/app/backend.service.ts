import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class BackendService {

  constructor(private http: Http) { }

  API_URL = 'http://ito.process.studio/api';

  private token: string = null;

  // Process response for token
  // Works with Observable.map and Observable.catch
  private processToken(response) {
    if ( response.headers.get('Content-Type') == 'application/json') {
      let responseJSON = response.json();
      if (responseJSON.token) this.token = responseJSON.token;
    }
    if (!response.ok) return Observable.throw(response); // for use with catch
    return response; // for use with map
  }

  test() {
    this.login('lol', 'lol').subscribe({
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

  login(email:string, password:string) : Observable<any> {
    return this.http.post(`${this.API_URL}/login`, {email, password})
      .map(this.processToken)
      .catch(this.processToken);
  }

  logout() {
    let headers = new Headers({'X-Access-Token': this.token});
    return this.http.get(`${this.API_URL}/logout`, {headers})
      .map(this.processToken)
      .catch(this.processToken);
  }

  resetSession() {
    let headers = new Headers({'X-Access-Token': this.token});
    return this.http.get(`${this.API_URL}/session/reset`, {headers})
      .map(this.processToken)
      .catch(this.processToken);
  }

  userData() {
    let headers = new Headers({'X-Access-Token': this.token});
    return this.http.get(`${this.API_URL}/userdata`, {headers})
      .map(this.processToken)
      .catch(this.processToken);
  }

  addImage() {

  }

  removeImage() {

  }

  getImages() {

  }

  setCover() {

  }

  getCover() {

  }

  getArchive() {

  }

}
