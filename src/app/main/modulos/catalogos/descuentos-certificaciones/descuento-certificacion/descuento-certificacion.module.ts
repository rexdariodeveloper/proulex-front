import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DescuentoCertificacionComponent } from './descuento-certificacion.component';
import { DescuentoCertificacionService } from './descuento-certificacion.service';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { DescuentoCertificacionDescuentoDialog } from './dialogs/descuento-certificacion-descuento.dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskModule } from 'ngx-mask';

const routes = [

  {
    path: 'descuentos-certificaciones/:handle', redirectTo: 'descuentos-certificaciones/:handle/', pathMatch: 'full'
  },
  {
    path: 'descuentos-certificaciones/:handle/:id',
    component: DescuentoCertificacionComponent,
    resolve: {
        data: DescuentoCertificacionService,
    },
    data: { url: '/api/v1/descuentos-certificaciones/listados/' }
  }
];

@NgModule({
  declarations: [
    DescuentoCertificacionComponent,
    DescuentoCertificacionDescuentoDialog
  ],
  imports: [
    RouterModule.forChild(routes),

    MatSnackBarModule,
    MatProgressBarModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatToolbarModule,
    MatDialogModule,
    MatInputModule,

    NgxMaskModule,

    FichaCrudModule,

    PixvsBloqueoPantallaModule,
    PixvsMatSelectModule,

    TranslateModule,

    FuseSharedModule,
    FuseHighlightModule
  ],
  providers:[
    DescuentoCertificacionService,
    PendingChangesGuard
  ]
})
export class DescuentoCertificacionModule { }
