import { Component, OnInit, ElementRef } from '@angular/core';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  constructor(private session: SessionService, private el: ElementRef) { }

  ngOnInit() {
    let user = this.session.get().user;
    let color = 'black';
    if (user && user.theme_color && user.theme_color.accent) {
      color = user.theme_color.accent;
    }
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      a:hover, .activeLink { color: ${color} !important; }
      a:hover .badge, .activeLink .badge { background: ${color} !important; }
    `;
    let el = this.el.nativeElement;
    el.insertBefore(style, el.firstChild);
  }

  allowTitleImage() {
    let images = this.session.get().images;
    let sucessfulImagesPresent = images.some( (img) => 
      img.uploadState ? // IF there is an uploadState set...
      img.uploadState.success : // ...it HAS to be 'success'
      true);
    let inprogressImagesPresent = images.some( (img) => 
      img.uploadState ? img.uploadState.uploading || img.uploadState.processing : false);
    return sucessfulImagesPresent && !inprogressImagesPresent;
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
