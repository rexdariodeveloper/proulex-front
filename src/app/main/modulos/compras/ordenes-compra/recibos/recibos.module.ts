import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { ReciboOrdenesCompraListadoComponent } from './recibos.component';
import { DescargasService } from './descargas.service';


const routes = [
    {
        path: 'recibo-oc',
        component: ReciboOrdenesCompraListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/recibo-ordenes-compra/all' }
    }
];

@NgModule({
    declarations: [
        ReciboOrdenesCompraListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
		FichasDataService,
		DescargasService
    ]
})

export class ReciboOrdenesCompraListadoModule {
}