import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { DeduccionesPercepcionesListadoComponent } from './deducciones-percepciones/deducciones-percepciones.component';
import { DeduccionesPercepcionesMultipleModule } from './deducciones-percepciones-multiple/deducciones-percepciones-multiple.module';
import { DeduccionesPercepcionesDetallesModule } from './deducciones-percepciones-detalles/deducciones-percepciones-detalles.module';
import { DeduccionesPercepcionesService } from './deducciones-percepciones/deducciones-percepciones.service';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


const routes = [
    {
        path: 'deducciones-percepciones',
        component: DeduccionesPercepcionesListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/empleado-deduccion-percepcion/all' },
        canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
        DeduccionesPercepcionesListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

		FichaListadoModule,
        DeduccionesPercepcionesMultipleModule,
		DeduccionesPercepcionesDetallesModule,
        PixvsBloqueoPantallaModule,

        FuseSharedModule,
        FuseHighlightModule,

        MatTableModule,
        MatButtonModule,
        MatIconModule

    ],
    providers: [
		FichasDataService,
		DeduccionesPercepcionesService,
        PendingChangesGuard
    ], 
    entryComponents: [
    ]
})

export class DeduccionesPercepcionesModule {
}