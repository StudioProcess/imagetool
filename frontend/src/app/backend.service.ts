import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class BackendService {

  constructor(private http: Http) { }

  API_URL = 'http://ito.process.studio/api';

  private token: string = null;

  private processToken(response) {
    console.log('processToken:', response);
    return response;
  }

  test() {
    this.login('lol', 'lol').subscribe();
  }

  login(email:string, password:string) {
    return this.http.post( `${this.API_URL}/login`, {email, password} )
      .map(this.processToken);
  }

  logout() {
    return this.http.get( `${this.API_URL}/logout` )
      .map(this.processToken);
  }

  resetSession() {
    return this.http.get( `${this.API_URL}/session/reset` )
      .map(this.processToken);
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
