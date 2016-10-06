import { Component, OnInit, AfterViewInit, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-upload',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss']
})

export class UploadComponent implements OnInit, AfterViewInit {

  filePicked = new EventEmitter<File>();

  constructor() { }

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
    let file = fileList[0];
    this.filePicked.emit(file);
}

}
