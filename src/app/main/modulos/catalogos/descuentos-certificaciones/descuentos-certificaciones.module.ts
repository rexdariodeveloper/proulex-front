import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListadoDescuentoCertificacionComponent } from './listado-descuento-certificacion/listado-descuento-certificacion.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { RouterModule } from '@angular/router';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { DescuentoCertificacionModule } from './descuento-certificacion/descuento-certificacion.module';

const routes = [
  {
    path: 'descuentos-certificaciones',
    component: ListadoDescuentoCertificacionComponent,
    resolve: {
      data: FichasDataService,
    },
    data: { url: '/api/v1/descuentos-certificaciones/all' }
  }
];

@NgModule({
  declarations: [ListadoDescuentoCertificacionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FichaListadoModule,
    DescuentoCertificacionModule,

    FuseSharedModule,
    FuseHighlightModule
  ],
  providers:[FichasDataService]
})
export class DescuentosCertificacionesModule { }
