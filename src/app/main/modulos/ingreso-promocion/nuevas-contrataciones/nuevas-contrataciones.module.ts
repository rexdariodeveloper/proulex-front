import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListadoNuevaContratacionComponent } from './listado-nueva-contratacion/listado-nueva-contratacion.component';
import { FichasDataService } from '@services/fichas-data.service';
import { RouterModule } from '@angular/router';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { NuevaContratacionModule } from './nueva-contratacion/nueva-contratacion.module';

const routes = [
  {
    path: 'nuevas-contrataciones',
    component: ListadoNuevaContratacionComponent,
    resolve: {
      data: FichasDataService,
    },
    data: { url: '/api/v1/nuevas-contrataciones/all' }
  }
];

@NgModule({
  declarations: [
    ListadoNuevaContratacionComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FichaListadoModule,
    NuevaContratacionModule,

    FuseSharedModule,
    FuseHighlightModule
  ],
  providers: [
    FichasDataService
  ]
})
export class NuevasContratacionesModule { }
