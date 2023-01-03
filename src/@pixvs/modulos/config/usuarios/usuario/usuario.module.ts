import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { UsuarioComponent } from './usuario.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { ContrasenaDialog } from './contrasena-dialog';

import { ImageCropperModule } from 'ngx-image-cropper';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';

import { UsuarioService } from './usuario.service';
import { TranslateModule } from '@ngx-translate/core';
import { UsuarioDatosAdicionalesModule } from '@app/main/componentes/usuario-datos-adicionales/usuario-datos-adicionales.module';



const routes = [

    {
        path: 'usuarios/:handle', redirectTo: 'usuarios/:handle/', pathMatch: 'full'
    },
    {
        path: 'usuarios/:handle/:id',
        component: UsuarioComponent,
        resolve: {
            data: UsuarioService,
        },
        data: { url: '/api/v1/usuarios/listados/' }
    }
];

@NgModule({
    declarations: [
        UsuarioComponent,
        ContrasenaDialog
    ],
    imports: [
        RouterModule.forChild(routes),

        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatDialogModule,
        MatProgressBarModule,
        MatCardModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
		ImageCropperModule,     
		UsuarioDatosAdicionalesModule,   

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        UsuarioService
    ]
})
export class UsuarioModule {
}
