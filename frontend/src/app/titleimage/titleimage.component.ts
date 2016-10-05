import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-titleimage',
  templateUrl: 'titleimage.component.html',
  styleUrls: ['titleimage.component.scss']
})
export class TitleimageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  selectTitleImage() {
    console.log("selectTitleImage pressed");
  }

}
