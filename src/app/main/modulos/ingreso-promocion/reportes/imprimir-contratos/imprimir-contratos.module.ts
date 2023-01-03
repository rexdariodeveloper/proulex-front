import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PdfModule } from '@pixvs/componentes/visor-pdf/visor-pdf.module';
import { ImprimirContratosComponent } from './imprimir-contrato.component';
import { ImprimirContratosService } from './imprimir-contrato.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
//import { VisorDialogComponent } from './imprimir-contrato/dialog/visor.component'

const routes = [
    {
        path: 'reportes/contratos-imprimir',
        component: ImprimirContratosComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/contratos-empleados/all' }
    }
];

@NgModule({
    declarations: [
        ImprimirContratosComponent,
        //VisorDialogComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        PdfModule,
        MatButtonModule,

        FuseSharedModule,
        FuseHighlightModule,
        PixvsBloqueoPantallaModule

    ],
    providers: [
        FichasDataService,
        ImprimirContratosService,
        HttpService
    ],entryComponents: [
        //VisorDialogComponent
    ]
})

export class ImprimirContratosModule {
}