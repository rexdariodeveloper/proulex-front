import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { GruposListadoComponent } from './grupos/grupos.component';
import { GruposMultipleModule } from './grupos-multiple/grupos-multiple.module';
import { GruposDetallesModule } from './grupos-detalles/grupos-detalles.module';
import { GruposService } from './grupos/grupos.service';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { ErroresDialogComponent } from './grupos/dialogs/errores/errores.dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GrupoAlertasModule } from './grupos-alerta/grupo-alerta.module';


const routes = [
    {
        path: 'grupos',
        component: GruposListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/grupos/all' },
        canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
        GruposListadoComponent,
        ErroresDialogComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

		FichaListadoModule,
        GruposMultipleModule,
		GruposDetallesModule,
        GrupoAlertasModule,
        PixvsBloqueoPantallaModule,

        FuseSharedModule,
        FuseHighlightModule,

        MatTableModule,
        MatButtonModule,
        MatIconModule

    ],
    providers: [
		FichasDataService,
		GruposService,
        PendingChangesGuard
    ], 
    entryComponents: [
        ErroresDialogComponent
    ]
})

export class GruposModule {
}