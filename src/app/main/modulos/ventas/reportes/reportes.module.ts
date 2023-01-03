import { NgModule } from '@angular/core';
import { ReporteInscripcionesModule } from './inscripciones/inscripciones.module';
import { ReportePagosAlumnosModule } from './pagos-alumnos/pagos-alumnos.module';
import { ReporteAlumnosSinGrupoModule } from './reporte-alumnos-sin-grupo/reporte-alumnos-sin-grupo.module';
import { VentasListadoModule } from './ventas/ventas.module';

@NgModule({
    imports: [
        /* modulos */
        ReportePagosAlumnosModule,
        VentasListadoModule,
        ReporteInscripcionesModule,
        ReporteAlumnosSinGrupoModule
    ]
})
export class VentasReportesModule {
}
