import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { ProgramacionPagosComponent } from './programacion-pagos/programacion-pagos.component';
import { ProgramacionPagosService } from './programacion-pagos/programacion-pagos.service';
import { CancelarFacturaDialogComponent } from './programacion-pagos/dialogs/cancelar-factura/cancelar-factura.dialog';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { NgxMaskModule } from 'ngx-mask';
import { MatExpansionModule } from '@angular/material/expansion';
import { PagosRhPipe } from './programacion-pagos/pipes/filtrar-pagos-rh.pipe';
import { MontoPagarPipe } from './programacion-pagos/pipes/monto-pagar.pipe';
import { ProveedoresSeleccionadosPipe } from './programacion-pagos/pipes/proveedores-seleccionados.pipe';
import { SaldoTotalPipe } from './programacion-pagos/pipes/saldo-total.pipe';
import { SaldoProveedorPipe } from './programacion-pagos/pipes/saldo-proveedor.pipe';
import { MontoPagarProveedorPipe } from './programacion-pagos/pipes/monto-pagar-proveedor.pipe';
import { MontoPagarProveedoresPipe } from './programacion-pagos/pipes/monto-pagar-proveedores.pipe';
import { ResumenDialogComponent } from './programacion-pagos/dialogs/resumen/resumen.dialog';
import { UtilsModule } from '@app/main/utils/utils.module';
import { FiltrosReporteSidebarComponent } from './programacion-pagos/sidebars/filtros/filtros-reporte-sidebar.component';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { TranslateModule } from '@ngx-translate/core';
import { CXPSolicitudPagoDetalleModule } from './detalle/detalle.module';


const routes = [
    {
        path: 'programacion-pagos',
        component: ProgramacionPagosComponent,
        resolve: {
            data: ProgramacionPagosService,
        },
        data: { url: '/api/v1/programacion-pagos/all' }
    }
];

@NgModule({
    declarations: [
		ProgramacionPagosComponent,
		CancelarFacturaDialogComponent,
		ResumenDialogComponent,
        FiltrosReporteSidebarComponent,

        PagosRhPipe,
		MontoPagarPipe,
		ProveedoresSeleccionadosPipe,
		SaldoTotalPipe,
		SaldoProveedorPipe,
		MontoPagarProveedorPipe,
		MontoPagarProveedoresPipe
    ],
    imports: [
        CommonModule,
		RouterModule.forChild(routes),
		
		MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatDialogModule,
        MatProgressBarModule,
        MatCardModule,
		MatDatepickerModule,
		MatCheckboxModule,
		MatTableModule,
		NgxMaskModule,
		MatExpansionModule,
        TranslateModule,

        PixvsDynamicComponentModule,

		FichaCrudModule,
		UtilsModule,
        FuseSidebarModule,

        FuseSharedModule,
        FuseHighlightModule,

		CXPSolicitudPagoDetalleModule
    ],
    providers: [
		FichasDataService,
		ProgramacionPagosService
	],
	entryComponents: [
		CancelarFacturaDialogComponent,
		ResumenDialogComponent,
        FiltrosReporteSidebarComponent
	]
})

export class ProgramacionPagosModule {
}