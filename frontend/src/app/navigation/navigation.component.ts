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
    this.userColor = this.session.get().user.theme_color;
  }

  allowTitleImage(){ // image uploaded?
    if(this.session.get().images.length == 0){
      return false;
    } else {
      return true;
    }
  }

  allowEditImage(){ // image uploaded AND titleimage chosen?
    if((this.session.get().images.length != 0) && (this.session.get().selectedImage != null)){
      return true;
    } else {
      return false;
    }
  }

  allowDownload(){ // image uploaded AND titleimage chosen AND titleimage processed?
    if((this.session.get().images.length != 0) && (this.session.get().selectedImage != null)){
      return true;
    } else {
      return false;
    }
  }

}
