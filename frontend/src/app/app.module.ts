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
import { HeaderComponent } from './header/header.component';
import { NavigationComponent } from './navigation/navigation.component';
import { MetaControlComponent } from './meta-control/meta-control.component';

import { BackendService } from './backend.service';

import { XHRBackend } from '@angular/http';
import { CustomXHRBackend, CustomBrowserXhr } from './xhr-custom';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UploadComponent,
    TitleimageComponent,
    EditImageComponent,
    DownloadComponent,
    HeaderComponent,
    NavigationComponent, MetaControlComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [
    appRoutingProviders,
    BackendService,
    { provide: XHRBackend, useClass: CustomXHRBackend },
    CustomBrowserXhr
  ],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
