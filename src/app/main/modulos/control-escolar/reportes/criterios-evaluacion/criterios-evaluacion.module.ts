import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { CriteriosListadoComponent } from './criterios-listado/criterios-listado.component';
import { CriteriosGrupoService } from './criterios-listado/criterios-listado.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';

const routes = [
    {
        path: 'reportes/criterios-evaluacion',
        component: CriteriosListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/criterios-evaluacion/all' }
    }
];

@NgModule({
    declarations: [
        CriteriosListadoComponent
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
        CriteriosGrupoService,
        HttpService
    ]
})

export class CriteriosListadoModule {
}