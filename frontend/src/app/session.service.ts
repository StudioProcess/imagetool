import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

interface SessionData {
  route?: string;
  token?: string;
  user?: any;
  images?: any[];
  cover_settings?: any;
  cover_urls?: any;
  selectedImage?: any;
}

@Injectable()
export class SessionService {

  private _data: SessionData;
  private dataSubject: BehaviorSubject<SessionData>;
  data: Observable<SessionData>;

  constructor() {
    this.initData();
    let storedData = this.retrieve();
    if (storedData) {
      Object.assign(this._data, storedData);
    }
    this.dataSubject = new BehaviorSubject(this._data);
    this.data = this.dataSubject.asObservable();
  }
  
  // Initialize session data with empty default values
  private initData() {
    this._data = {
      route: null,
      token: null,
      user: {},
      images: [],
      cover_settings: {},
      cover_urls: {},
      selectedImage: null
    };
  }

  private retrieve(): SessionData {
    return JSON.parse( localStorage.getItem('session') );
  }

  store(data: SessionData = {}) {
    Object.assign(this._data, data);
    localStorage.setItem('session', JSON.stringify(this._data));
    this.dataSubject.next(this.get()); // Push copy of data to observers
  }

  // Alias of store
  set(data: SessionData = {}) {
    this.store(data);
  }

  get(): SessionData {
    return Object.assign({}, this._data); // Return copy of data
  }
  
  // Reset data to empty default values and store them
  reset() {
    this.initData();
    this.store();
  }
}
