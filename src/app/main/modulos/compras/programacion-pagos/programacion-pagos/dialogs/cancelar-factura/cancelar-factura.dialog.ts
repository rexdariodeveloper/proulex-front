import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl } from '@angular/forms';
import { OrdenCompraDetalleRelacionarProjection } from '@app/main/modelos/orden-compra-detalle';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

const MAX_28: number = 9999999999999999999999999999.99;

export interface CancelarFacturaDialogData {
	nombreProvedor: string;
	folioFactura: string;
	monto: number;
	codigoMoneda: string;
	onAceptar: (fechaCancelacion: Moment, motivoCancelacion: string) => void;
}

@Component({
	selector: 'cancelar-factura-dialog',
	templateUrl: 'cancelar-factura.dialog.html',
	animations: fuseAnimations
})
export class CancelarFacturaDialogComponent {

	folioFactura: string;
	nombreProvedor: string;
	monto: number;
	codigoMoneda: string;

	fechaCancelacionControl: FormControl = new FormControl(null,[]);
	motivoCancelacion: FormControl = new FormControl(null,[]);

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < CancelarFacturaDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: CancelarFacturaDialogData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: CancelarFacturaDialogData) {
		this.folioFactura = data.folioFactura;
		this.nombreProvedor = data.nombreProvedor;
		this.monto = data.monto;
		this.codigoMoneda = data.codigoMoneda;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(!this.fechaCancelacionControl.value){
			this._matSnackBar.open('Ingresa una fecha de cancelación', 'OK', {
				duration: 5000,
			});
			return;
		}
		if(!this.motivoCancelacion.value){
			this._matSnackBar.open('Ingresa un motivo de cancelación', 'OK', {
				duration: 5000,
			});
			return;
		}
		this.data.onAceptar(this.fechaCancelacionControl.value, this.motivoCancelacion.value);
		this.dialogRef.close();
	}

}