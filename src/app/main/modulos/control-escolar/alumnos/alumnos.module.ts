import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { AlumnosListadoComponent } from './alumnos-listado/alumnos-listado.component';
import { AlumnoModule } from './alumno/alumno.module';
import { KardexAlumnoService } from '../kardex-alumno/kardex-alumno/kardex-alumno.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';


const routes = [
    {
        path: 'alumnos',
        component: AlumnosListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/alumnos/all' }
    }
];

@NgModule({
    declarations: [
        AlumnosListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        AlumnoModule,

        FuseSharedModule,
        FuseHighlightModule,
        PixvsBloqueoPantallaModule

    ],
    providers: [
        FichasDataService,
        KardexAlumnoService
    ]
})

export class AlumnosListadoModule {
}