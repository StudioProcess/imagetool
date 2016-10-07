import { Injectable } from '@angular/core';

interface SessionData {
  route?: string;
  token?: string;
  userData?: {};
}

@Injectable()
export class SessionService {
  
  private data: SessionData;
  
  constructor() {
    this.data = {
      route: null,
      token: null,
      userData : {}
    };
  }
  
  store(data: SessionData): SessionData {
    Object.assign(this.data, data);
    localStorage.setItem('session', JSON.stringify(this.data));
    return this.data;
  }
  
  retrieve(): SessionData {
    let data = JSON.parse( localStorage.getItem('session') );
    if (data) this.data = data;
    return this.data;
  }

}
