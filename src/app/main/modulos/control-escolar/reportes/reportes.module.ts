import { NgModule } from '@angular/core';
import { ReporteListadoModule } from './reporte-grupos/reporte-grupos.module';
import { CriteriosListadoModule } from './criterios-evaluacion/criterios-evaluacion.module';
import { ReporteInasistenciasModule } from './reporte-inasistencias/reporte-inasistencias.module';
import { ReporteAsistenciasModule} from './reporte-asistencias/reporte-asistencias.module';
import { ReporteBecasModule} from './reporte-becas/reporte-becas.module';
import { ReportePCPModule } from './pcp/reporte-pcp.module';
import { ReporteCalificacionesModule } from './reporte-calificaciones/reporte-calificaciones.module';
import { ReporteGeneralGruposModule } from './general-grupos/general-grupos.module';
import { ReporteGeneralAlumnosModule } from './general-alumnos/general-alumnos.module';
import { ReporteAlumnosModule } from './reporte-alumnos/reporte-alumnos.module';
import { ReporteEficienciaGruposModule } from './eficiencia-grupos/eficiencia-grupos.module';
import { ReporteAvanceInscripcionesModule } from './avance-inscripciones/avance-inscripciones.module';


@NgModule({
    imports: [
        /* modulos */
        ReporteListadoModule,
        CriteriosListadoModule,
        ReporteInasistenciasModule,
        ReporteAsistenciasModule,
        ReporteCalificacionesModule,
        ReporteBecasModule,
        ReportePCPModule,
        ReporteGeneralGruposModule,
        ReporteEficienciaGruposModule,
        ReporteAvanceInscripcionesModule,
        ReporteGeneralAlumnosModule,
        ReporteAlumnosModule
    ]
})
export class ControlEscolarReportesModule {
}
