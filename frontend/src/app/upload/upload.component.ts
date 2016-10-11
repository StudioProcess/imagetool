import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-upload',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss']
})

export class UploadComponent implements OnInit, AfterViewInit {
  images = [];
  
  constructor(private backend: BackendService, private session: SessionService) { }

  ngOnInit() {
    this.images = this.session.get().images;
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
      uploadState: { uploading: true } as any,
      uploadProgress: 0,
      data: null
    };
    
    this.images.push(image);
    
    this.backend.addImage(file).subscribe({
      next: (res) => {
        if (res['isProgressEvent']) {
          // console.log('upload progress', res);
          image.uploadProgress = res['loaded'] / res['total'] * 100;
          if (image.uploadProgress >= 99.9) {
            image.uploadState = { processing:true };
          }
        } else {
          console.log('upload success', res.json());
          let data = res.json().data;
          image.data = data.images[0];
          image.uploadState = {}; // uploading success
          
          // Add uploaded image to session
          this.session.set({images: this.images});
        }
      },
      error: (res) => {
        console.log('upload error', res.json());
        image.uploadState = { error:true };
      }
    });
  }

}
