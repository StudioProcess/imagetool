import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-upload',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss']
})

export class UploadComponent implements OnInit, AfterViewInit {

  constructor(private backend: BackendService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  deletePhoto() {

  }

  fileSelected(event) {
    event.preventDefault();
    let fileList = event.target.files;
    if (!fileList.length) return; // no file selected
    // TODO : implement for multiple files
    let file = fileList[0]; // just first file
    console.log('file', file);
    
    this.backend.addImage(file).subscribe({
      next: (res) => {
        if (res['isProgressEvent']) {
          console.log('upload progress', res);
        } else {
          console.log('upload success', res.json());
        }
      },
      error: (res) => {
        console.log('upload error', res.json());
      }
    });
  }

}
