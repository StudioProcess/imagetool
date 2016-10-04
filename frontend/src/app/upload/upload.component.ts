import { Component, OnInit, HostBinding } from '@angular/core';
import 'dropzone';

@Component({
  selector: 'app-upload',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss']
})

export class UploadComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  deletePhoto(){
    console.log("deletePhoto: clicked");
  }
}
