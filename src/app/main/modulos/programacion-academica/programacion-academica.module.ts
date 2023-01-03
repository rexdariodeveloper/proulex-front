import { NgModule } from '@angular/core';
/* importar modulos */
import { CursosListadoModule } from './cursos/cursos.module';
import { GruposModule } from './grupos/grupos.module';
import { ProgramacionAcademicaComercialListadoModule } from './programacion-academica-comercial/programacion-academica-comercial.module';
import { IncompanyModule } from './incompany/incompany.module';
import { MetasListadoModule } from './metas/metas.module';
import { ContratosListadoModule } from './contratos/contratos.module';
import { BecasListadoModule } from './becas/becas.module';
import { ProyeccionListadoModule } from './proyeccion-grupos/proyeccion-grupos.module';
import { PlantillaGruposModule } from './plantilla-grupos/plantilla-grupos.module';
import { ProgramacionAcademicaReportesModule } from './reportes/reportes.module';
import { WorkshopsListadoModule } from './workshops/workshops.module';

@NgModule({
    imports: [
        /* modulos */
        CursosListadoModule,
        GruposModule,
        ProgramacionAcademicaComercialListadoModule,
        IncompanyModule,
        MetasListadoModule,
        ContratosListadoModule,
        BecasListadoModule,
        ProyeccionListadoModule,
        PlantillaGruposModule,
        ProgramacionAcademicaReportesModule,
        WorkshopsListadoModule
    ]
})
export class ProgramacionAcademicaModule {
}
