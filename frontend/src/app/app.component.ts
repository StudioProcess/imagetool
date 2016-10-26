import { Component, ViewEncapsulation, OnInit, AfterViewChecked } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { BackendService } from './backend.service';
import { SessionService } from './session.service';
import { ResumeService } from './resume.service';

declare var jQuery: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  loading = true;

  public expanded: boolean = false;

  constructor(
    private router: Router,
    private backend: BackendService,
    private session: SessionService,
    private resume: ResumeService
  ) {
    console.log('SESSION:', session.get());
  }

  ngOnInit() {
    // Resume the session (if possible)
    this.resume.resumeSession().finally(() => {
      this.loading = false;

      // Keep stored route up to date
      // Don't store 'special' routes, that redirect anyway (login, logout, restart)
      this.router.events
        .filter(e => e instanceof NavigationEnd)
        .do(e => console.log('ROUTE:', e.url))
        .filter((e:any) => ['/login', '/logout', '/restart'].indexOf(e.urlAfterRedirects) == -1)
        .subscribe((e: any) => {
          this.session.store({route: e.urlAfterRedirects});
      });

      console.log("RESUME DONE");
    }).subscribe();
  }

  ngAfterViewChecked(){

    jQuery("#collapsible-trigger").unbind().click(() => {
      // ist klasse drauf?
      if(jQuery("#collapsible").hasClass("expanded")){
        // ja -> remove klasse expanded && slideUp
        jQuery("#collapsible").slideUp("slow", function(){
          jQuery("#collapsible-trigger").removeClass("expanded-trigger");
          jQuery("#collapsible").removeClass("expanded");
        });
      } else {         // nein -> adde klasse expanded && slideDown
        jQuery("#collapsible").addClass("expanded"); // mit ID statt klasse
        jQuery("#collapsible").slideDown("slow");
        jQuery("#collapsible-trigger").addClass("expanded-trigger");
      }
    });
  }
}
