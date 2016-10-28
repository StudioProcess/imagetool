import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { BackendService } from '../backend.service';
import { AnalyticsService } from '../analytics.service';

declare var jQuery: any;

@Component({
  selector: 'app-download',
  templateUrl: 'download.component.html',
  styleUrls: ['download.component.scss']
})
export class DownloadComponent implements OnInit {
  images = [];
  coverThumb: string;
  emptyImagesArray: boolean;
  isProcessing: boolean = false;

  constructor(
    private backend: BackendService, 
    private session: SessionService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit() {
    jQuery(() => { // scroll to top
      jQuery(".progress-meter").scrollTop();
    });

    let coverId = this.session.get().cover_settings.image_id;
    this.coverThumb = this.session.get().cover_urls.thumb;
    this.images = this.session.get().images;
    this.emptyImagesArray = !this.images.length;
    this.images = this.images.filter(img => img.id != coverId);
  }

  onDownloadButtonClick(e) {
    this.isProcessing = true;
    this.backend.getArchive().subscribe(res => {
      console.log(res.json());
      window.location.href = res.json().data.archive;
      this.isProcessing = false;
      this.analytics.sendEvent({
        eventCategory: 'Images', 
        eventAction: 'download', 
        eventValue: this.images.length + 1
      });
    }, err => {
      console.log(err);
      this.isProcessing = false;
    });
  }

}
