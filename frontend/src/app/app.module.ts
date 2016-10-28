import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { routing, appRoutingProviders } from './app.routing';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { UploadComponent } from './upload/upload.component';
import { TitleImageComponent } from './title-image/title-image.component';
import { EditImageComponent } from './edit-image/edit-image.component';
import { DownloadComponent } from './download/download.component';
import { HeaderComponent } from './header/header.component';
import { NavigationComponent } from './navigation/navigation.component';
import { MetaControlComponent } from './meta-control/meta-control.component';
import { LogoutComponent, RestartComponent } from './shared';

import { BackendService } from './backend.service';
import { SessionService } from './session.service';
import { ResumeService } from './resume.service';
import { AnalyticsService } from './analytics.service';

import { XHRBackend } from '@angular/http';
import { CustomXHRBackend, CustomBrowserXhr } from './xhr-custom';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UploadComponent,
    TitleImageComponent,
    EditImageComponent,
    DownloadComponent,
    HeaderComponent,
    NavigationComponent,
    MetaControlComponent,
    LogoutComponent,
    RestartComponent
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
    SessionService,
    ResumeService,
    AnalyticsService,
    { provide: XHRBackend, useClass: CustomXHRBackend },
    CustomBrowserXhr
  ],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
