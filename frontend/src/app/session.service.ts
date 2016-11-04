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
  useSticker?: boolean;
}

@Injectable()
export class SessionService {
  
  private _data: SessionData;
  private dataSubject: BehaviorSubject<SessionData>;
  data: Observable<SessionData>;

  constructor() {
    this._data = this.emptyData(); // Initialize session data with empty default values
    let storedData = this.retrieve();
    if (storedData) {
      Object.assign(this._data, storedData);
    }
    this.dataSubject = new BehaviorSubject(this._data);
    this.data = this.dataSubject.asObservable();
  }
  
  private emptyData(initial: SessionData = {}): SessionData {
    return Object.assign({
      route: null,
      token: null,
      user: {},
      images: [],
      cover_settings: {},
      cover_urls: {},
      selectedImage: null,
      useSticker: false
    }, initial);
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
  // Can provide partial initial values
  reset(initial: SessionData = {}) {
    this._data = this.emptyData(initial);
    this.store();
  }
  
  
  // Resume sesssion with new data. Discard (almost all) old data if user has changed.
  resume(newData: SessionData) {
    let oldData = this.get();
    if (oldData.user && newData.user && oldData.user.id != newData.user.id) {
      // console.log('User changed.');
      // User change. Only keep token and route.
      this.reset({ token:oldData.token, route:oldData.route });
    }
    this.store(newData); // Save session data
  }
  
}
