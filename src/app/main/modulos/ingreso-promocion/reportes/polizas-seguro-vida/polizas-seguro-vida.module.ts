import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PdfModule } from '@pixvs/componentes/visor-pdf/visor-pdf.module';
import { PolizasSeguroVidaComponent } from './polizas-seguro-vida.component';
import { PolizasSeguroVidaService } from './polizas-seguro-vida.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';

const routes = [
    {
        path: 'reportes/polizas-seguro-vida',
        component: PolizasSeguroVidaComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/contratos-empleados/polizas/filtros' }
    }
];

@NgModule({
    declarations: [
        PolizasSeguroVidaComponent
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
        PolizasSeguroVidaService,
        HttpService
    ],entryComponents: [
    ]
})

export class PolizasSeguroVidaModule {
}