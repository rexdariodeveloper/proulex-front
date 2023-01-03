import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { HashidsService } from '@services/hashids.service';
import { Router, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Validators, FormControl } from '@angular/forms';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { FichasDataService } from '@services/fichas-data.service';
import { ArchivoProjection } from '@models/archivo';
import { SolicitudesPagoRHDescargasService } from './descargas.service';
import { CXPSolicitudPagoRHListadoProjection } from '@modelos/cxpsolicitud-pago-rh';

@Component({
	selector: 'solicitudes-pagos-rh-listado',
	templateUrl: './solicitudes-pagos-rh.component.html',
	styleUrls: ['./solicitudes-pagos-rh.component.scss']
})
export class SolicitudesPagosComponent {

	regConfig: FieldConfig[];
	private _unsubscribeAll: Subject < any > ;

	config: FichaListadoConfig = {
		localeEN: english,
		localeES: spanish,
		icono: "how_to_reg",
		columnaId: "id",
		rutaDestino: "/app/compras/solicitud-pago-rh/",
		columns: [{
				name: 'codigo',
				title: 'Código',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: true
			},{
				name: 'fechaCreacion',
				title: 'Fecha Solicitud',
				class: "mat-column-flex",
				centrado: false,
				type: 'fecha-hora',
				tooltip: true
			},{
				name: 'nombre',
				title: 'Nombre Empleado',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'tipoPago',
				title: 'Tipo Pago',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'monto',
				title: 'Monto',
				class: "mat-column-flex",
				centrado: false,
				type: 'decimal2',
				tooltip: true,
				prefijo: '$'
			},{
				name: 'usuarioCreador',
				title: 'Creado por',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'estatus',
				title: 'Estatus',
				class: "mat-column-80",
				centrado: false,
				type: null,
				tooltip: false
			},
			{ name: 'acciones', title: 'Acciones', class: "mat-column-flex", centrado: false, type: 'acciones' }
		],
		reordenamiento: false,
		displayedColumns: ['codigo','fechaCreacion','nombre','tipoPago','monto','usuarioCreador','estatus','acciones'],
		columasFechas: ['fechaSolicitud','fechaVencimiento'],
		listadoMenuOpciones: [{
			title: 'EXCEL',
			icon: 'arrow_downward',
			tipo: FichaListadoConfig.EXCEL,
			url: '/api/v1/solicitud-pago-rh/download/excel'
		}],
		listadoAcciones: [{
			title: 'Copiar',
			tipo: null,
			icon: 'repeat',
			accion: this.onCopiar.bind(this)
		}]
	};

	constructor(
		public _ArticulosService: FichasDataService,
		public _descargasService: SolicitudesPagoRHDescargasService,
		private router: Router,
		private hashid: HashidsService
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	ngOnInit(): void {

		this._ArticulosService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if (datos?.datos) {

					// this.regConfig = [
					// ];
				}

			});


	}

	onMostrarFactura(archivosDescargar: ArchivoProjection | ArchivoProjection[]){
		if(Array.isArray(archivosDescargar)){
			let facturasIds: number[] = archivosDescargar.map(ev => {
				return Number(ev.id);
			});
			this._descargasService.getFactura(facturasIds);
		}else{
			this._descargasService.verArchivo(archivosDescargar);
		}
	}

	onCopiar(solicitud: CXPSolicitudPagoRHListadoProjection){
		this.router.navigate([`/app/compras/solicitud-pago-rh/editar/${this.hashid.encode(solicitud.id)}`],{queryParams: {esCopia: true}});
		// this.router.navigate([`/app/compras/solicitud-pago-rh/copia/${this.hashid.encode(solicitud.id)}`]);
	}

}