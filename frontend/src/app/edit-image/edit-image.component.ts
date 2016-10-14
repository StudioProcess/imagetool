import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-edit-image',
  templateUrl: 'edit-image.component.html',
  styleUrls: ['edit-image.component.scss']
})
export class EditImageComponent implements OnInit {
  image;
  titleimageChosen: boolean;

  constructor(private session: SessionService, private backend: BackendService) {}

  ngOnInit() {
    this.image = this.session.get().selectedImage;
    if(this.image == null){
      this.titleimageChosen = false;
    } else {
      this.titleimageChosen = true;
    }
  }

}
