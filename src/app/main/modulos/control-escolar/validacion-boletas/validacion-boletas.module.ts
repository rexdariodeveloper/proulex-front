import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidacionBoletasComponent } from './validacion-boletas/validacion-boletas.component';
import { FichasDataService } from '@services/fichas-data.service';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ValidacionBoletasService } from './validacion-boletas/validacion-boletas.service';
import { ValidacionBoletasDialogComponent } from './validacion-boletas/dialogs/validacion-boletas/validacion-boletas.dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';

const routes = [
  {
      path: 'validacion-boletas',
      component: ValidacionBoletasComponent
  }
];

@NgModule({
  declarations: [
    ValidacionBoletasComponent,
    ValidacionBoletasDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,

    FichaCrudModule,
    FuseSharedModule,
    FuseHighlightModule,
    TranslateModule
  ],
  providers:[
    ValidacionBoletasService
  ],
  entryComponents:[
    ValidacionBoletasDialogComponent
  ]
})
export class ValidacionBoletasModule { }
