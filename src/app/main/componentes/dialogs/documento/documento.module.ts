import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentoService } from './documento.service';
import { DocumentoDialogComponent } from './documento.dialog';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { TranslateModule } from '@ngx-translate/core';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { FuseHighlightModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { PixvsPhonePickerModule } from '@pixvs/componentes/phone-picker/phone-picker.module';
import { PixvsStepperVerticalModule } from '@pixvs/componentes/stepper/vertical/stepper.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskModule } from 'ngx-mask';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';


@NgModule({
  declarations: [DocumentoDialogComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDatepickerModule,
    ImageCropperModule,
    MatCheckboxModule,
    MatSelectModule,
    MatProgressSpinnerModule,

    FichaCrudModule,
    PixvsMatSelectModule,

    TranslateModule,

    FuseSharedModule,
    FuseHighlightModule
  ],
  exports:[
    DocumentoDialogComponent
  ],
  providers:[
    DocumentoService
  ]
})
export class DocumentoModule { }
