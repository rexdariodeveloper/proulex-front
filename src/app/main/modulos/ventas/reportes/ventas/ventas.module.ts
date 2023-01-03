import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { VentasListadoComponent } from './ventas-listado/ventas-listado.component';
import { VentasService } from './ventas-listado/ventas-listado.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';

const routes = [
    {
        path: 'reportes/ventas',
        component: VentasListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/reporte-ventas/all' }
    }
];

@NgModule({
    declarations: [
        VentasListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,

        FuseSharedModule,
        FuseHighlightModule,
        PixvsBloqueoPantallaModule

    ],
    providers: [
        FichasDataService,
        VentasService,
        HttpService
    ]
})

export class VentasListadoModule {
}