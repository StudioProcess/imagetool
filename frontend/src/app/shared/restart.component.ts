import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-restart',
  template: `<div>Sie werden weitergeleitet...</div>`
})
export class RestartComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('RESTART component');
  }

}
