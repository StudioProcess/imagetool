import { Injectable } from '@angular/core';

@Injectable()
export class BackendService {

  constructor() {
    console.log('backend service instantiated');
  }

  test() {
    console.log('backend service test');
    return 'ok';
  }
  
}
