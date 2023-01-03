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

export interface VerificarRfcData {
	nombreProveedor: string;
	codigoProveedor: string;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'verificar-rfc',
	templateUrl: 'verificar-rfc.dialog.html',
	animations: fuseAnimations
})
export class VerificarRfcComponent {

	nombreProveedor: string;
	codigoProveedor: string;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < VerificarRfcComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: VerificarRfcData,
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

	setData(data: VerificarRfcData) {
		this.codigoProveedor = data.codigoProveedor;
		this.nombreProveedor = data.nombreProveedor;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		this.data.onAceptar(true);
		this.dialogRef.close();
	}

}