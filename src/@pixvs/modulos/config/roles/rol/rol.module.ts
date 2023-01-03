import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { RolComponent } from './rol.component';
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

import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';

import { RolService } from './rol.service';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsMatTreeModule } from '@pixvs/componentes/material/mat-tree/pixvs-mat-tree.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RestriccionDialogComponent } from './dialogs/restriccion.dialog';



const routes = [

    {
        path: 'roles/:handle', redirectTo: 'roles/:handle/', pathMatch: 'full'
    },
    {
        path: 'roles/:handle/:id',
        component: RolComponent,
        resolve: {
            data: RolService,
        },
        data: { url: '/api/v1/roles/listados/' }
    }
];

@NgModule({
    declarations: [
        RolComponent,
        RestriccionDialogComponent
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
        MatCheckboxModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
        PixvsMatTreeModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        RolService
    ],
    entryComponents: [
		RestriccionDialogComponent
	]
})
export class RolModule {
}
