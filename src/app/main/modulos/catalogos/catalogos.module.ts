import { NgModule } from '@angular/core';
/* importar modulos */
import { ProveedoresListadoModule } from './proveedores/proveedores.module';
import { ArticulosModule } from './articulos/articulos.module';
import { AlmacenesModule } from './almacenes/almacenes.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { CuentasBancariasModule } from './cuentas-bancarias/cuentas-bancarias.module';
import { EmpleadosListadoModule } from './empleados/empleados.module';
import { ProgramasListadoModule } from './programas/programas.module';
import { ClientesListadoModule } from './clientes/clientes.module';
import { TabuladoresListadoModule } from './tabuladores/tabuladores.module';
import { EntidadesListadoModule } from './entidades/entidades.module';
import { ConfiguracionDocumentoRHModule } from './configuracion-documentos-rh/configuracion-documentos-rh.module';
import { BancosListadoModule } from './bancos/bancos.module';
import { PrecioIncompanyListadoModule } from './precio-incompany/precio-incompany.module';
import { PuestosModule } from './puestos/puestos.module';
import { DescuentosCertificacionesModule } from './descuentos-certificaciones/descuentos-certificaciones.module';



@NgModule({
    imports: [
        /* modulos */
        ProveedoresListadoModule,
		ArticulosModule,
		AlmacenesModule,
        SucursalesModule,
        CuentasBancariasModule,
        EmpleadosListadoModule,
        ProgramasListadoModule,
        ClientesListadoModule,
        TabuladoresListadoModule,
        EntidadesListadoModule,
        ConfiguracionDocumentoRHModule,
        BancosListadoModule,
        PrecioIncompanyListadoModule,
        PuestosModule,
        DescuentosCertificacionesModule
    ]
})
export class CatalogosModule {
}
