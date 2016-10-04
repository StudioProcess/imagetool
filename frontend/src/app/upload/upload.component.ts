import { Component, OnInit, AfterViewInit } from '@angular/core';
import Dropzone from 'dropzone';

@Component({
  selector: 'app-upload',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss']
})

export class UploadComponent implements OnInit, AfterViewInit {
  private dropzone;
  
  constructor() {
    // console.log('dropzone:', Dropzone);
  }

  ngOnInit() {
  }
  
  ngAfterViewInit() {
    this.dropzone = new Dropzone('#dropzone');
    console.log(this.dropzone);
  }

}
