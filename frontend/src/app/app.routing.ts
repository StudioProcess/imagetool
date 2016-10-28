import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { UploadComponent } from './upload/upload.component';
import { TitleImageComponent } from './title-image/title-image.component';
import { EditImageComponent } from './edit-image/edit-image.component';
import { DownloadComponent } from './download/download.component';
import { LogoutComponent, RestartComponent } from './shared';

const appRoutes: Routes = [
  { path: 'upload',
    component: UploadComponent,
    data: { title: 'Fotos hochladen' }
  },
  { path: 'title',
    component: TitleImageComponent,
    data: { title: 'Titelfoto wählen' }
  },
  { path: 'edit',
    component: EditImageComponent,
    data: { title: 'Titelfoto bearbeiten' }
  },
  { path: 'download',
    component: DownloadComponent,
    data: { title: 'Fotos runterladen' }
  },
  { path: 'logout',
    component: LogoutComponent,
    data: { title: 'Ausloggen' }
  },
  { path: 'restart',
    component: RestartComponent,
    data: { title: 'Neu anfangen' }
  },
  { path: 'reset',
    redirectTo: 'restart'
  },
  { path: 'login',
    component: LoginComponent,
    data: { title: 'Einloggen' }
  },
  { path: '**',
    redirectTo: '/login'
  }
];

export const appRoutingProviders: any[] = [

];

export const routing = RouterModule.forRoot(appRoutes);
