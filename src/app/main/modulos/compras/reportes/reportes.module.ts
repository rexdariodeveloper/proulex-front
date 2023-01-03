import { NgModule } from '@angular/core';
import { ReporteAntiguedadSaldosModule } from './antiguedad-saldos/antiguedad-saldos.module';
import { ReporteConfirmingModule } from './confirming/confirming.module';
import { ReporteCXPFacturasModule } from './cxp-facturas/cxp-facturas.module';
import { ReporteCXPModule } from './cxp/cxp.module';
import { ReportePagoProveedoresModule } from './pago-proveedores/pago-proveedores.module';
import { RecibosOCModule } from './recibos-oc/recibos-oc.module';

@NgModule({
    imports: [
        /* modulos */
        ReporteAntiguedadSaldosModule,
        ReportePagoProveedoresModule,
        ReporteCXPModule,
        RecibosOCModule,
        ReporteConfirmingModule,
        ReporteCXPFacturasModule
    ]
})

export class ComprasReportesModule { }