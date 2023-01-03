import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { OrdenCompraComponent } from './orden-compra.component';
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

import { OrdenCompraService } from './orden-compra.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { ArticulosService } from './articulos.service';
import { ArticuloDialogComponent } from './dialogs/articulo/articulo.dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SubtotalOCPipe } from './pipes/subtotal.pipe';
import { IvaOCPipe } from './pipes/iva.pipe';
import { IepsOCPipe } from './pipes/ieps.pipe';
import { DescuentoOCPipe } from './pipes/descuento.pipe';
import { TotalOCPipe } from './pipes/total.pipe';
import { MontoCalculosModule } from '@app/main/directivas/monto-calculos/monto-calculos.module';
import { MatTableModule } from '@angular/material/table';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { NgxPrintModule } from 'ngx-print';
import { OrderReportPrintComponent } from './prints/invoice.print';
import { TextoPipe } from '@pixvs/utils/pipes/texto.pipe';
import { MatPaginatorModule } from '@angular/material/paginator';
import { OrdenCompraComentariosDialogComponent } from './dialogs/comentarios/comentarios.dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { UtilsModule } from '@app/main/utils/utils.module';



const routes = [

    {
        path: 'ordenes-compra/:handle', redirectTo: 'ordenes-compra/:handle/', pathMatch: 'full'
    },
    {
        path: 'ordenes-compra/:handle/:id',
        component: OrdenCompraComponent,
        resolve: {
            data: OrdenCompraService,
        },
		data: { url: '/api/v1/ordenes-compra/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
		OrdenCompraComponent,
		
        ArticuloDialogComponent,
        OrderReportPrintComponent,
		OrdenCompraComentariosDialogComponent,

		SubtotalOCPipe,
		IvaOCPipe,
		IepsOCPipe,
		DescuentoOCPipe,
        TotalOCPipe
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
		NgxMaskModule,
		MatTableModule,
		MatPaginatorModule,
		MatExpansionModule,

		NgxPrintModule,

        FichaCrudModule, 
		PixvsMatSelectModule,
		PixvsTablasModule,

		MontoCalculosModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,

		UtilsModule

    ],
    providers: [
		OrdenCompraService,
		ArticulosService,
		PendingChangesGuard
	],
	entryComponents: [
		ArticuloDialogComponent,
		OrdenCompraComentariosDialogComponent
	]
})
export class OrdenCompraModule {
}