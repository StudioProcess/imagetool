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
  coverURL: any;
  titleimageChosen: boolean;
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

  constructor(private session: SessionService, private backend: BackendService) {
    this.brands = this.brandNames.map( name => ({name, id:name.toLowerCase().replace(' ', '_')}) );
  }

  ngOnInit() {
    let sessionData = this.session.get();
    this.image = sessionData.selectedImage;
    this.coverURL = sessionData.cover_urls;
    this.titleimageChosen = this.image;

    this.processImage();
  }

  onCheckboxChanged(e) {
    this.useSticker = e.target.checked;
  }

  onSubmitButtonClicked(brand, stickerChecked, stickerText) {
    console.log('SUBMIT', brand, stickerChecked, stickerText);
    this.coverOptions.logos.brand = brand;
    if (this.useSticker) {
      this.coverOptions.eyecatcher.text = stickerText;
    } else {
      this.coverOptions.eyecatcher.text = '';
    }
    console.log(this.coverOptions);
    this.processImage();
  }

  processImage() {
    if (!this.titleimageChosen) return;
    this.isProcessing = true;
    this.backend.setCover(this.image.id, this.coverOptions).subscribe(res => {
      console.info('image processed', res.json());
      this.session.set(res.json().data);
      this.coverURL = res.json().data.cover_urls;
      let now = new Date().getTime();
      this.coverURL['full'] += '?' + now;
      this.coverURL['thumb'] += '?' + now;
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
