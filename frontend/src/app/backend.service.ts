import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable()
export class BackendService {

  API_URL = 'http://ito.process.studio/api';

  private headers = new Headers();
  
  constructor(private http: Http, private session: SessionService) {
    let token = session.get().token;
    if (token) {
      this.headers.set('X-Access-Token', token);
    }
  }
 
  // Process response for token
  // Works with Observable.map and Observable.catch
  // (Defined with arrow function to ensure proper this-binding)
  processToken = (response) => {
    if (response.isProgressEvent) return response; // Skip progress response
    if (response.headers && response.headers.get('Content-Type') == 'application/json') {
      let responseJSON = response.json();
      if (responseJSON.token) {
        this.headers.set('X-Access-Token', responseJSON.token);
        this.session.store({token: responseJSON.token});
      }
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

  login(email:string, password:string): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, {email, password})
      .filter(res => !res['isProgressEvent'])
      .map(this.processToken)
      .catch(this.processToken);
  }

  logout(): Observable<any> {
    return this.http.get(`${this.API_URL}/logout`, {headers:this.headers})
      .filter(res => !res['isProgressEvent'])
      .map(this.processToken)
      .catch(this.processToken);
  }

  resetSession(): Observable<any> {
    return this.http.get(`${this.API_URL}/session/reset`, {headers:this.headers})
      .filter(res => !res['isProgressEvent'])
      .map(this.processToken)
      .catch(this.processToken);
  }

  userData() {
    return this.http.get(`${this.API_URL}/session/userdata`, {headers:this.headers})
      .map(this.processToken)
      .catch(this.processToken);
  }

  addImage(file: File) {
    let data: FormData = new FormData();
    data.append('images[]', file);
    return this.http.post(`${this.API_URL}/session/images`, data, {headers:this.headers})
      .map(this.processToken)
      .catch(this.processToken) as Observable<Response>;
  }

  removeImage(id: number): Observable<any> {
    let search = `image_id=${id}`;
    return this.http.delete(`${this.API_URL}/session/images`, {headers:this.headers, search})
      .filter(res => !res['isProgressEvent'])
      .map(this.processToken)
      .catch(this.processToken);
  }

  getImages() {
    return this.http.get(`${this.API_URL}/session/images`, {headers:this.headers})
      .map(this.processToken)
      .catch(this.processToken);
  }

  setCover(id: number, options) {
    let body = Object.assign({'image_id': id}, options);
    return this.http.post(`${this.API_URL}/session/cover`, body, {headers:this.headers})
      .map(this.processToken)
      .catch(this.processToken);
  }

  getCover() {
    return this.http.get(`${this.API_URL}/session/cover`, {headers:this.headers})
      .map(this.processToken)
      .catch(this.processToken);
  }

  getArchive() {
    return this.http.get(`${this.API_URL}/session/archive`, {headers:this.headers})
      .map(this.processToken)
      .catch(this.processToken);
  }

}
