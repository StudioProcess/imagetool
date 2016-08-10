import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
  directives: [ FooterComponent ]
})
export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
