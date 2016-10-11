import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { BackendService } from '../backend.service';


@Component({
  selector: 'app-titleimage',
  templateUrl: 'titleimage.component.html',
  styleUrls: ['titleimage.component.scss']
})
export class TitleimageComponent implements OnInit {
  images = [];
  selectedImageId = -1;

  constructor(private backend: BackendService, private session: SessionService) {}

  ngOnInit() {
    this.images = this.session.get().images;
  }

  selectTitleImage(image) {
    this.selectedImageId = image.data.id;
  }

}
