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
  brandNames = ['Alfa Romeo', 'Chrysler', 'Fiat', 'Jeep', 'Maserati'];
  brands;
  useSticker: boolean = false;
  isProcessing: boolean = false;

  constructor(private session: SessionService, private backend: BackendService) {
    this.brands = this.brandNames.map( name => ({name, id:name.toLowerCase().replace(' ', '_')}) );
  }

  ngOnInit() {
    this.image = this.session.get().selectedImage;
    this.titleimageChosen = this.image;
  }
  
  onCheckboxChanged(e) {
    this.useSticker = e.target.checked;
  }

}
