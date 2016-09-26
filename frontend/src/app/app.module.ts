import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { UploadComponent } from './upload/upload.component';
import { TitleimageComponent } from './titleimage/titleimage.component';
import { EditImageComponent } from './edit-image/edit-image.component';
import { DownloadComponent } from './download/download.component';
import { routing, appRoutingProviders } from './app.routing';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UploadComponent,
    TitleimageComponent,
    EditImageComponent,
    DownloadComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [ appRoutingProviders ],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
