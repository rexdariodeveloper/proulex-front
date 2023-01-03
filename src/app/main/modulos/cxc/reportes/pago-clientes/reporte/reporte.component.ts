import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HashidsService } from '@services/hashids.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Validators, FormControl } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { takeUntil } from 'rxjs/operators';
import { ReportePagoClientesService } from './reporte.service';
import { FiltrosSidebarComponent } from '../sidebars/filtros/filtros.component';
import { fuseAnimations } from '@fuse/animations';
import { PixvsMatAccordionCell } from '@pixvs/componentes/mat-accordion/mat-accordion.component';
import * as moment from 'moment';

@Component({
	selector: 'reporte-antiguedad-saldos',
	templateUrl: './reporte.component.html',
	styleUrls: ['./reporte.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class ReportePagoProveedoresComponent {

	filtros: FieldConfig[];
	filtrosOpciones: any;

	@ViewChild('filtrado')
	filtrosSidebar: FiltrosSidebarComponent;

	//Tabla
	data: any[] = [];
	headers: PixvsMatAccordionCell[] = [
		{ name: 'Fecha registro', value: 'fechaRegistro', flex: '0 0 8%', type: 'fecha' },
		{ name: 'Cliente', value: 'cliente', flex: '0 0 15%' },
		{ name: 'No operación', value: 'numeroOperacion', flex: '0 0 10%' },
		{ name: 'Moneda', value: 'moneda', flex: '0 0 10%' },
		{ name: 'Monto', value: 'monto', flex: '0 0 10%', type: 'money' },
		{ name: 'Tipo de cambio', value: 'tipoCambio', flex: '0 0 10%' },
		{ name: 'Fecha pago', value: 'fechaPago', flex: '0 0 10%', type: 'fecha' },
		{ name: 'Forma pago', value: 'formaPago', flex: '0 0 10%' },
		{ name: 'Cuenta', value: 'cuenta', flex: '0 0 11%' },
		{ name: 'XML', value: 'id', flex: '0 0 3%', type: 'action', icon: 'receipt', action: this.descargarPagoXML.bind(this) },
		{ name: 'PDF', value: 'id', flex: '0 0 3%', type: 'action', icon: 'receipt', action: this.descargarPagoPDF.bind(this) }
	];
	details: PixvsMatAccordionCell[] = [
		{ name: 'Sede', value: 'sede', flex: '0 0 19%' },
		{ name: 'No factura', value: 'numeroFactura', flex: '0 0 15%' },
		{ name: 'Fecha', value: 'fechaFactura', flex: '0 0 10%', type: 'fecha' },
		{ name: 'Monto', value: 'montoFactura', flex: '0 0 15%', type: 'money' },
		{ name: 'Importe pagado', value: 'importePagado', flex: '0 0 15%', type: 'money' },
		{ name: 'Saldo', value: 'saldo', flex: '0 0 10%', type: 'money' },
		{ name: 'Método de pago', value: 'metodoPago', flex: '0 0 10%' },
		{ name: 'XML', value: 'id', flex: '0 0 3%', type: 'document', icon: 'receipt', action: this.descargarFacturaXML.bind(this) },
		{ name: 'PDF', value: 'id', flex: '0 0 3%', type: 'document', icon: 'receipt', action: this.descargarFacturaPDF.bind(this) }
	]

	// Private
	private _unsubscribeAll: Subject<any>;

	constructor(
		public _reporteService: ReportePagoClientesService,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _fuseSidebarService: FuseSidebarService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
		private hashid: HashidsService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);
		this._reporteService.translate = this.translate;

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this._reporteService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if (datos?.sedes) {
					this.filtros = [
						{
							type: "input",
							label: "Fecha inicio",
							inputType: "date",
							name: "fechaInicio",
							validations: [{
								name: 'required',
								validator: Validators.required,
								message: this.translate.instant('ERRORES_CAPTURA.CAMPO_REQUERIDO')
							}],
							value: moment(new Date()).format('YYYY-MM-DD')
						},
						{
							type: "input",
							label: "Fecha fin",
							inputType: "date",
							name: "fechaFin",
							validations: [{
								name: 'required',
								validator: Validators.required,
								message: this.translate.instant('ERRORES_CAPTURA.CAMPO_REQUERIDO')
							}],
							value: moment(new Date()).format('YYYY-MM-DD')
						},
						{
							type: "pixvsMatSelect",
							label: "Sede",
							name: "sedes",
							formControl: new FormControl(null, [Validators.required]),
							validations: [{
								name: 'required',
								validator: Validators.required,
								message: this.translate.instant('ERRORES_CAPTURA.CAMPO_REQUERIDO')
							}],
							multiple: true,
							selectAll: true,
							list: datos.sedes,
							campoValor: 'nombre',
						},
						{
							type: "pixvsMatSelect",
							label: "Cliente",
							name: "clientes",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: false,
							list: datos.clientes,
							campoValor: 'codigo',
							values: ['codigo', 'nombre']
						},
						{
							type: "input",
							label: 'Número de documento',
							inputType: "text",
							name: "numeroDocumento",
							validations: [],
							value: null
						},
						{
							type: "pixvsMatSelect",
							label: "Moneda",
							name: "moneda",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: datos.monedas,
							campoValor: 'nombre',
						},
						{
							type: "pixvsMatSelect",
							label: "Forma de pago",
							name: "formaPago",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: false,
							list: datos.formasPago,
							campoValor: 'valor',
						},
						{
							type: "pixvsMatSelect",
							label: "Cuenta",
							name: "cuenta",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: datos.cuentas,
							campoValor: 'codigo',
							values: ['codigo', 'descripcion']
						},
					];

					this.filtrosOpciones = [
						{ title: 'Exportar a excel', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/reporte-cxcpago-clientes/xlsx' }
					];
				} else {
					let pagos: any[] = datos?.pagos || [];

					if (pagos.length) {
						let facturas: any[] = datos.facturas;

						if (facturas) {
							pagos.forEach(pago => {
								pago.facturas = facturas.filter(factura => factura.pagoId == pago.id);
							});
						}
					} else {
						this._matSnackBar.open(this.translate.instant('MENSAJE.NO_INFO'), 'OK', { duration: 5000 });
					}

					this.setDatosTablas(pagos);
				}
			});
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	ngAfterViewInit(): void {
		this.filtrosSidebar._FichasDataService.translate = this.translate;
	}

	toggleSidebar(name): void {
		this._fuseSidebarService.getSidebar(name).toggleOpen();
	}

	setDatosTablas(datos) {
		let tabla = [...datos];

		let rows = [];
		tabla.forEach(pago => {
			let row = pago;

			row.children = pago.facturas;

			rows.push(row);
		});

		this.data = [].concat(rows);
	}

	descargarPagoXML(id, event) {
		event.stopPropagation();

		this._reporteService.descargarArchivosPago(id, 'xml');
	}

	descargarPagoPDF(id, event) {
		event.stopPropagation();

		this._reporteService.descargarArchivosPago(id, 'pdf');
	}

	descargarFacturaXML(id, event) {
		this._reporteService.descargarArchivosPagoDetalle(id, 'xml');
	}

	descargarFacturaPDF(id, event) {
		this._reporteService.descargarArchivosPagoDetalle(id, 'pdf');
	}
}