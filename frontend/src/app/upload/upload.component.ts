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

  fileDropped(dropevent) {
    dropevent.preventDefault();
    console.log("file dropped");
  }

  dragoverHandler(ev) {
    console.log("Drop");
    ev.preventDefault();
    // If dropped items aren't files, reject them
    var dt = ev.dataTransfer;
    if (dt.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < dt.items.length; i++) {
        if (dt.items[i].kind == "file") {
          var f = dt.items[i].getAsFile();
          //console.log("... file[" + i + "].name = " + f.name);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < dt.files.length; i++) {
        console.log("... file[" + i + "].name = " + dt.files[i].name);
      }
    }
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
