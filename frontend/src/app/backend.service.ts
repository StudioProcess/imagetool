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
        // console.log('new token:', responseJSON.token);
        this.headers.set('X-Access-Token', responseJSON.token);
        this.session.store({token: responseJSON.token});
      }
    }
    if (!response.ok) return Observable.throw(response); // for use with catch
    return response; // for use with map
  }
  
  // Build a request using a factory function
  // By using Observable.defer and a factory, we ensure the request is created when subscribed.
  // This way the latest token is used.
  // Also add token processing.
  buildRequest = (requestFactory, withProgressEvents = false): Observable<any> => {
    let req = Observable.defer(requestFactory);
    // Filter out progress events (default) or not
    if (!withProgressEvents) {
      req = req.filter( res => !res['isProgressEvent'] );
    }
    // Process tokens in responses
    req = req.map(this.processToken).catch(this.processToken);
    return req;
  }
  

  login(email:string, password:string): Observable<any> {
    return this.buildRequest(
      () => this.http.post(`${this.API_URL}/login`, {email, password})
    );
  }

  logout(): Observable<any> {
    return this.buildRequest(
      () => this.http.get(`${this.API_URL}/logout`, {headers:this.headers})
    );
  }

  resetSession(): Observable<any> {
    return this.buildRequest(
      () => this.http.get(`${this.API_URL}/session/reset`, {headers:this.headers})
    );
  }

  userData(): Observable<any> {
    return this.buildRequest(
      () => this.http.get(`${this.API_URL}/session/userdata`, {headers:this.headers})
    );
  }

  addImage(file: File) {
    let data: FormData = new FormData();
    data.append('images[]', file);
    return this.buildRequest(
      () => this.http.post(`${this.API_URL}/session/images`, data, {headers:this.headers}),
      true
    );
  }

  removeImage(id: number): Observable<any> {
    let search = `image_id=${id}`;
    return this.buildRequest(
      () => this.http.delete(`${this.API_URL}/session/images`, {headers:this.headers, search})
    );
  }

  getImages(): Observable<any> {
    return this.buildRequest(
      () => this.http.get( `${this.API_URL}/session/images`, {headers:this.headers} )
    );
  }

  setCover(id: number, options) {
    let body = Object.assign({'image_id': id}, options);
    return this.buildRequest(
      () => this.http.post(`${this.API_URL}/session/cover`, body, {headers:this.headers})
    );
  }

  getCover() {
    return this.buildRequest(
      () => this.http.get(`${this.API_URL}/session/cover`, {headers:this.headers})
    );
  }

  getArchive() {
    return this.buildRequest(
      () => this.http.get(`${this.API_URL}/session/archive`, {headers:this.headers})
    );
  }

}
