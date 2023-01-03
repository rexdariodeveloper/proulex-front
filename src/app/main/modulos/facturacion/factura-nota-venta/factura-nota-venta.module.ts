import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { FacturaNotaVentaListadoComponent } from './factura-nota-venta-listado/factura-nota-venta-listado.component';
import { FacturaNotaVentaModule } from './factura-nota-venta/factura-nota-venta.module';

const routes = [
    {
        path: 'factura-nota-venta',
        component: FacturaNotaVentaListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/cxcfacturas-nota-venta/all' }
    }
];

@NgModule({
    declarations: [
        FacturaNotaVentaListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        FacturaNotaVentaModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ],
    entryComponents: [
    ]
})

export class FacturaNotaVentaListadoModule {
}