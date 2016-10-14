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
  coverURL: string;
  titleimageChosen: boolean;
  brandNames = ['Alfa Romeo', 'Chrysler', 'Fiat', 'Jeep', 'Maserati'];
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
      "position": 4,
      "brand": "fiat"
    },
    "eyecatcher": {
      "position": 2,
      "form": "circle",
      "color": "#ffffff",
      "text": "HEY!"
    }
  };
  
  constructor(private session: SessionService, private backend: BackendService) {
    this.brands = this.brandNames.map( name => ({name, id:name.toLowerCase().replace(' ', '_')}) );
  }

  ngOnInit() {
    let sessionData = this.session.get();
    this.image = sessionData.selectedImage;
    this.coverURL = sessionData.cover_thumb;
    this.titleimageChosen = this.image;
    
    this.processImage();
  }
  
  onCheckboxChanged(e) {
    this.useSticker = e.target.checked;
  }
  
  onSubmitButtonClicked(brand, stickerChecked, stickerText) {
    console.log('SUBMIT', brand, stickerChecked, stickerText);
    if (brand == 'none') brand = 'fiat';
    this.coverOptions.logos.brand = brand;
    this.coverOptions.eyecatcher.text = stickerText;
    console.log(this.coverOptions);
    this.processImage();
  }
  
  processImage() {
    if (!this.titleimageChosen) return;
    this.isProcessing = true;
    this.backend.setCover(this.image.id, this.coverOptions).subscribe(res => {
      console.info('image processed', res.json());
      this.session.set(res.json().data);
      // URL with cachebreak
      this.coverURL = res.json().data.cover_thumb + "?" + new Date().getTime();
      this.isProcessing = false;
    }, err => {
      console.log('error processing image', err);
      this.isProcessing = false;
    });
  }

}
