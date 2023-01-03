import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { ExamenesCertificacionesListadoComponent } from './examenes-certificaciones/examenes-certificaciones.component';
import { ExamenesCertificacionesService } from './examenes-certificaciones/examenes-certificaciones.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { DetailDialogComponent } from './examenes-certificaciones/dialogs/detail/detail.dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes = [
    {
        path: 'examenes-certificaciones',
        component: ExamenesCertificacionesListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/examenes-certificaciones/all' }
    }
];

@NgModule({
    declarations: [
        ExamenesCertificacionesListadoComponent,
        DetailDialogComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,

        FuseSharedModule,
        FuseHighlightModule,
        PixvsBloqueoPantallaModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        PixvsMatSelectModule,
        MatProgressSpinnerModule
        

    ],
    providers: [
        FichasDataService,
        ExamenesCertificacionesService,
        HttpService
    ]
})

export class ExamenesCertificacionesModule {
}