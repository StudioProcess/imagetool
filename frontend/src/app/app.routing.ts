import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { UploadComponent } from './upload/upload.component';
import { TitleimageComponent } from './titleimage/titleimage.component';
import { EditImageComponent } from './edit-image/edit-image.component';
import { DownloadComponent } from './download/download.component';

const appRoutes: Routes = [
  { path: 'upload',
    component: UploadComponent,
    data: { title: 'Fotos hochladen'}
  },
  { path: 'titleimage',
    component: TitleimageComponent,
    data: { title: 'Titelfoto wählen' }
  },
  { path: 'edit-image',
    component: EditImageComponent,
    data: { title: 'Titelfoto bearbeiten' }
  },
  { path: 'download',
    component: DownloadComponent,
    data: { title: 'Fotos runterladen' }
  },
  { path: '**',
    component: LoginComponent,
    data: { title: 'Einloggen' }
  }
];

export const appRoutingProviders: any[] = [

];

export const routing = RouterModule.forRoot(appRoutes);