import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfiguracionDocumentosRHComponent } from './configuracion-documentos-rh/configuracion-documentos-rh.component';
import { RouterModule } from '@angular/router';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { FichasDataService } from '@services/fichas-data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { ConfiguracionDocumentosRHService } from './configuracion-documentos-rh/configuracion-documentos-rh.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { TipoOpcionDialogComponent } from './configuracion-documentos-rh/dialog/tipo-opcion.dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMaskModule } from 'ngx-mask';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';

const routes = [
	{
		path: 'configuracion-documentos-rh',
		component: ConfiguracionDocumentosRHComponent,
    resolve: {
      data: ConfiguracionDocumentosRHService,
    },
    data: { url: '/api/v1/configuracion-documentos-rh/listados' }
	}
];

@NgModule({
  declarations: [
    // Componentes
    ConfiguracionDocumentosRHComponent,
    TipoOpcionDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatFormFieldModule,
    MatTabsModule,
    MatTableModule,
    FlexLayoutModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatRadioModule,
    MatCheckboxModule,
    NgxMaskModule,
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule,

    FichaCrudModule,
    PixvsBloqueoPantallaModule,

    TranslateModule,

    FuseSharedModule,
    FuseHighlightModule
  ],
  providers: [
    FichasDataService,
    PendingChangesGuard
  ],
  entryComponents: [
    TipoOpcionDialogComponent
  ]
})
export class ConfiguracionDocumentoRHModule { }
