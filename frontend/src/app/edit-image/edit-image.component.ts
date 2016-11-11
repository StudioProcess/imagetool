import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { BackendService } from '../backend.service';
import { ResumeService } from '../resume.service';
import { AnalyticsService } from '../analytics.service';

declare var jQuery: any;

@Component({
  selector: 'app-edit-image',
  templateUrl: 'edit-image.component.html',
  styleUrls: ['edit-image.component.scss']
})
export class EditImageComponent implements OnInit {
  selectedImage;
  coverURLs: any;
  titleImageSrc: string;
  titleImageChosen: boolean;
  brandNames = ['Abarth', 'Alfa Romeo', 'Audi', 'BMW', 'Chrysler', 'Fiat', 'Fiat Professional', 'Ford', 'Honda', 'Hyundai', 'Iveco', 'Jeep', 'Lancia', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 'Skoda', 'Subaru', 'Toyota'];
  brands;
  useSticker: boolean = false;
  // initialStickerText: string = '';
  isProcessing: boolean = false;
  remainingCharacters: number = 30;

  coverSettings = {
    "brand_logo": "",
    "sticker_text": "",
    // "sticker_form": "badge" // circle, square or badge (default when empty)
  };

  constructor(
    private session: SessionService,
    private backend: BackendService,
    private resume: ResumeService,
    private analytics: AnalyticsService
  ) {
    this.brands = this.brandNames.map( name => ({name, id:name.toLowerCase().replace(/[\s\-]/, '_')}) );
  }

  ngOnInit() {

    jQuery(() => { // scroll to top
      jQuery(".progress-meter").scrollTop();
    });

    let sessionData = this.session.get();
    this.selectedImage = sessionData.selectedImage;
    this.coverURLs = sessionData.cover_urls;
    this.titleImageChosen = this.selectedImage;
    this.setTitleImageSrc();

    let cover_settings = sessionData.cover_settings;
    if (cover_settings) {
      if (cover_settings.sticker_text) { this.coverSettings.sticker_text = cover_settings.sticker_text; }
      if (cover_settings.brand_logo) { this.coverSettings.brand_logo = cover_settings.brand_logo; }
    }
    this.useSticker = sessionData.useSticker;
    console.log('coverSettings', this.coverSettings)

    this.resume.resumeIsDone().then(() => {
      console.log('processing image');
      this.processImage();
    });
  }

  // Set appropriate image (unprocessed or processed if available)
  private setTitleImageSrc() {
    this.titleImageSrc = this.coverURLs.full ? this.coverURLs.full : this.selectedImage.urls.full;
    // console.log('TITLE image', this.titleImageSrc);
  }

  onCheckboxChanged(e) {
    this.useSticker = e.target.checked;
  }

  onSubmitButtonClicked(brand, stickerChecked, stickerText) {
    console.log('SUBMIT', brand, stickerChecked, stickerText);
    this.coverSettings.brand_logo = brand;
    this.coverSettings.sticker_text = this.useSticker ? stickerText.toUpperCase() : '';
    // console.log(this.coverOptions);
    this.processImage();
  }

  getRemainingTextLenghth(stickerText) {
    this.remainingCharacters = (30 - stickerText.length);
  }

  processImage() {
    if (!this.titleImageChosen) return;
    this.isProcessing = true;
    this.backend.setCover(this.selectedImage.id, this.coverSettings).subscribe(res => {
      console.info('image processed', res.json());
      let data = res.json().data;
      let now = new Date().getTime();
      data.cover_urls['full'] += '?' + now;
      data.cover_urls['thumb'] += '?' + now;
      data.useSticker = this.useSticker;
      this.coverURLs = data.cover_urls;
      this.setTitleImageSrc();
      this.session.set(data);
      this.isProcessing = false;
    }, err => {
      console.log('error processing image', err.json());
      this.isProcessing = false;
    });
    this.analytics.sendEvent({
      eventCategory:'generate', 
      eventAction:'generate',
      dimension2:this.coverSettings.brand_logo,
      dimension3:this.coverSettings.sticker_text
    });
  }

  allowDownload(){ // image uploaded AND titleimage chosen AND titleimage processed?
    if((this.session.get().images.length != 0) && (this.session.get().selectedImage != null)){
      return true;
    } else {
      return false;
    }
  }

}
