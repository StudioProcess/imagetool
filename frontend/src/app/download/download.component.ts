import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-download',
  templateUrl: 'download.component.html',
  styleUrls: ['download.component.scss']
})
export class DownloadComponent implements OnInit {
  images = [];
  emptyImagesArray: boolean;

  constructor(private backend: BackendService, private session: SessionService) { }

  ngOnInit() {
    this.images = this.session.get().images;
    if(this.images.length == 0){
      this.emptyImagesArray = true;
    } else {
      this.emptyImagesArray = false;
    }
  }

}
