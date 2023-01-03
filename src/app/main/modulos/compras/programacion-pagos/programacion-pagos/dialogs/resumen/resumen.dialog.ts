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
import { ProveedorProgramacionPagoProjection } from '@app/main/modelos/proveedor';
import { CXPFacturaProgramacionPagoProjection } from '@app/main/modelos/cxpfactura';

const MAX_28: number = 9999999999999999999999999999.99;

export interface ResumenDialogData {
	proveedores: ProveedorProgramacionPagoProjection[];
	facturasSeleccionadas: {[facturaId:number]: CXPFacturaProgramacionPagoProjection};
	montosPagarControlMap: {[facturaId: number]: FormControl};
}

@Component({
	selector: 'resumen-dialog',
	templateUrl: 'resumen.dialog.html',
	animations: fuseAnimations
})
export class ResumenDialogComponent {

	proveedores: ProveedorProgramacionPagoProjection[] = [];
	facturasSeleccionadas: {[facturaId:number]: CXPFacturaProgramacionPagoProjection} = {};
	montosPagarControlMap: {[facturaId: number]: FormControl} = {};

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ResumenDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ResumenDialogData,
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

	setData(data: ResumenDialogData) {
		this.proveedores = data.proveedores;
		this.facturasSeleccionadas = data.facturasSeleccionadas;
		this.montosPagarControlMap = data.montosPagarControlMap;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

}