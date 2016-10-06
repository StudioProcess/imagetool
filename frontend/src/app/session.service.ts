import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {
  
  token = null;
  userData = {};
  
  constructor() { }

}
