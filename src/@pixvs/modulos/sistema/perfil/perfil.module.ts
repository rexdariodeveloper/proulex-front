import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FuseSharedModule } from '@fuse/shared.module';

import { PerfilComponent } from '@pixvs/modulos/sistema/perfil/perfil.component';
import { PerfilAboutComponent } from '@pixvs/modulos/sistema/perfil/tabs/about/about.component';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ProfileService } from '@pixvs/modulos/sistema/perfil/profile.service';
import { ContrasenaDialog } from './contrasena-dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';


const routes = [
    {
        path: 'perfil',
        component: PerfilComponent,
        resolve: {
            profile: ProfileService
        }
    }
];

@NgModule({
    declarations: [
        PerfilComponent,
        PerfilAboutComponent,
        ContrasenaDialog
    ],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatTabsModule,
        MatDialogModule,
        MatInputModule,
        
        TranslateModule,

        FuseSharedModule
    ],
    providers: [
        ProfileService
    ],
})
export class PerfilModule {
}
