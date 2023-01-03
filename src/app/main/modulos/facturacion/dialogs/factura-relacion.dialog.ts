import { Component, Inject, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CXCFactura } from '@app/main/modelos/cxcfactura';
import { ImpuestosArticuloSATService } from '@app/main/services/impuestos-articulo-sat.service';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FacturaNotaVentaService } from '../factura-nota-venta/factura-nota-venta/factura-nota-venta.service';
import { FacturasRelacionDetalleService } from '../facturas-relacion-detalle.service';

export interface FacturaRelacionDialogData {
	camposListado: FieldConfig[];
	onAceptar: (registro: any) => void;
	listadoSedes: any[];
	listadoTiposRelacion: any[];
}

@Component({
	selector: 'factura-relacion-dialog',
	templateUrl: './factura-relacion.dialog.html',
	styleUrls: ['./factura-relacion.dialog.scss'],
	animations: fuseAnimations,
})
export class FacturaRelacionDialogComponent {

	@ViewChild('camposDinamicos') camposDinamicos: PixvsDynamicComponent;

	localeEN = generalEN;
	localeES = generalES;

	camposListado: FieldConfig[];
	_unsubscribeAll: Subject<any>;
	listadoSedes: any[];
	listadoTiposRelacion: any[];
	form: FormGroup;

	factura: CXCFactura;

	//Tabla Detalles
	tablaDetalles = [];

	columnasTabla: any[] = [
		{
			name: 'cantidad',
			title: "Cantidad",
			class: "mat-column-flex",
			centrado: false,
			type: 'decimal2',
			tooltip: false
		},
		{
			name: 'descripcion',
			title: "Descripción",
			class: "mat-column-flex",
			centrado: false,
			type: null,
			tooltip: false
		},
		{
			name: 'valorUnitario',
			title: "Precio unitario",
			class: "mat-column-flex",
			centrado: false,
			type: 'decimal2',
			dir: 'rtl',
			tooltip: false
		},
		{
			name: 'descuento',
			title: "Descuento",
			class: "mat-column-flex",
			centrado: false,
			type: 'decimal2',
			dir: 'rtl',
			tooltip: false
		},
		{
			name: 'sumaImpuestos',
			title: "Impuestos",
			class: "mat-column-flex",
			centrado: false,
			type: 'decimal2',
			dir: 'rtl',
			tooltip: false
		},
		{
			name: 'total',
			title: "Total",
			class: "mat-column-flex",
			centrado: false,
			type: 'decimal2',
			dir: 'rtl',
			tooltip: false
		}
	];
	columnasFechas: string[] = [];
	displayedColumns: string[] = ['cantidad', 'descripcion', 'valorUnitario', 'descuento', 'sumaImpuestos', 'total'];

	constructor(
		public dialogRef: MatDialogRef<FacturaRelacionDialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
		public _facturaService: FacturaNotaVentaService,
		public _facturaDetallesServices: FacturasRelacionDetalleService,
		public _impuestosService: ImpuestosArticuloSATService,
		@Inject(MAT_DIALOG_DATA) public data: FacturaRelacionDialogData
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		// Set the private defaults
		this._unsubscribeAll = new Subject();

		this.setData(data);
	}

	setData(data: FacturaRelacionDialogData) {
		this.camposListado = data.camposListado;
		this.listadoSedes = data.listadoSedes;
		this.listadoTiposRelacion = data.listadoTiposRelacion;

		setTimeout(() => {
			this.form = this.camposDinamicos.form.form;

			for (let campoRegistro in this.form.controls) {
				this.form.controls[campoRegistro].setValue(null);
				this.form.controls[campoRegistro].markAsUntouched();
				this.form.controls[campoRegistro].updateValueAndValidity();
			}

			this._facturaService.onFacturaRelacionChanged
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe(datos => {
					if (datos) {
						this._facturaService.onFacturaRelacionChanged.next(null);
						this.factura = datos.factura;

						let tablaDetalles = datos.factura?.detalles || [];

						tablaDetalles.forEach(modelo => {
							modelo.impuestos.forEach(impuesto => {
								if (impuesto.clave === '002') {
									modelo.iva = (impuesto.tasaOCuota * 100);
								} else if (impuesto.clave === '003') {
									modelo.ieps = (impuesto.tipoFactor === 'Tasa' ? (impuesto.tasaOCuota * 100) : null);
									modelo.iepsCuotaFija = (impuesto.tipoFactor === 'Cuota' ? impuesto.tasaOCuota : null);
								}
							});

							var valores = this._impuestosService.getMontos(modelo.cantidad, modelo.valorUnitario, modelo.descuento, modelo.iva, modelo.ieps, modelo.iepsCuotaFija);

							modelo.subtotal = valores.subtotal;
							modelo.importeIVA = valores.iva;
							modelo.importeIEPS = valores.ieps;
							modelo.sumaImpuestos = valores.iva + valores.ieps;
							modelo.total = valores.total;
						});

						this.tablaDetalles = [...tablaDetalles];
						this._facturaDetallesServices.setDatos(this.tablaDetalles);
					}
				});

			this.form.controls.sede.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
				let sedeId: number = this.form.controls.sede.value ? this.form.controls.sede.value.id : null;

				this.form.controls.factura.setValue(null);
			});
		});
	}

	cancelar(): void {
		this.data.onAceptar(null);
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			if (this.factura) {
				this.factura.tipoRelacionId = this.form.controls.tipoRelacion.value.id;
				this.factura.tipoRelacion = this.form.controls.tipoRelacion.value;
				this.factura.total = this.getTotales().total;

				this.data.onAceptar(this.factura);
				this.dialogRef.close();
			} else {
				this._matSnackBar.open('Favor de buscar una Factura.', 'OK', { duration: 5000, });
			}
		} else {
			this.camposDinamicos.form.validateAllFormFields(this.form);
		}
	}

	buscarFactura(): void {
		this.factura = null;

		if (this.form.valid) {
			this._facturaService.getDatosFacturaRelacion(this.form.controls.sede.value.id, this.form.controls.factura.value);
		} else {
			this.factura = null;

			let tablaDetalles = [];
			this.tablaDetalles = [...tablaDetalles];
			this._facturaDetallesServices.setDatos(this.tablaDetalles);
		}
	}

	getTotales() {
		var subtotal = 0;
		var descuento = 0;
		var iva = 0;
		var ieps = 0;
		var total = 0;

		this._facturaDetallesServices.getDatos().forEach(modelo => {
			subtotal += modelo.subtotal;
			descuento += modelo.descuento;
			iva += modelo.importeIVA;
			ieps += modelo.importeIEPS;
			total += modelo.total;
		});

		const valores = {
			subtotal: this.redondear(subtotal),
			descuento: this.redondear(descuento),
			iva: this.redondear(iva),
			ieps: this.redondear(ieps),
			total: this.redondear(total)
		};

		return valores;
	}

	private redondear(cantidad: number = 0, decimales: number = 6): number {
		return Number(Math.round(parseFloat(cantidad + 'e' + decimales)) + 'e-' + decimales);
	}
}