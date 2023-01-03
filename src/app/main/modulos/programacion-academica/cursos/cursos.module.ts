import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { CursosListadoComponent } from './cursos/cursos.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CursoModule } from './curso/curso.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'cursos',
        component: CursosListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/cursos/all' }
    }
];

@NgModule({
    declarations: [
        CursosListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        CursoModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class CursosListadoModule {
}