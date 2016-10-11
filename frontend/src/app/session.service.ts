import { Injectable } from '@angular/core';

interface SessionData {
  route?: string;
  token?: string;
  userData?: {};
  images?: any[];
}

@Injectable()
export class SessionService {
  
  private data: SessionData;
  
  constructor() {
    this.data = {
      route: null,
      token: null,
      userData: {},
      images: []
    };
    this.retrieve();
  }
  
  store(data: SessionData = {}): SessionData {
    this.set(data);
    localStorage.setItem('session', JSON.stringify(this.data));
    return this.data;
  }
  
  retrieve(): SessionData {
    let data = JSON.parse( localStorage.getItem('session') );
    if (data) this.set(data);
    return this.data;
  }
  
  get(): SessionData {
    return Object.assign({}, this.data); // Return copy of data
  }
  
  set(data: SessionData = {}): SessionData {
    Object.assign(this.data, data);
    return this.data;
  }

}
