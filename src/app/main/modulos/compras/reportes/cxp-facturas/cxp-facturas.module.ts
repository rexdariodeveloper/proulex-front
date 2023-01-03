import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteListadoComponent } from './reporte-listado/reporte-listado.component';
import { FichasDataService } from '@services/fichas-data.service';
import { RouterModule } from '@angular/router';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { HttpService } from '@services/http.service';
import { ReporteFacturasService } from './reporte-listado/reporte-listado.service';

const routes = [
  {
    path: 'reportes/cxp-facturas',
    component: ReporteListadoComponent,
    resolve: {
      data: FichasDataService,
    },
    data: { url: '/api/v1/reporte-cxpfacturas/all' }
  }
];

@NgModule({
  declarations: [ReporteListadoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    FichaListadoModule,

    FuseSharedModule,
    FuseHighlightModule,
    PixvsBloqueoPantallaModule
  ],
  providers: [
    FichasDataService,
    ReporteFacturasService,
    HttpService
  ]
})

export class ReporteCXPFacturasModule { }