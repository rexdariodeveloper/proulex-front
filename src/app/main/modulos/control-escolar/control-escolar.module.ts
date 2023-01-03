import { NgModule } from '@angular/core';
import { AlumnosListadoModule } from './alumnos/alumnos.module';
import { AsistenciasListadoModule } from './asistencias/asistencias.module';
import { CalificacionesListadoModule } from './calificaciones/calificaciones.module';
import { DeduccionesPercepcionesModule } from './deducciones-percepciones/deducciones-percepciones.module';
import { KardexAlumnoModule } from './kardex-alumno/kardex-alumno.module';
import { PrenominaListadoModule } from './prenomina/prenomina.module';
import { ControlEscolarReportesModule } from './reportes/reportes.module';
import { ReporteListadoModule } from './reportes/reporte-grupos/reporte-grupos.module';
import { CriteriosListadoModule } from './reportes/criterios-evaluacion/criterios-evaluacion.module';
import { ExamenesCertificacionesModule } from './examenes-certificaciones/examenes-certificaciones.module';
import { ValidacionBoletasModule } from './validacion-boletas/validacion-boletas.module';
import { ValesCertificacionesModule } from './vales-certificaciones/vales-certificaciones.module';
/* importar modulos */

@NgModule({
    imports: [
        AlumnosListadoModule,
        CalificacionesListadoModule,
        AsistenciasListadoModule,
        DeduccionesPercepcionesModule,
        PrenominaListadoModule,
        KardexAlumnoModule,
        ControlEscolarReportesModule,
        ReporteListadoModule,
        CriteriosListadoModule,
        ExamenesCertificacionesModule,
        ValidacionBoletasModule,
        ValesCertificacionesModule
    ],
    declarations: []
})
export class ControlEscolarModule {
}
