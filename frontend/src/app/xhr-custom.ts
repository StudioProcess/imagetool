import { Injectable } from '@angular/core';
import { XHRConnection, Request, BrowserXhr, ResponseOptions, XHRBackend, XSRFStrategy, ConnectionBackend, Response } from '@angular/http';
import { Observable, Observer } from 'rxjs/Rx';

@Injectable()
export class CustomBrowserXhr extends BrowserXhr {
  _xhr: any;
  _reuseLast = false;
  
  build(): any {
    if (this._reuseLast) {
      this._reuseLast = false;
    } else {
      this._xhr = super.build();
    }

    // console.log('custom browser xhr', this);
    return <any>(this._xhr);
  }
  
  reuseLast() {
    if (this._xhr) {
      this._reuseLast = true;
    }
  }
  
}


@Injectable()
export class CustomXHRBackend implements ConnectionBackend {
  constructor(
      private _browserXHR: CustomBrowserXhr, private _baseResponseOptions: ResponseOptions,
      private _xsrfStrategy: XSRFStrategy) {}

  createConnection(request: Request): CustomXHRConnection {
    this._xsrfStrategy.configureRequest(request);
    return new CustomXHRConnection(request, this._browserXHR, this._baseResponseOptions);
  }
}


@Injectable()
export class CustomXHRConnection extends XHRConnection {
  
  constructor(req: Request, browserXHR: CustomBrowserXhr, baseResponseOptions?: ResponseOptions) {
    let xhr = browserXHR.build();
    browserXHR.reuseLast();
    
    let progressResponse = new Observable<Response>( (responseObserver: Observer<Response>) => {
      let onProgress = (event) => {
        // console.log('xhr progress', event);
        let response = new Response(new ResponseOptions());
        response['isProgressEvent'] = true; // Add unique field to test for this sort of event
        // response.status = 102; // 102 Processing (1xx Informational)
        response.bytesLoaded = event.loaded;
        response.totalBytes = event.total;
        // Add all fields from XHR ProgressEvent 
        response['lengthComputable'] = event.lengthComputable;
        response['loaded'] = event.loaded;
        response['total'] = event.total;
        responseObserver.next(response);
      };
      let onLoad = (event) => {
        // console.log('xhr load', event);
        responseObserver.complete();
      };
      xhr.addEventListener('progress', onProgress);
      xhr.addEventListener('load', onLoad);
      return () => {
        xhr.removeEventListener('progress', onProgress);
        xhr.removeEventListener('load', onLoad);
      }
    });
    
    super(req, browserXHR, baseResponseOptions);
    
    this.response = this.response.merge(progressResponse);
  }

}
