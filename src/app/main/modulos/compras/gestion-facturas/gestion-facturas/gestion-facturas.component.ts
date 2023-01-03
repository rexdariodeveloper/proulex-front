import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { Subject } from 'rxjs';
import { FichasDataService } from '@services/fichas-data.service';
import { title } from 'process';
import { FichaListadoComponent } from '@pixvs/componentes/fichas/ficha-listado/listado.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionFacturasService } from './gestion-facturas.service';
import { CXPFactura, CXPFacturaListadoProjection } from '@app/main/modelos/cxpfactura';
import { Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { ArchivoProjection } from '@models/archivo';

class MenusIds {
	static ProgramarPago = 1;
}

@Component({
	selector: 'gestion-facturas-listado',
	templateUrl: './gestion-facturas.component.html',
	styleUrls: ['./gestion-facturas.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class GestionFacturasListadoComponent {

	@ViewChild('ficha') ficha: FichaListadoComponent;

	regConfig: FieldConfig[];
	private _unsubscribeAll: Subject < any > ;

	config: FichaListadoConfig = { // TODO - añadir descargas
		localeEN: english,
		localeES: spanish,
		icono: "view_list",
		columnaId: "id",
		rutaDestino: "/app/compras/gestion-facturas/",
		columns: [{
				name: 'proveedorNombre',
				title: 'Proveedor',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: true
			},
			{
				name: 'codigoRegistro',
				title: 'Folio de factura',
				class: "mat-column-100",
				centrado: false,
				type: null,
				tooltip: true
			},
			{
				name: 'montoRegistro',
				title: 'Monto',
				class: "mat-column-100",
				centrado: false,
				type: 'decimal2',
				tooltip: true,
				prefijo: '$'
			},
			{
				name: 'fechaRegistro',
				title: 'Fecha de factura',
				class: "mat-column-100",
				centrado: true,
				type: 'fecha',
				tooltip: true
			},
			{
				name: 'fechaVencimiento',
				title: 'Fecha de vencimiento',
				class: "mat-column-100",
				centrado: true,
				type: 'fecha',
				tooltip: true
			},
			{
				name: 'sedeNombre',
				title: 'Sede',
				class: "mat-column-100",
				centrado: true,
				type: null,
				tooltip: true
			},
			{
				name: 'ordenCompraTexto',
				title: 'Orden compra',
				class: "mat-column-100",
				centrado: true,
				type: null,
				tooltip: true
			},
			{
				name: 'codigoRecibo',
				title: 'Código recibo',
				class: "mat-column-100",
				centrado: true,
				type: null,
				tooltip: true
			},
			{
				name: 'fechaReciboRegistro',
				title: 'Fecha recibo',
				class: "mat-column-100",
				centrado: true,
				type: 'fecha',
				tooltip: true
			},
			{
				name: 'relacionada',
				title: 'Relacionada',
				class: "mat-column-80",
				centrado: true,
				type: "boolean",
				tooltip: false,
				booleanTooltip: {
					'true': 'INTERFAZ.RELACIONADA',
					'false': 'INTERFAZ.NO_RELACIONADA'
				}
			},{
				name: 'acciones',
				title: 'Acciones',
				class: "mat-column-60",
				centrado: false,
				type: 'acciones'
			},{
				name: 'seleccion',
				title: '',
				class: "mat-column-60",
				centrado: true,
				type: "seleccion",
				tooltip: false,
				columnaIndicadorMostrarSeleccion: 'relacionada'
			}
		],
		reordenamiento: false,
		displayedColumns: ['proveedorNombre', 'codigoRegistro', 'montoRegistro', 'fechaRegistro', 'fechaVencimiento', 'sedeNombre', 'ordenCompraTexto', 'codigoRecibo', 'fechaReciboRegistro', 'relacionada','acciones','seleccion'],
		columasFechas: ['fechaRegistro', 'fechaVencimiento', 'fechaRecibo'],
		listadoMenuOpciones: [
			// { title: 'Programar pago', icon: 'payment', tipo: FichaListadoConfig.PERSONALIZADO, id: MenusIds.ProgramarPago }
		],
		omitirRedireccionVer: true,
		listadoAcciones: [{
			title: 'Editar factura',
			tipo: '',
			icon: 'edit',
			accion: this.onEditarFactura.bind(this),
			columnaIndicadorMostrar: 'relacionada'
		},{
			title: 'Cargar recibo',
			tipo: '',
			icon: 'file_copy',
			accion: this.onCargarRecibo.bind(this),
			columnaIndicadorOcultar: 'relacionada'
		},{
			title: 'Descargar evidencia',
			tipo: 'menu',
			icon: 'attachment',
			accion: this.onMostrarEvidencia.bind(this),
			columnaIndicadorMostrar: 'relacionada',
			columnaOpcionesMenu: 'evidencia',
			columnaMostrarOpcionMenu: 'nombreOriginal'
		},{
			title: 'Descargar factura',
			tipo: 'menu',
			icon: 'receipt',
			accion: this.onMostrarFactura.bind(this),
			columnaIndicadorMostrar: 'relacionada',
			columnaOpcionesMenu: 'facturas',
			columnaMostrarOpcionMenu: 'nombreOriginal'
		}],
		ocultarBotonNuevo: true,
		mostrarBotonEnviar: true,
		etiquetaEnviar: 'Enviar a programación',
		ocultarPaginador: true
	};

	constructor(
		public _fichasDataService: FichasDataService,
		public _gestionFacturasService: GestionFacturasService,
		private _matSnackBar: MatSnackBar,
		private router: Router,
		private hashid: HashidsService
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();

		console.log(this.hashid.encode(15));
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	ngOnInit(): void {

		this._fichasDataService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if (datos?.datos) {
					let proveedores = datos?.proveedores

					this.regConfig = [{
							type: "pixvsMatSelect",
							label: "Proveedores",
							name: "proveedores",
							formControl: new FormControl(null, [Validators.required]),
							validations: [],
							multiple: true,
							selectAll: false,
							list: proveedores,
							campoValor: 'nombre',
						},
						{
							type: "input",
							label: "Inicio",
							inputType: "date",
							name: "fechaInicio",
							validations: [{name: 'required',message: "Campo requerido", validator: Validators.required}]
						},
						{
							type: "input",
							label: "Fin",
							inputType: "date",
							name: "fechaFin",
							validations: [{name: 'required',message: "Campo requerido", validator: Validators.required}]
						}
					];
				}

			});

		this._gestionFacturasService.onEnviarChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(enviar => {
			if(enviar){
				this._fichasDataService.cargando = false;
				this._fichasDataService.getDatos();
			}
		})


	}

	onMenu(menu: ListadoMenuOpciones){
		if(menu.id = MenusIds.ProgramarPago){
			this.onProgramarPago();
		}
	}

	onProgramarPago(){
		let facturasSeleccionadasIds: number[] = Object.keys(this.ficha.objetosSeleccionadosMap).filter(facturaId => {
			return !!this.ficha.objetosSeleccionadosMap[facturaId];
		}).map(facturaId => {
			 return Number(facturaId);
		});

		if(!facturasSeleccionadasIds?.length){
			this._matSnackBar.open('Selecciona al menos una factura', 'OK', {
				duration: 5000,
			});
			return;
		}
		this._fichasDataService.cargando = true;

		this._gestionFacturasService.enviar(facturasSeleccionadasIds);
	}

	onMostrarEvidencia(archivosDescargar: ArchivoProjection | ArchivoProjection[]){
		if(Array.isArray(archivosDescargar)){
			let evidenciaIds: number[] = archivosDescargar.map(ev => {
				return Number(ev.id);
			});
			this._gestionFacturasService.getArchivos(evidenciaIds,'evidencia.zip');
		}else{
			this._gestionFacturasService.verArchivo(archivosDescargar);
		}
	}

	// onDescargarFactura(factura: CXPFacturaListadoProjection){
	// 	this._gestionFacturasService.descargarFactura(factura.id);
	// }
	onMostrarFactura(archivosDescargar: ArchivoProjection | ArchivoProjection[]){
		if(Array.isArray(archivosDescargar)){
			let facturaIds: number[] = archivosDescargar.map(ev => {
				return Number(ev.id);
			});
			this._gestionFacturasService.getArchivos(facturaIds,'factura.zip');
		}else{
			this._gestionFacturasService.verArchivo(archivosDescargar);
		}
	}

	onEditarFactura(factura: CXPFacturaListadoProjection){
		this.router.navigate([`/app/compras/gestion-facturas/ver/${this.hashid.encode(factura.id)}`]);
	}

	onCargarRecibo(recibo: CXPFacturaListadoProjection){
		this.router.navigate([`/app/compras/gestion-facturas/nuevo/cargar/${this.hashid.encode(recibo.id)}`]);
	}

}