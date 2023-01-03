import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { FacturacionNotaVentaProjection, OrdenVentaHistorialPVResumenProjection } from '@app/main/modelos/orden-venta';
import { OrdenVentaDetalleHistorialPVResumenProjection } from '@app/main/modelos/orden-venta-detalle';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FacturaNotaVentaService } from '../factura-nota-venta.service';

export interface NotaVentaDialogData {
	camposListado: FieldConfig[];
	onAceptar: (registro: any) => void;
	listadoSedes: any[];
}

@Component({
	selector: 'nota-venta-dialog',
	templateUrl: './nota-venta.dialog.html',
	styleUrls: ['./nota-venta.dialog.scss'],
	animations: fuseAnimations,
})
export class NotaVentaDialogComponent {

	@ViewChild('camposDinamicos') camposDinamicos: PixvsDynamicComponent;

	camposListado: FieldConfig[];
	_unsubscribeAll: Subject<any>;
	listadoSedes: any[];
	form: FormGroup;

	notaVenta: FacturacionNotaVentaProjection;
	ordenVenta: OrdenVentaHistorialPVResumenProjection = null;

	dataSourceResumenOVD: MatTableDataSource<OrdenVentaDetalleHistorialPVResumenProjection> = new MatTableDataSource([]);
	displayedColumnsResumenOVD: string[] = ['nombre', 'cantidad', 'precio', 'descuento', 'total'];

	constructor(
		public dialogRef: MatDialogRef<NotaVentaDialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
		public _facturaService: FacturaNotaVentaService,
		@Inject(MAT_DIALOG_DATA) public data: NotaVentaDialogData
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		// Set the private defaults
		this._unsubscribeAll = new Subject();

		this.setData(data);
	}

	setData(data: NotaVentaDialogData) {
		this.camposListado = data.camposListado;
		this.listadoSedes = data.listadoSedes;

		setTimeout(() => {
			this.form = this.camposDinamicos.form.form;

			for (let campoRegistro in this.form.controls) {
				this.form.controls[campoRegistro].setValue(null);
				this.form.controls[campoRegistro].markAsUntouched();
				this.form.controls[campoRegistro].updateValueAndValidity();
			}

			this._facturaService.onNotaVentaChanged
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe(datos => {
					if (datos) {
						this._facturaService.onNotaVentaChanged.next(null);
						this.notaVenta = datos.notaVenta;
						this.ordenVenta = datos.ordenVenta;
						this.dataSourceResumenOVD.data = datos.detalles;
					}
				});

			this.form.controls.sede.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
				let sedeId: number = this.form.controls.sede.value ? this.form.controls.sede.value.id : null;

				this.form.controls.notaVenta.setValue(null);
			});
		});
	}

	cancelar(): void {
		this.data.onAceptar(null);
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			if (this.notaVenta) {
				this.data.onAceptar(this.notaVenta);
				this.dialogRef.close();
			} else {
				this._matSnackBar.open('Favor de buscar una Nota de Venta.', 'OK', { duration: 5000, });
			}
		} else {
			this.camposDinamicos.form.validateAllFormFields(this.form);
		}
	}

	buscarNotaVenta(): void {
		this.notaVenta = null;

		if (this.form.valid) {
			this._facturaService.getDatosNotaVenta(this.form.controls.sede.value.id, this.form.controls.notaVenta.value);
		} else {
			this.ordenVenta = null;
			this.dataSourceResumenOVD.data = [];
		}
	}
}