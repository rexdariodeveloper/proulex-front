import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { FacturaMiscelaneaListadoComponent } from './factura-miscelanea-listado/factura-miscelanea-listado.component';
import { FacturaMiscelaneaModule } from './factura-miscelanea/factura-miscelanea.module';

const routes = [
    {
        path: 'factura-miscelanea',
        component: FacturaMiscelaneaListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/cxcfacturas-miscelanea/all' }
    }
];

@NgModule({
    declarations: [
        FacturaMiscelaneaListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        FacturaMiscelaneaModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    providers: [
        FichasDataService
    ],
    entryComponents: [
    ]
})

export class FacturaMiscelaneaListadoModule {
}