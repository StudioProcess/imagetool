import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { BackendService } from './backend.service';
import { SessionService } from './session.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  loading = true;
  
  constructor(
    private router: Router,
    private backend: BackendService,
    private session: SessionService
  ) {
    console.log('SESSION:', session.get());
  }
  
  ngOnInit() {
    // Resume the session (if possible)
    this.resumeSession().finally(() => {
      this.loading = false;
      
      // Keep stored route up to date
      this.router.events
        .filter(e => e instanceof NavigationEnd)
        .subscribe((e) => {
          console.log('ROUTE:', e.url);
          this.session.store({route: e.url});
      });
      
      console.log("RESUME DONE");
    }).subscribe();
  }
  
  resumeSession() {
    /*
     get user data
     -> error (401 unauthorized)
        -> navigate to login page
     -> success
        -> get images
           -> save to local session
           -> navigate to stored route
     */
    
    // Update local user data
    let updateUser = this.backend.userData().do(res => {
      // console.log('update user', res);
      this.session.store({userData: res.json().data});
    });
    
    // Update local image data
    let updateImages = this.backend.getImages().do(res => {
      // console.log('update images', res);
      this.session.store({images: res.json().data.last_uploaded_images});
    });
    
    return updateUser.switchMapTo(updateImages).do(res => {
      console.log('resume success', res.json());
      let url = this.session.get().route;
      if (!url) url = '/upload';
      console.info('resuming to', url);
      this.router.navigateByUrl(url);
    }).catch(err => {
      if (err.status == 401) { // Unauthorized i.e. not logged in
        console.info('No valid token, redirecting to login')
        this.router.navigate(['login']);
      } else {
        console.error('resume error', err);
      }
      return Observable.empty();
    });
  }
}
