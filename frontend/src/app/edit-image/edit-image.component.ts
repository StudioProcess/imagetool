import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { BackendService } from '../backend.service';
import { ResumeService } from '../resume.service';

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
  brandNames = ['Abarth', 'Alfa Romeo', 'Chrysler', 'Fiat', 'Fiat Professional', 'Jeep', 'Lancia'];
  brands;
  useSticker: boolean = false;
  isProcessing: boolean = false;

  coverOptions = {
    "border": {
      "color1": "#efe409",
      "color2": "#ffaf4b",
      "orientation": "horizontal"
    },
    "logos": {
      // "position": 4,
      "brand": ""
    },
    "eyecatcher": {
      // "position": 2,
      // "form": "circle",
      // "color": "#ffffff",
      "text": ""
    }
  };

  constructor(
    private session: SessionService, 
    private backend: BackendService, 
    private resume: ResumeService
  ) {
    this.brands = this.brandNames.map( name => ({name, id:name.toLowerCase().replace(' ', '_')}) );
  }

  ngOnInit() {
    let sessionData = this.session.get();
    this.selectedImage = sessionData.selectedImage;
    this.coverURLs = sessionData.cover_urls;
    this.titleImageChosen = this.selectedImage;
    this.setTitleImageSrc();
    
    this.resume.resumeIsDone().then(() => {
      console.log('processing image');
      this.processImage();
    });
  }
  
  // Set appropriate image (unprocessed or processed if available)
  private setTitleImageSrc() {
    this.titleImageSrc = this.coverURLs.full ? this.coverURLs.full : this.selectedImage.urls.full;
    this.titleImageSrc = 'http://ito.process.studio/api/public/' + this.titleImageSrc;
    // console.log('TITLE image', this.titleImageSrc);
  }

  onCheckboxChanged(e) {
    this.useSticker = e.target.checked;
  }

  onSubmitButtonClicked(brand, stickerChecked, stickerText) {
    console.log('SUBMIT', brand, stickerChecked, stickerText);
    this.coverOptions.logos.brand = brand;
    if (this.useSticker) {
      this.coverOptions.eyecatcher.text = stickerText.toUpperCase();
    } else {
      this.coverOptions.eyecatcher.text = '';
    }
    console.log(this.coverOptions);
    this.processImage();
  }

  processImage() {
    if (!this.titleImageChosen) return;
    this.isProcessing = true;
    this.backend.setCover(this.selectedImage.id, this.coverOptions).subscribe(res => {
      console.info('image processed', res.json());
      let data = res.json().data;
      let now = new Date().getTime();
      data.cover_urls['full'] += '?' + now;
      data.cover_urls['thumb'] += '?' + now;
      this.coverURLs = data.cover_urls;
      this.setTitleImageSrc();
      this.session.set(data);
      this.isProcessing = false;
    }, err => {
      console.log('error processing image', err.json());
      this.isProcessing = false;
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
