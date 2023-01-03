import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import {  MatDatepickerModule } from '@angular/material/datepicker';

import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';

import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CargarFacturaComponent } from './cargar-factura.component';
import { CargarFacturaService } from './cargar-factura.service';
import { MatTableModule } from '@angular/material/table';
import { OrdenCompraDetallesDialogComponent } from './dialogs/orden-compra-detalles/orden-compra-detalles.dialog';
import { SubtotalCargarFacturaPipe } from './pipes/subtotal.pipe';
import { DescuentoCargarFacturaPipe } from './pipes/descuento.pipe';
import { IvaCargarFacturaPipe } from './pipes/iva.pipe';
import { RetencionesCargarFacturaPipe } from './pipes/retenciones.pipe';
import { TotalCargarFacturaPipe } from './pipes/total.pipe';
import { MontoCalculosModule } from '@app/main/directivas/monto-calculos/monto-calculos.module';
import { RedondearDirectiveModule } from '@app/main/directivas/redondear/redondear.module';
import { IepsCargarFacturaPipe } from './pipes/ieps.pipe';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { UtilsModule } from '@app/main/utils/utils.module';
import { ComentariosDialogModule } from '../../ordenes-compra/recibo/dialogs/comentarios/comentarios.dialog.module';



const routes = [

    {
        path: 'gestion-facturas/:handle',
        component: CargarFacturaComponent,
        resolve: {
            data: CargarFacturaService,
        },
		data: { url: '/api/v1/gestion-facturas/listados/' },
		canDeactivate: [PendingChangesGuard]
    },{
        path: 'gestion-facturas/:handle/cargar/:idExtra',
        component: CargarFacturaComponent,
        resolve: {
            data: CargarFacturaService,
        },
		data: { url: '/api/v1/gestion-facturas/listados/' },
		canDeactivate: [PendingChangesGuard]
    },{
        path: 'gestion-facturas/:handle/:id',
        component: CargarFacturaComponent,
        resolve: {
            data: CargarFacturaService,
        },
		data: { url: '/api/v1/gestion-facturas/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
		CargarFacturaComponent,
		OrdenCompraDetallesDialogComponent,

		SubtotalCargarFacturaPipe,
		DescuentoCargarFacturaPipe,
		IvaCargarFacturaPipe,
		IepsCargarFacturaPipe,
		RetencionesCargarFacturaPipe,
		TotalCargarFacturaPipe
    ],
    imports: [
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

        FichaCrudModule, 
		PixvsMatSelectModule,
		PixvsTablasModule,
		RedondearDirectiveModule,

		MontoCalculosModule,
		UtilsModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,

		ComentariosDialogModule

    ],
    providers: [
		CargarFacturaService,
		PendingChangesGuard
	],
	entryComponents: [
		OrdenCompraDetallesDialogComponent
	]
})
export class CargarFacturaModule {
}