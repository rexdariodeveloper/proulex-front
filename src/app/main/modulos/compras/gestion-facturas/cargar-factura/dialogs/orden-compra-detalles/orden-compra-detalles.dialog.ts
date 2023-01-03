import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { OrdenCompraDetalleRelacionarProjection } from '@app/main/modelos/orden-compra-detalle';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';

const MAX_28: number = 9999999999999999999999999999.99;

export interface OrdenCompraDetallesDialogData {
	codigoOC: string;
	detalles: OrdenCompraDetalleRelacionarProjection[];
	onClosed: () => void;
}

@Component({
	selector: 'orden-compra-detalles-dialog',
	templateUrl: 'orden-compra-detalles.dialog.html',
	animations: fuseAnimations
})
export class OrdenCompraDetallesDialogComponent {

	codigoOC: string;
	detalles: OrdenCompraDetalleRelacionarProjection[];

	cantidadControls: {[detalleId: number]: FormControl} = {};

	dataSourceDetalles: MatTableDataSource<OrdenCompraDetalleRelacionarProjection> = new MatTableDataSource([]);
	displayedColumnsDetalles: string[] = [
		'articulo',
		'um',
		'cantidadOC',
		'precioUnitarioOC',
		'cantidadRelacionar',
		'cantidadRestante'
	];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < OrdenCompraDetallesDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: OrdenCompraDetallesDialogData,
		public validatorService: ValidatorService
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

	setData(data: OrdenCompraDetallesDialogData) {
		this.codigoOC = data.codigoOC;
		this.detalles = data.detalles;
		this.dataSourceDetalles.data = [...this.detalles];

		this.detalles.forEach(detalle => {
			let cantidadControl: FormControl = new FormControl(detalle.cantidadRelacionar || 0, [Validators.min(0),Validators.max((detalle.cantidadRecibida || 0) - (detalle.cantidadRelacionada || 0))]);
			this.cantidadControls[detalle.id] = cantidadControl;
		});
	}

	cancelar(): void {
		this.data.onClosed();
		this.dialogRef.close();
	}

	aceptar(): void {
		for(let detalle of this.detalles){
			if(this.cantidadControls[detalle.id].invalid){
				return;
			}
		}
		this.detalles.forEach(detalle => {
			detalle.cantidadRelacionar = this.cantidadControls[detalle.id].value || 0;
		});
		this.data.onClosed();
		this.dialogRef.close();
	}

}