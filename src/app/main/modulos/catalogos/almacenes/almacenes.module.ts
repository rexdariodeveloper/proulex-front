import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { NgxMaskModule } from 'ngx-mask';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FichasDataService } from '@services/fichas-data.service';
import { AlmacenesComponent } from './almacenes/almacenes.component';
import { AlmacenComponent } from './almacen/almacen.component';
import { AlmacenService } from './almacen/almacen.service';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { LocalidadService } from './almacen/localidad.service';
import { LocalidadDialogComponent } from './almacen/dialogs/localidad/localidad.dialog';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';

const routes = [
	{
		path: 'almacenes',
		component: AlmacenesComponent,
		resolve: {
			data: FichasDataService,
		},
		data: {
			url: '/api/v1/almacenes/all'
		}
	}, {
        path: 'almacenes/:handle', redirectTo: 'almacenes/:handle/', pathMatch: 'full'
    }, {
		path: 'almacenes/:handle/:id',
		component: AlmacenComponent,
		resolve: {
			data: AlmacenService,
		},
		data: {
			url: '/api/v1/almacenes/detalle/'
		},
		canDeactivate: [PendingChangesGuard]
	}
];

@NgModule({
	declarations: [
		// Components
		AlmacenesComponent,
		AlmacenComponent,
		LocalidadDialogComponent
	],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),

		MatIconModule,
		MatToolbarModule,
		MatRippleModule,
		MatButtonModule,
		MatSnackBarModule,
		MatMenuModule,
		MatTooltipModule,
		MatProgressBarModule,
		ScrollingModule,
		MatTabsModule,
		MatCardModule,
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		ImageCropperModule,
		NgxMaskModule,
		MatTableModule,

		TranslateModule,

		PixvsDynamicComponentModule,
		PixvsMatSelectModule,
		PixvsTablasModule,
		FichaCrudModule,

		FichaListadoModule,

		FuseSharedModule,
		FuseHighlightModule,
		FuseSidebarModule

	],
	providers: [
		AlmacenService,
		LocalidadService,
		FichasDataService,
		PendingChangesGuard
	],
	entryComponents: [
		LocalidadDialogComponent
	]
})

export class AlmacenesModule {}