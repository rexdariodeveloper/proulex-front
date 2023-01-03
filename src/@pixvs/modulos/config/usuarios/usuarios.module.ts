import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { UsuariosListadoComponent } from './usuarios/usuarios.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { UsuarioModule } from './usuario/usuario.module';
import { CommonModule } from '@angular/common';


const routes = [
    {
        path: 'usuarios',
        component: UsuariosListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/usuarios/all' }
    }
];

@NgModule({
    declarations: [
        UsuariosListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        UsuarioModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class UsuariosListadoModule {
}
