import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  user;

  constructor(private session: SessionService) { }

  ngOnInit() {
    this.user = this.session.get().user;
  }

}
