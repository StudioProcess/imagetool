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
  isProcessing: boolean = false;

  constructor(private backend: BackendService, private session: SessionService) { }

  ngOnInit() {
    this.images = this.session.get().images;
    this.emptyImagesArray = !this.images.length;
  }
  
  onDownloadButtonClick(e) {
    this.isProcessing = true;
    this.backend.getArchive().subscribe(res => {
      console.log(res.json());
      window.location.href = "http://ito.process.studio/api/public/" + res.json().data.archive;
      this.isProcessing = false;
    }, err => {
      console.log(err);
      this.isProcessing = false;
    });
  }

}
