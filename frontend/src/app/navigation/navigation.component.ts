import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  userColor: string;

  constructor(private session: SessionService) { }

  ngOnInit() {
    this.userColor = this.session.get().userData.theme_color;
  }

}
