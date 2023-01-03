import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListadoBajaComponent } from './listado-baja/listado-baja.component';
import { FichasDataService } from '@services/fichas-data.service';
import { RouterModule } from '@angular/router';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { BajaModule } from './baja/baja.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';

const routes = [
  {
    path: 'bajas',
    component: ListadoBajaComponent,
    resolve: {
      data: FichasDataService,
    },
    data: { url: '/api/v1/bajas/all' }
  }
];

@NgModule({
  declarations: [ListadoBajaComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FichaListadoModule,
    BajaModule,

    FuseSharedModule,
    FuseHighlightModule
  ],
  providers: [
    FichasDataService
  ]
})
export class BajasModule { }
