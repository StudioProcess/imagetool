import { Component, OnInit } from '@angular/core';
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

  mouseOverImage(){
    console.log("asdf");
  }

}
