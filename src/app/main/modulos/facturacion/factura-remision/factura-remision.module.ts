import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { FacturaRemisionListadoComponent } from './factura-remision-listado/factura-remision-listado.component';
import { FacturaRemisionModule } from './factura-remision/factura-remision.module';

const routes = [
    {
        path: 'factura-remision',
        component: FacturaRemisionListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/cxcfacturas-remisiones/all' }
    }
];

@NgModule({
    declarations: [
        FacturaRemisionListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        FacturaRemisionModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class FacturaRemisionListadoModule {
}