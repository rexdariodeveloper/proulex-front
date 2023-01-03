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
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
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
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { SucursalesComponent } from './sucursales/sucursales.component';
import { SucursalService } from './sucursal/sucursal.service';
import { SucursalComponent } from './sucursal/sucursal.component';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { PixvsPhonePickerModule } from '@pixvs/componentes/phone-picker/phone-picker.module';

const routes = [
	{
		path: 'sucursales',
		component: SucursalesComponent,
		resolve: {
			data: FichasDataService,
		},
		data: {
			url: '/api/v1/sucursales/all'
		}
	}, {
        path: 'sucursales/:handle', redirectTo: 'sucursales/:handle/', pathMatch: 'full'
    }, {
		path: 'sucursales/:handle/:id',
		component: SucursalComponent,
		resolve: {
			data: SucursalService,
		},
		data: {
			url: '/api/v1/sucursales/detalle/'
		},
		canDeactivate: [PendingChangesGuard]
	}
];

@NgModule({
	declarations: [
		// Components
		SucursalesComponent,
		SucursalComponent
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
        MatRadioModule,
		MatProgressBarModule,
		ScrollingModule,
		MatTabsModule,
		MatCardModule,
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		ImageCropperModule,
		NgxMaskModule,
		PixvsPhonePickerModule,

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
		FichasDataService,
		SucursalService,
		PendingChangesGuard
	],
	entryComponents: [
	]
})

export class SucursalesModule {}