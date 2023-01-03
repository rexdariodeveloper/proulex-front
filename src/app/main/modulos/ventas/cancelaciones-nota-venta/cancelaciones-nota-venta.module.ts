import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { CancelacionesNotaVentaListadoComponent } from './cancelaciones-nota-venta-listado/cancelaciones-nota-venta-listado.component';
import { CancelacionNotaVentaModule } from './cancelacion-nota-venta/cancelacion-nota-venta.module';

const routes = [
    {
        path: 'cancelacion-nota-venta',
        component: CancelacionesNotaVentaListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/orden-venta-cancelacion/all' }
    }
];

@NgModule({
    declarations: [
        CancelacionesNotaVentaListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        CancelacionNotaVentaModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class CancelacionesNotaVentaListadoModule {
}