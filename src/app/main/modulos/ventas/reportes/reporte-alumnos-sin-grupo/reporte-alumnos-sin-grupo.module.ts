import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteAlumnosSinGrupoListadoComponent } from './reporte-alumnos-sin-grupo-listado/reporte-alumnos-sin-grupo-listado.component';
import { FichaDataService } from '@services/ficha-data.service';
import { RouterModule } from '@angular/router';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { ReporteAlumnosSinGrupoListadoService } from './reporte-alumnos-sin-grupo-listado/reporte-alumnos-sin-grupo-listado.service';
import { HttpService } from '@services/http.service';
import { FichasDataService } from '@services/fichas-data.service';

const routes = [
  {
      path: 'reportes/reporte-alumnos-sin-grupo',
      component: ReporteAlumnosSinGrupoListadoComponent,
      resolve: {
          data: FichasDataService,
      },
      data: { url: '/api/v1/reporte-alumnos-sin-grupo/all' }
  }
];

@NgModule({
  declarations: [ReporteAlumnosSinGrupoListadoComponent],
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
    ReporteAlumnosSinGrupoListadoService,
    HttpService
  ]
})
export class ReporteAlumnosSinGrupoModule { }
