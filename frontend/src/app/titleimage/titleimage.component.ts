import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-titleimage',
  templateUrl: 'titleimage.component.html',
  styleUrls: ['titleimage.component.scss']
})
export class TitleimageComponent implements OnInit {
  images = [];
  selected = false;

  constructor() {}

  ngOnInit() {
  }

  selectTitleImage(event) {
    this.selected = !this.selected;

    console.log("selectTitleImage pressed "+this.selected);
  }

}
