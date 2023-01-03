import { NgModule } from '@angular/core';
import { BajasModule } from './bajas/bajas.module';
import { NuevasContratacionesModule } from './nuevas-contrataciones/nuevas-contrataciones.module';
import { RenovacionesModule } from './renovaciones/renovaciones.module';
import { ReportesModule } from './reportes/reportes.module';

@NgModule({
  imports: [
    NuevasContratacionesModule,
    RenovacionesModule,
    BajasModule,
    ReportesModule
  ],
  declarations: [
  ]
})
export class IngresoPromocionModule { }
