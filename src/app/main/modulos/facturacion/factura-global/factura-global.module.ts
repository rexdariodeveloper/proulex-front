import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { FacturaGlobalListadoComponent } from './factura-global-listado/factura-global-listado.component';
import { FacturaGlobalModule } from './factura-global/factura-global.module';

const routes = [
    {
        path: 'factura-global',
        component: FacturaGlobalListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/cxcfacturas-global/all' }
    }
];

@NgModule({
    declarations: [
        FacturaGlobalListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        FacturaGlobalModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    providers: [
        FichasDataService
    ],
    entryComponents: [
    ]
})

export class FacturaGlobalListadoModule {
}