import { NgModule } from '@angular/core';
import { AjusteInventarioModule } from './ajuste-inventario/ajuste_inventario.module';
import { RecibirTransferenciasModule } from './recibir-transferencias/recibir-transferencias.module';
import { TransferenciaModule } from './transferencias/transferencias.module';
import { InventariosFisicosModule } from './inventarios-fisicos/inventarios-fisicos.module';
import { KardexArticulosModule } from './kardex-articulos/kardex-articulos.module';
import { ExistenciasModule } from './existencias/existencias.module';
import { PedidoModule } from './pedidos/pedidos.module';
import { SurtirPedidoModule } from './surtir-pedidos/surtir-pedidos.module';
import { RecibirPedidoModule } from './recibir-pedidos/recibir-pedidos.module';
import { ReportePedidosModule } from './reporte-pedidos/reporte-pedidos.module';
import { ValuacionModule } from './valuacion/valuacion.module';
import { TransitoModule } from './transito/transito.module';
import { ConsolidadoEntradasSalidasModule } from './consolidado-entradas-salidas/consolidado-entradas-salidas.module';
import { ContableInventariosModule } from './contable-inventarios/contable-inventarios.module';

@NgModule({
    imports: [
        AjusteInventarioModule,
        TransferenciaModule,
        RecibirTransferenciasModule,
        InventariosFisicosModule,
        KardexArticulosModule,
        ExistenciasModule,
        PedidoModule,
        SurtirPedidoModule,
        RecibirPedidoModule,
        ReportePedidosModule,
        ValuacionModule,
        TransitoModule,
        ConsolidadoEntradasSalidasModule,
        ContableInventariosModule
    ]
})

export class InventarioModule {
}