import { Injectable } from '@angular/core';
import { XHRConnection, Request, BrowserXhr, ResponseOptions, XHRBackend, XSRFStrategy, ConnectionBackend, Response } from '@angular/http';
import { Observable, Observer } from 'rxjs/Rx';


@Injectable()
export class CustomBrowserXhr extends BrowserXhr {
  _xhr: any;
  _useCacheOnce: boolean;
  
  build(): any {
    if (this._useCacheOnce && this._xhr) {
      this._useCacheOnce = false;
      console.log('deliver cached xhr', this._xhr);
      return this._xhr;
    }
    // Create and cache a new XMLHttpRequest object
    this._xhr = super.build();
    console.log('deliver new xhr', this._xhr);
    return this._xhr;
  }
  
  // Next call to build() will deliver the last built XHR again
  useCachedForNextBuild() {
    this._useCacheOnce = true;
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
    // When subscribed to, creates a new XMLHttpRequest object with an upload progress event listener
    // Makes sure this XHR is reused in the following call to super(), which will then send the XHR.
    let progressResponse = new Observable<Response>( (responseObserver: Observer<Response>) => {
      console.log('extending xhr with progress');
      let xhr = browserXHR.build();
      browserXHR.useCachedForNextBuild();
      
      let onProgress = (event) => {
        console.log('xhr progress', event);
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
        console.log('xhr complete', event);
        responseObserver.complete();
      };
      console.log('XHR', xhr);
      (xhr.upload || xhr).addEventListener('progress', onProgress);
      xhr.addEventListener('load', onLoad);
      return () => {
        console.log('xhr abort', event);
        (xhr.upload || xhr).removeEventListener('progress', onProgress);
        xhr.removeEventListener('load', onLoad);
      }
    });
    
    // Populates this.response with an Observable<Response>
    // When subscribed to, it will call browserXHR.build to obtain an XMLHttpRequest object and send it
    super(req, browserXHR, baseResponseOptions);
    
    // Merge progress responses into the default response stream
    // Make sure progress responses are subscribed to first
    this.response = progressResponse.merge(this.response);
  }

}


/*
 * Alternative post request with upload progress responses
 */

// export let postWithUploadProgress = (url, formData, headers) => {
//   let xhr = new XMLHttpRequest();
//   let _xhr = xhr;
//   xhr.open('POST', url, true);
//   headers.forEach((values, name) => xhr.setRequestHeader(name, values.join(',')));
//   
//   return new Observable<Response>((responseObserver: Observer<Response>) => {
//     let onProgress = (event) => {
//       console.log('xhr progress', event);
//       let response = new Response(new ResponseOptions());
//       response['isProgressEvent'] = true; // Add unique field to test for this sort of event
//       response.bytesLoaded = event.loaded;
//       response.totalBytes = event.total;
//       // Add all fields from XHR ProgressEvent 
//       response['lengthComputable'] = event.lengthComputable;
//       response['loaded'] = event.loaded;
//       response['total'] = event.total;
//       responseObserver.next(response);
//     };
//     
//     let onLoad = (event) => {
//       console.log('xhr complete', event);
//       // responseText is the old-school way of retrieving response (supported by IE8 & 9)
//       // response/responseType properties were introduced in ResourceLoader Level2 spec (supported
//       // by
//       // IE10)
//       let body = _xhr.response ? _xhr.response : _xhr.responseText;
//       // Implicitly strip a potential XSSI prefix.
//       // if (isString(body)) body = body.replace(XSSI_PREFIX, '');
//       let headers = Headers.fromResponseHeaderString(_xhr.getAllResponseHeaders());
// 
//       // let url = getResponseURL(_xhr);
//       let url = '';
// 
//       // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
//       let status: number = _xhr.status === 1223 ? 204 : _xhr.status;
// 
//       // fix status code when it is 0 (0 status is undocumented).
//       // Occurs when accessing file resources or on Android 4.1 stock browser
//       // while retrieving files from application cache.
//       if (status === 0) {
//         status = body ? 200 : 0;
//       }
// 
//       let statusText = _xhr.statusText || 'OK';
// 
//       var responseOptions = new ResponseOptions({body, status, headers, statusText, url});
//       // if (isPresent(baseResponseOptions)) {
//       //   responseOptions = baseResponseOptions.merge(responseOptions);
//       // }
//       let response = new Response(responseOptions);
//       response.ok = status == 200;
//       if (response.ok) {
//         responseObserver.next(response);
//         // TODO(gdi2290): defer complete if array buffer until done
//         responseObserver.complete();
//         return;
//       }
//       responseObserver.error(response);
//     };
//     
//     let onError = (err) => {
//       var responseOptions = new ResponseOptions({
//         body: err,
//         type: ResponseType.Error,
//         status: _xhr.status,
//         statusText: _xhr.statusText,
//       });
//       // if (isPresent(baseResponseOptions)) {
//       //   responseOptions = baseResponseOptions.merge(responseOptions);
//       // }
//       responseObserver.error(new Response(responseOptions));
//     };
//     
//     xhr.upload.addEventListener('progress', onProgress);
//     xhr.addEventListener('load', onLoad);
//     xhr.addEventListener('error', onError);
//     
//     xhr.send(formData);
//     
//     return () => {
//       xhr.upload.removeEventListener('progress', onProgress);
//       xhr.removeEventListener('load', onLoad);
//       xhr.addEventListener('error', onError);
//       xhr.abort();
//     }
//   });
// }
