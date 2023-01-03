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
import { MatCardModule } from '@angular/material/card';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { NgxMaskModule } from 'ngx-mask';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FichasDataService } from '@services/fichas-data.service';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { SolicitudesPagosComponent } from './solicitudes-pagos-rh/solicitudes-pagos-rh.component';
import { SolicitudPagoRHService } from './solicitud-pago-rh/solicitud-pago-rh.service';
import { SolicitudPagoRHComponent } from './solicitud-pago-rh/solicitud-pago-rh.component';
import { SolicitudesPagoRHDescargasService } from './solicitudes-pagos-rh/descargas.service';

const routes = [
	{
		path: 'solicitud-pago-rh',
		component: SolicitudesPagosComponent,
		resolve: {
			data: FichasDataService,
		},
		data: {
			url: '/api/v1/solicitud-pago-rh/all'
		}
	}, {
        path: 'solicitud-pago-rh/:handle', redirectTo: 'solicitud-pago-rh/:handle/', pathMatch: 'full'
    }, {
		path: 'solicitud-pago-rh/:handle/:id',
		component: SolicitudPagoRHComponent,
		resolve: {
			data: SolicitudPagoRHService,
		},
		data: {
			url: '/api/v1/solicitud-pago-rh/listados/'
		}
	}
];

@NgModule({
	declarations: [
		// Components
		SolicitudesPagosComponent,
		SolicitudPagoRHComponent
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
		SolicitudPagoRHService,
		FichasDataService,
		SolicitudesPagoRHDescargasService
	]
})

export class SolicitudPagoRHModule {}