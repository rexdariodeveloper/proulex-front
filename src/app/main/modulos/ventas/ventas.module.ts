import { NgModule } from '@angular/core';
import { ListaPreciosModule } from './lista-precios/lista-precios.module';
import { RemisionesListadoModule } from '../ventas/remisiones/remisiones.module';
import { DescuentosListadoModule } from './descuentos/descuentos.module';
import { PuntoVentaModule } from './punto-venta/punto-venta.module';
import { CortesListadoModule } from './cortes/cortes.module';
import { VentasReportesModule } from './reportes/reportes.module';
import { CancelacionesNotaVentaListadoModule } from './cancelaciones-nota-venta/cancelaciones-nota-venta.module';
/* importar modulos */


@NgModule({
    imports: [
        /* modulos */
        ListaPreciosModule,
        DescuentosListadoModule,
        RemisionesListadoModule,
        PuntoVentaModule,
        CortesListadoModule,
        VentasReportesModule,
        CancelacionesNotaVentaListadoModule
    ]
})
export class VentasModule {
}
