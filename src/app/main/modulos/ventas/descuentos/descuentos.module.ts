import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { DescuentosListadoComponent } from './descuentos/descuentos.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { DescuentoModule } from './descuento/descuento.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'descuentos',
        component: DescuentosListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/descuentos/all' }
    }
];

@NgModule({
    declarations: [
        DescuentosListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        DescuentoModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class DescuentosListadoModule {
}