import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RenovacionComponent } from './renovacion.component';
import { RenovacionService } from './renovacion.service';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
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
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RenovacionEditarDialogComponent } from './dialogs/renovacion-editar/renovacion-editar.dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';

const routes = [

  {
    path: 'renovaciones/:handle', redirectTo: 'renovaciones/:handle/', pathMatch: 'full'
  },
  {
    path: 'renovaciones/:handle/:id',
    component: RenovacionComponent,
    resolve: {
        data: RenovacionService,
    },
    data: { url: '/api/v1/renovaciones/listados/' }
  }
];

@NgModule({
  declarations: [
    RenovacionComponent,
    RenovacionEditarDialogComponent
  ],
  imports: [
    RouterModule.forChild(routes),

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
    MatDialogModule,

    FichaCrudModule,
    TranslateModule,
    PixvsMatSelectModule,

    FuseSharedModule,
    FuseHighlightModule
  ],
  providers:[
    RenovacionService
  ],
  entryComponents: [
    RenovacionEditarDialogComponent
  ]
})
export class RenovacionModule { }
