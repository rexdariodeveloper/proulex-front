import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListadoValeCertificacionComponent } from './listado-vale-certificacion/listado-vale-certificacion.component';
import { FichasDataService } from '@services/fichas-data.service';
import { RouterModule } from '@angular/router';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { ListadoValeCertificacionService } from './listado-vale-certificacion/listado-vale-certificacion.service';
import { ListadoValeCertificacionReenviarDialog } from './listado-vale-certificacion/dialogs/listado-vale-certificacion-reenviar/listado-vale-certificacion-reenviar.dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

const routes = [
  {
    path: 'vales-certificaciones',
    component: ListadoValeCertificacionComponent,
    resolve: {
        data: FichasDataService,
    },
    data: { url: '/api/v1/vales-certificaciones/all' }
  }
];

@NgModule({
  declarations: [
    ListadoValeCertificacionComponent,
    ListadoValeCertificacionReenviarDialog
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    MatToolbarModule,
    MatButtonModule,
    MatInputModule,

    FichaListadoModule,

    FuseSharedModule,
    FuseHighlightModule,

    PixvsBloqueoPantallaModule
  ],
  providers: [
    FichasDataService,
    ListadoValeCertificacionService
  ]
})
export class ValesCertificacionesModule { }
