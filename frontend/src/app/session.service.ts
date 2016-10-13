import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

interface SessionData {
  route?: string;
  token?: string;
  userData?: any;
  images?: any[];
  selectedImage?: any;
}

@Injectable()
export class SessionService {

  private _data: SessionData;
  private dataSubject: BehaviorSubject<SessionData>;
  data: Observable<SessionData>;

  constructor() {
    this._data = {
      route: null,
      token: null,
      userData: {},
      images: [],
      selectedImage: null
    };
    let storedData = this.retrieve();
    if (storedData) this._data = storedData;
    this.dataSubject = new BehaviorSubject(this._data);
    this.data = this.dataSubject.asObservable();
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
}
