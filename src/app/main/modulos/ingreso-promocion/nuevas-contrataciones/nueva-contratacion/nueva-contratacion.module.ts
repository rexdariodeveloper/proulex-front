import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NuevaContratacionComponent } from './nueva-contratacion.component';
import { RouterModule } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatListModule } from '@angular/material/list';
import { FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { PixvsStepperVerticalModule } from '@pixvs/componentes/stepper/vertical/stepper.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsPhonePickerModule } from '@pixvs/componentes/phone-picker/phone-picker.module';
import { NuevaContratacionService } from './nueva-contratacion.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMaskModule } from 'ngx-mask';
import { PixvsMatSelectSimpleComponent } from '@pixvs/componentes/mat-select-search-simple/mat-select-search-simple.component';
import { PixvsMatSelectSimpleModule } from '@pixvs/componentes/mat-select-search-simple/mat-select-search-simple.module';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { DocumentoDialogComponent } from '../../../../componentes/dialogs/documento/documento.dialog';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentoModule } from '@app/main/componentes/dialogs/documento/documento.module';
import { EmpleadoContratoResponsabilidadComponent } from './dialogs/responsabilidad/responsabilidad.dialog';

const routes = [

  {
    path: 'nuevas-contrataciones/:handle', redirectTo: 'nuevas-contrataciones/:handle/', pathMatch: 'full'
  },
  {
    path: 'nuevas-contrataciones/:handle/:id',
    component: NuevaContratacionComponent,
    resolve: {
        data: NuevaContratacionService,
    },
    data: { url: '/api/v1/nuevas-contrataciones/listados/' }
  }
];

@NgModule({
  declarations: [
    NuevaContratacionComponent,
    EmpleadoContratoResponsabilidadComponent
  ],
  imports: [
    RouterModule.forChild(routes),

    DocumentoModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatTabsModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatCardModule,
    MatDatepickerModule,
    MatStepperModule,
    ImageCropperModule,
    MatCheckboxModule,
    NgxMaskModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,

    FichaCrudModule,
    MatListModule,
    MatToolbarModule,
    PixvsDynamicComponentModule,
    PixvsStepperVerticalModule,
    PixvsMatSelectModule,
    PixvsPhonePickerModule,

    TranslateModule,

    FuseSharedModule,
    FuseHighlightModule
  ],
  providers:[
    NuevaContratacionService
  ],
  entryComponents: [
    //DocumentoDialogComponent
  ]
})
export class NuevaContratacionModule { }
