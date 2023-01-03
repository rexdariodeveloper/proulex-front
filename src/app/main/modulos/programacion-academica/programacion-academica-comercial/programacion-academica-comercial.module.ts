import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { ProgramacionAcademicaComercialModule } from './programacion-academica-comercial/programacion-academica-comercial.module';
import { CommonModule } from '@angular/common';
import { ProgramacionAcademicaComercialListadoComponent } from './programacion-academica-comercial-listado/programacion-academica-comercial-listado.component';


const routes = [
    {
        path: 'programacion-academica-comercial',
        component: ProgramacionAcademicaComercialListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/programacion-academica-comercial/all' }
    }
];

@NgModule({
    declarations: [
        ProgramacionAcademicaComercialListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        ProgramacionAcademicaComercialModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class ProgramacionAcademicaComercialListadoModule {
}