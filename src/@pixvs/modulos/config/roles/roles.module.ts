import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { RolesListadoComponent } from './roles/roles.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { RolModule } from './rol/rol.module';
import { CommonModule } from '@angular/common';


const routes = [
    {
        path: 'roles',
        component: RolesListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/roles/all' }
    }
];


@NgModule({
    declarations: [
        RolesListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        RolModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class RolesListadoModule {
}
