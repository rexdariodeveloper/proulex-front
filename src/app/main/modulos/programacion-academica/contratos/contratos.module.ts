import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { ContratosListadoComponent } from './contratos-listado/contratos-listado.component';
import { ContratosService } from './contratos-listado/contratos-listado.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';

const routes = [
    {
        path: 'contratos',
        component: ContratosListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/contratos/all' }
    }
];

@NgModule({
    declarations: [
        ContratosListadoComponent
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
        ContratosService,
        HttpService
    ]
})

export class ContratosListadoModule {
}