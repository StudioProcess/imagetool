import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { BackendService } from '../backend.service';

declare var jQuery: any;

@Component({
  selector: 'app-title-image',
  templateUrl: 'title-image.component.html',
  styleUrls: ['title-image.component.scss']
})
export class TitleImageComponent implements OnInit {
  images = [];
  selectedImage;
  emptyImagesArray: boolean;

  constructor(private backend: BackendService, private session: SessionService) {}

  ngOnInit() {

    jQuery(() => { // scroll to top
      jQuery(".progress-meter").scrollTop();
    });

    this.images = this.session.get().images;
    if(this.images.length == 0){
      this.emptyImagesArray = true;
    } else {
      this.emptyImagesArray = false;
    }
    this.selectedImage = this.session.get().selectedImage;
  }

  allowEditImage(){ // image uploaded AND titleimage chosen?
    if((this.session.get().images.length != 0) && (this.session.get().selectedImage != null)){
      return true;
    } else {
      return false;
    }
  }

  selectTitleImage(image) {
    this.selectedImage = image;
    this.session.set({selectedImage: image});
  }

}
