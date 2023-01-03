import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantillaGruposListadoComponent } from './plantilla-grupos-listado/plantilla-grupos-listado.component';
import { FichasDataService } from '@services/fichas-data.service';
import { PlantillaGruposListadoService } from './plantilla-grupos-listado/plantilla-grupos-listado.service';
import { RouterModule } from '@angular/router';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { ErroresDialogComponent } from './plantilla-grupos-listado/dialogs/errores/errores.dialog';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { MatTableModule } from '@angular/material/table';

const routes = [
  {
      path: 'plantilla-grupos',
      component: PlantillaGruposListadoComponent,
      resolve: {
          data: FichasDataService,
      },
      data: { url: '/api/v1/plantilla-grupos/all' },
      canDeactivate: [PendingChangesGuard]
  }
];


@NgModule({
  declarations: [
    PlantillaGruposListadoComponent,
    ErroresDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatTableModule,

    FichaListadoModule,
    PixvsBloqueoPantallaModule,

    FuseSharedModule,
    FuseHighlightModule,

  ],
  providers: [
    FichasDataService,
    PlantillaGruposListadoService,
    PendingChangesGuard
  ], 
  entryComponents: [
    ErroresDialogComponent
  ]
})
export class PlantillaGruposModule { }
