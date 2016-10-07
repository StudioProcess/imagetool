import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-upload',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss']
})

export class UploadComponent implements OnInit, AfterViewInit {
  images = [];
  
  constructor(private backend: BackendService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  deletePhoto() {
  }
  
  onFileSelected(event) {
    event.preventDefault();
    let fileList = event.target.files;
    if (!fileList.length) return; // no file selected
    // TODO: implement for multiple files
    let file = fileList[0]; // just first file (FIXME)
    console.log('file selected', file);
    this.uploadImage(file);
  }
  
  onFileDragged(event) {
    event.preventDefault();
    // console.log("file dragged");
  }

  onFileDropped(event) {
    event.preventDefault();
    
    let fileList = [];
    // If dropped items aren't files, reject them
    let dt = event.dataTransfer;
    fileList = dt.files;
    if (!fileList.length) return; // no file selected
    // TODO: implement for multiple files
    let file = fileList[0]; // just first file (FIXME)
    console.log('file dropped', file);
    this.uploadImage(file);
  }

  uploadImage(file: File) {
    let image = {
      isUploading: true,
      uploadProgress: 0,
      id: null,
      src: ''
    };
    
    this.images.push(image);
    
    this.backend.addImage(file).subscribe({
      next: (res) => {
        if (res['isProgressEvent']) {
          // console.log('upload progress', res);
          image.uploadProgress = res['loaded'] / res['total'] * 100;
        } else {
          console.log('upload success', res.json());
          let data = res.json().data;
          image.isUploading = false;
          image.src = 'http://ito.process.studio/api/public/' + data.images[0].urls.thumb;
          image.id = data.images[0].id;
        }
      },
      error: (res) => {
        console.log('upload error', res.json());
        image.isUploading = false;
      }
    });
  }

}
