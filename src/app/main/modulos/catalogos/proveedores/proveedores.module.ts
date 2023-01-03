import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { ProveedoresListadoComponent } from './proveedores/proveedores.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'proveedores',
        component: ProveedoresListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/proveedores/all' }
    }
];

@NgModule({
    declarations: [
        ProveedoresListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        ProveedorModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class ProveedoresListadoModule {
}