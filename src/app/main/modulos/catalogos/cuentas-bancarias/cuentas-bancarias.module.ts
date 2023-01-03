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
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { CuentaBancariaService } from './cuenta-bancaria/cuenta-bancaria.service';
import { CuentasBancariasComponent } from './cuentas-bancarias/cuentas-bancarias.component';
import { CuentaBancariaComponent } from './cuenta-bancaria/cuenta-bancaria.component';
import { MatListModule } from '@angular/material/list';

const routes = [
	{
		path: 'cuentas-bancarias',
		component: CuentasBancariasComponent,
		resolve: {
			data: FichasDataService,
		},
		data: {
			url: '/api/v1/cuentas-bancarias/all'
		}
	}, {
        path: 'cuentas-bancarias/:handle', redirectTo: 'cuentas-bancarias/:handle/', pathMatch: 'full'
    }, {
		path: 'cuentas-bancarias/:handle/:id',
		component: CuentaBancariaComponent,
		resolve: {
			data: CuentaBancariaService,
		},
		data: {
			url: '/api/v1/cuentas-bancarias/detalle/'
		},
		canDeactivate: [PendingChangesGuard]
	}
];

@NgModule({
	declarations: [
		// Components
		CuentasBancariasComponent,
		CuentaBancariaComponent
	],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),

        MatListModule,
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
		CuentaBancariaService,
		PendingChangesGuard
	],
	entryComponents: [
	]
})

export class CuentasBancariasModule {}