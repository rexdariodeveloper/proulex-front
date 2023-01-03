import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { OrdenesCompraListadoComponent } from './ordenes-compra/ordenes-compra.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { OrdenCompraModule } from './orden-compra/orden-compra.module';
import { CommonModule } from '@angular/common';
import { ReciboOrdenesCompraListadoModule } from './recibos/recibos.module';
import { ReciboOrdenCompraModule } from './recibo/recibo.module';
import { DevolucionOrdenesCompraListadoModule } from './devoluciones/devoluciones.module';
import { DevolucionOrdenCompraModule } from './devolucion/devolucion.module';
import { OCDescargasService } from './ordenes-compra/descargas.service';


const routes = [
    {
        path: 'ordenes-compra',
        component: OrdenesCompraListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/ordenes-compra/all' }
    }
];

@NgModule({
    declarations: [
        OrdenesCompraListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
		OrdenCompraModule,
		ReciboOrdenesCompraListadoModule,
		ReciboOrdenCompraModule,
		DevolucionOrdenesCompraListadoModule,
		DevolucionOrdenCompraModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
		FichasDataService,
		OCDescargasService
    ]
})

export class OrdenesCompraListadoModule {
}