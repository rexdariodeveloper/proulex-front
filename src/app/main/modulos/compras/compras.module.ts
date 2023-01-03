import { NgModule } from '@angular/core';
import { ConvertirRequisicionModule } from './convertir-requisicion/convertir-requisicion.module';
import { GestionFacturasModule } from './gestion-facturas/gestion-facturas.module';
import { ListadoAlertasModule } from './listado-alertas/listado-alertas.module';
/* importar modulos */
import { OrdenesCompraListadoModule } from './ordenes-compra/ordenes-compra.module';
import { PagoProveedoresModule } from './pago-proveedores/pago-proveedores.module';
import { ProgramacionPagosModule } from './programacion-pagos/programacion-pagos.module';
import { EstadoCuentaModule } from './reportes/estado-cuenta/estado-cuenta.module';
import { ReporteHistorialComprasModule } from './reportes/historial-compras/historial-compras.module';
import { ReporteOrdenesCompraModule } from './reportes/ordenes-compra/ordenes-compra.module';
import { ComprasReportesModule } from './reportes/reportes.module';
import { RequisicionesListadoModule } from './requisiciones/requisiciones.module';
import { SolicitudPagoModule } from './solicitudes-pagos/solicitudes-pagos.module';
import { SolicitudPagoRHModule } from './solicitudes-pagos-rh/solicitudes-pagos-rh.module';

@NgModule({
	imports: [
        /* modulos */
		OrdenesCompraListadoModule,
		GestionFacturasModule,
		ProgramacionPagosModule,
		PagoProveedoresModule,
		ComprasReportesModule,
		RequisicionesListadoModule,
		ConvertirRequisicionModule,
		ReporteOrdenesCompraModule,
		ReporteHistorialComprasModule,
		EstadoCuentaModule,
		SolicitudPagoModule,
		ListadoAlertasModule,
		SolicitudPagoRHModule
    ]
})
export class ComprasModule {
}
