import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule, FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
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
import { ArticulosComponent } from './articulos/articulos.component';
import { ArticulosService } from './articulos/articulos.service';
import { ArticuloComponent } from './articulo/articulo.component';
import { ArticuloService } from './articulo/articulo.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { NgxMaskModule } from 'ngx-mask';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FichasDataService } from '@services/fichas-data.service';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { MatTableModule } from '@angular/material/table';
import { ArticuloComponenteDialogComponent } from './articulo/dialogs/componente/componente.dialog';

const routes = [
	{
		path: 'articulos',
		component: ArticulosComponent,
		resolve: {
			data: FichasDataService,
		},
		data: {
			url: '/api/v1/articulos/all'
		}
	}, {
        path: 'articulos/:handle', redirectTo: 'articulos/:handle/', pathMatch: 'full'
    }, {
		path: 'articulos/:handle/:id',
		component: ArticuloComponent,
		resolve: {
			data: ArticuloService,
		},
		data: {
			url: '/api/v1/articulos/detalle/'
		},
		canDeactivate: [PendingChangesGuard]
	}
];

@NgModule({
	declarations: [
		// Components
		ArticulosComponent,
		ArticuloComponent,

		ArticuloComponenteDialogComponent
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
		MatTableModule,
		ImageCropperModule,
		NgxMaskModule,
		FuseConfirmDialogModule,

		TranslateModule,

		PixvsDynamicComponentModule,
		PixvsMatSelectModule,
		FichaCrudModule,

		FichaListadoModule,

		FuseSharedModule,
		FuseHighlightModule,
		FuseSidebarModule

	],
	providers: [
		ArticulosService,
		ArticuloService,
		FichasDataService,
		PendingChangesGuard
	],
	entryComponents: [
		ArticuloComponenteDialogComponent
	]
})

export class ArticulosModule {}