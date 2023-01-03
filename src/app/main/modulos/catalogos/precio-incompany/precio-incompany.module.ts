import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { PrecioIncompanyListadoComponent } from './precios-incompany/precios-incompany.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { PrecioIncompanyModule } from './precio-incompany/precio-incompany.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'precio-incompany',
        component: PrecioIncompanyListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/precios-incompany/all' }
    }
];

@NgModule({
    declarations: [
        PrecioIncompanyListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        PrecioIncompanyModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class PrecioIncompanyListadoModule {
}