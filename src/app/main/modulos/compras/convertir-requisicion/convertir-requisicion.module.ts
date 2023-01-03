import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { ConvertirRequisicionService } from './convertir-requisicion/convertir-requisicion.service';
import { ConvertirRequisicionComponent } from './convertir-requisicion/convertir-requisicion.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { FiltrosSidebarComponent } from './sidebars/filtros/filtros.component';
import { UMArticuloPipe } from './pipes/um-articulo.pipe';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { UltimasComprasDialogComponent } from './convertir-requisicion/dialogs/ultimas-compras/ultimas-compras.dialog';
import { ConvertirDialogComponent } from './convertir-requisicion/dialogs/convertir/convertir.dialog';
import { CategoriasPipe } from './pipes/categorias.pipe';
import { SubcategoriasPipe } from './pipes/subcategorias.pipe';
import { ArticulosPipe } from './pipes/articulos.pipe';
import { RechazarPartidaDialogComponent } from './convertir-requisicion/dialogs/rechazar-partida/rechazar-partida.dialog';
import { MontoCalculosModule } from '@app/main/directivas/monto-calculos/monto-calculos.module';
import { RequisicionComentariosDialogModule } from '../requisiciones/requisicion/dialogs/comentarios/comentarios.dialog.module';
import { NgxPrintModule } from 'ngx-print';
import { EditarPartidaConvertirDialogComponent } from './convertir-requisicion/dialogs/editar-partida/editar-partida.dialog';
import { PixvsBuscadorAmazonModule } from '@pixvs/componentes/buscador-amazon/buscador-amazon.module';
import { OrderReportPrintComponent } from './convertir-requisicion/prints/invoice.print';
import { LetraPipe } from './pipes/letra.pipe';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxMaskModule } from 'ngx-mask';
import { UtilsModule } from '@app/main/utils/utils.module';


const routes = [
    {
        path: 'convertir-requisicion',
        component: ConvertirRequisicionComponent,
        resolve: {
            data: ConvertirRequisicionService,
        },
        data: { url: '/api/v1/convertir-requisicion/all' }
    }
];

@NgModule({
    declarations: [
		ConvertirRequisicionComponent,
		FiltrosSidebarComponent,
		UMArticuloPipe,
		UltimasComprasDialogComponent,
		ConvertirDialogComponent,
		CategoriasPipe,
		SubcategoriasPipe,
		ArticulosPipe,
		RechazarPartidaDialogComponent,
		EditarPartidaConvertirDialogComponent,
        OrderReportPrintComponent,
        LetraPipe
    ],
    imports: [
        CommonModule,
		RouterModule.forChild(routes),
		MatIconModule,
        MatPaginatorModule,
        MatTableModule,
        MatToolbarModule,
        MatRippleModule,
        MatSortModule,
        MatButtonModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatDatepickerModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule,
        CdkTableModule,
        CdkTreeModule,
        DragDropModule,
		ScrollingModule,
		MatDatepickerModule,
		MatExpansionModule,
		NgxMaskModule,

		NgxPrintModule,

		FichaListadoModule,

		TranslateModule,

		PixvsDynamicComponentModule,
		PixvsMatSelectModule,
		PixvsBuscadorAmazonModule,

		MontoCalculosModule,
		RequisicionComentariosDialogModule,

		FuseSidebarModule,
        FuseSharedModule,
        FuseHighlightModule,

		UtilsModule

    ],
    providers: [
		FichasDataService,
		ConvertirRequisicionService,
	],
	entryComponents: [
		UltimasComprasDialogComponent,
		ConvertirDialogComponent,
		RechazarPartidaDialogComponent,
        OrderReportPrintComponent
	]
})

export class ConvertirRequisicionModule {
}