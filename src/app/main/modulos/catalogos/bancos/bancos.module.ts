import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { BancosListadoComponent } from './bancos-listado/bancos-listado.component';
import { BancosModule } from './bancos/bancos.module';

const routes = [
    {
        path: 'bancos',
        component: BancosListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/bancos/all' }
    }
];

@NgModule({
    declarations: [
        BancosListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        BancosModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    providers: [
        FichasDataService
    ],
    entryComponents: [
    ]
})

export class BancosListadoModule {
}