import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logout',
  template: `<div>Sie werden ausgeloggt...</div>`
})
export class LogoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('LOGOUT component');
  }

}
