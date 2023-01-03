import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { ReaperturaGrupoComponent } from './reapertura-grupo/reapertura-grupo.component';
import { ReaperturaGrupoService } from './reapertura-grupo/reapertura-grupo.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { FichasDataService } from '@services/fichas-data.service';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

const routes = [
  {
    path: 'reapertura-grupo',
    component: ReaperturaGrupoComponent
  }
];

@NgModule({
  declarations: [
    ReaperturaGrupoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    MatProgressBarModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,

    FichaCrudModule,

    TranslateModule,

    FuseSharedModule,
    FuseHighlightModule
  ],
  providers:[
    ReaperturaGrupoService,
    PendingChangesGuard
  ]
})
export class ReaperturaGrupoModule { }
