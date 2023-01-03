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
import { MenuListadoGeneral } from '@models/menu-listado-general';
import { Validators, FormControl } from '@angular/forms';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { FichasDataService } from '@services/fichas-data.service';
import { ArchivoProjection } from '@models/archivo';
import { SolicitudesPagoDescargasService } from './descargas.service';

@Component({
	selector: 'solicitudes-pagos-listado',
	templateUrl: './solicitudes-pagos.component.html',
	styleUrls: ['./solicitudes-pagos.component.scss']
})
export class SolicitudesPagosComponent {

	regConfig: FieldConfig[];
	private _unsubscribeAll: Subject < any > ;

	config: FichaListadoConfig = {
		localeEN: english,
		localeES: spanish,
		icono: "input",
		columnaId: "id",
		rutaDestino: "/app/compras/solicitud-pago/",
		columns: [{
				name: 'codigoSolicitud',
				title: 'Código',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: true
			},{
				name: 'fechaSolicitud',
				title: 'Fecha Solicitud',
				class: "mat-column-flex",
				centrado: false,
				type: 'fecha',
				tooltip: true
			},{
				name: 'fechaVencimiento',
				title: 'Fecha Vencimiento',
				class: "mat-column-flex",
				centrado: false,
				type: 'fecha',
				tooltip: true
			},{
				name: 'sede',
				title: 'Sede',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'servicio',
				title: 'Tipo Servicio',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'proveedorNombre',
				title: 'Proveedor',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'montoRegistro',
				title: 'Monto',
				class: "mat-column-flex",
				centrado: false,
				type: 'decimal2',
				tooltip: true,
				prefijo: '$'
			},{
				name: 'usuario',
				title: 'Usuario',
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
			{ name: 'documentos', title: 'Documentos', class: "mat-column-flex", centrado: false, type: 'acciones' }
		],
		reordenamiento: false,
		displayedColumns: ['codigoSolicitud','fechaSolicitud','fechaVencimiento','sede','servicio','proveedorNombre','montoRegistro','usuario','estatus','documentos'],
		columasFechas: ['fechaSolicitud','fechaVencimiento'],
		listadoMenuOpciones: [{
			title: 'EXCEL',
			icon: 'arrow_downward',
			tipo: FichaListadoConfig.EXCEL,
			url: '/api/v1/solicitud-pago/download/excel'
		}],
		listadoAcciones: [{
			title: 'Factura',
			tipo: 'menu',
			icon: 'receipt',
			columnaOpcionesMenu: 'facturas',
			columnaMostrarOpcionMenu: 'nombreOriginal',
			accion: this.onMostrarFactura.bind(this)
		}]
	};

	constructor(
		public _ArticulosService: FichasDataService,
		public _descargasService: SolicitudesPagoDescargasService
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

}