import { Component, OnInit } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { BackendService } from '../backend.service';
import { SessionService } from '../session.service';
import { AnalyticsService } from '../analytics.service';

declare var jQuery: any;

@Component({
  selector: 'app-upload',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss']
})

export class UploadComponent implements OnInit {

  private CONCURRENT_UPLOADS = 3; // Number of max. simultaneous image uploads

  images = [];
  selectedImage = null;
  nextButtonEnabled: boolean = false;

  constructor(
    private backend: BackendService,
    private session: SessionService,
    private analytics: AnalyticsService,
    private _elRef: ElementRef
  ) {}

  ngOnInit() {
    jQuery(() => { // scroll to top
      jQuery(".progress-meter").scrollTop();
    });
    
    this.images = this.session.get().images;
    this.selectedImage = this.session.get().selectedImage;
  }

  // Check if successfully uploaded images are present
  nextStepAvailable() {
    let sucessfulImagesPresent = this.images.some( (img) => 
      img.uploadState ? // IF there is an uploadState set...
      img.uploadState.success : // ...it HAS to be 'success'
      true);
    let inprogressImagesPresent = this.images.some( (img) => 
      img.uploadState ? img.uploadState.uploading || img.uploadState.processing : false);
    return sucessfulImagesPresent && !inprogressImagesPresent;
  }

  deleteImage(image) {
    if (!image.id) {
      console.log('delete error: no image id');
      image.uploadState = { error: true };
      return;
    }

    image.uploadState = { deleting: true };
    this.backend.removeImage(image.id).subscribe({
      next: (res) => {
        // remove image from session
        console.info('deleted', res.json());
        this.images.splice(this.images.indexOf(image), 1);
        this.session.set({images: this.images});
        if (this.selectedImage && this.selectedImage.id == image.id) {
          this.session.set({selectedImage: null});
        }
      },
      error: (err) => {
        console.log('delete error', err.json());
        image.uploadState = { error: true };
      }
    });
  }

  removeFailedImage(image) {
      this.images.splice(this.images.indexOf(image), 1);
      this.session.set({images: this.images});
      if (this.selectedImage && this.selectedImage.id == image.id) {
        this.session.set({selectedImage: null});
      }
  }

  onFileSelected(event) {
    event.preventDefault();
    let fileList = event.target.files;
    fileList = Array.prototype.filter.call(fileList, file => file.type.indexOf('image/') == 0);
    if (!fileList.length) return; // no file selected
    console.log('files selected', fileList);
    this.uploadMultipleImages(fileList);
  }

  onFileDragged(event) {
    event.preventDefault();
    // console.log("file dragged");
  }

  onFileDropped(event) {
    event.preventDefault();
    let dt = event.dataTransfer;
    let fileList = dt.files; // If dropped items aren't files, reject them
    fileList = Array.prototype.filter.call(fileList, file => file.type.indexOf('image/') == 0);
    if (!fileList.length) return; // no file selected
    console.log('files dropped', fileList);
    this.uploadMultipleImages(fileList);
  }

  uploadMultipleImages(files: File[]) {
    let uploads = files.map(file => this.uploadImage(file));
    let uploadStream = Observable.from(uploads);
    uploadStream.mergeAll(this.CONCURRENT_UPLOADS).do({ complete: () => {
      console.log('upload complete', files.length);
      this.analytics.sendEvent({
        eventCategory: 'upload',
        eventAction: 'upload',
        eventValue: files.length
      });
    }}).subscribe();
  }

  private uploadImage(file: File): Observable<any> {
    let image = {
      uploadState: { uploading: true } as any,
      uploadProgress: 0
    };

    this.images.push(image);

    return this.backend.addImage(file).do(res => {
      if (res['isProgressEvent']) {
        // console.log('upload progress', res);
        image.uploadProgress = res['loaded'] / res['total'] * 100;
        if (image.uploadProgress >= 99.9) {
          image.uploadState = { processing:true };
        }
      } else {
        console.log('upload success', res.json());
        let data = res.json().data;
        // image.data = data.images[0];
        // Add image properties from server response
        Object.assign(image, data.images[0]);
        image.uploadState = { success:true }; // uploading success
        // Add uploaded image to session
        this.session.set({images: this.images});
      }
    }).catch(err => {
      console.log('upload error', err);
      image.uploadState = { error:true };
      this.analytics.sendEvent({
        eventCategory: 'error',
        eventAction: 'upload',
        eventValue: 1
      });
      return Observable.empty(); // Complete the observable chain
    });
  }

}
