import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListadoRenovacionComponent } from './listado-renovacion/listado-renovacion.component';
import { FichasDataService } from '@services/fichas-data.service';
import { RouterModule } from '@angular/router';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { RenovacionModule } from './renovacion/renovacion.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';

const routes = [
  {
    path: 'renovaciones',
    component: ListadoRenovacionComponent,
    resolve: {
      data: FichasDataService,
    },
    data: { url: '/api/v1/renovaciones/all' }
  }
];

@NgModule({
  declarations: [ListadoRenovacionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FichaListadoModule,
    RenovacionModule,

    FuseSharedModule,
    FuseHighlightModule
  ],
  providers: [
    FichasDataService
  ]
})
export class RenovacionesModule { }
