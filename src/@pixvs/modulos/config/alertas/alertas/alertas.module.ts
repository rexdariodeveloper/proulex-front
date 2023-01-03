import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';

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


import { TranslateModule } from '@ngx-translate/core';
import { PixvsMatTreeModule } from '@pixvs/componentes/material/mat-tree/pixvs-mat-tree.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { AlertasComponent } from './alertas.component';
import { AlertasService } from './alertas.service';
import { NgModule } from '@angular/core';



const routes = [

    {
        path: 'alerta/:handle', redirectTo: 'alerta/:handle/', pathMatch: 'full'
    },
    {
        path: 'alerta/:handle/:id',
        component: AlertasComponent,
        resolve: {
            data: AlertasService,
        },
        data: { url: '/api/v1/alerta/listados' }
    }
];

@NgModule({
    declarations: [
        AlertasComponent
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
        AlertasService
    ]
})
export class AlertasModule {
}
