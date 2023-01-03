import { NgModule } from '@angular/core';
import { BajaComponent } from './baja.component';
import { BajaService } from './baja.service';
import { RouterModule } from '@angular/router';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DocumentoModule } from '@app/main/componentes/dialogs/documento/documento.module';

const routes = [

  {
    path: 'bajas/:handle', redirectTo: 'bajas/:handle/', pathMatch: 'full'
  },
  {
    path: 'bajas/:handle/:id',
    component: BajaComponent,
    resolve: {
        data: BajaService,
    },
    data: { url: '/api/v1/bajas/listados/' }
  }
];

@NgModule({
  declarations: [BajaComponent],
  imports: [
    RouterModule.forChild(routes),

    DocumentoModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatProgressBarModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDatepickerModule,

    FichaCrudModule,
    TranslateModule,
    PixvsMatSelectModule,
    PixvsBloqueoPantallaModule,

    FuseSharedModule,
    FuseHighlightModule
  ],
  providers:[
    BajaService,
    PendingChangesGuard
  ],
})
export class BajaModule { }
