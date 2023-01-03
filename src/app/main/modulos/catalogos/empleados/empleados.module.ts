import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { EmpleadosListadoComponent } from './empleados/empleados.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'empleados',
        component: EmpleadosListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/empleados/all' }
    }
];

@NgModule({
    declarations: [
        EmpleadosListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        EmpleadoModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class EmpleadosListadoModule {
}