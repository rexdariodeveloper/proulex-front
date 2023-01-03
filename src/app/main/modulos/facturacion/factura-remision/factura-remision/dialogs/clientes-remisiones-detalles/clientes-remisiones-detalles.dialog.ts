import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { ClienteRemisionDetalleFacturarProjection } from '@app/main/modelos/cliente-remision-detalle';

const MAX_28: number = 9999999999999999999999999999.99;

export interface ClientesRemisionesDetallesDialogData {
	codigoRemision: string;
	detalles: ClienteRemisionDetalleFacturarProjection[];
	onClosed: () => void;
}

@Component({
	selector: 'clientes-remisiones-detalles-dialog',
	templateUrl: 'clientes-remisiones-detalles.dialog.html',
	animations: fuseAnimations
})
export class ClientesRemisionesDetallesDialogComponent {

	codigoRemision: string;
	detalles: ClienteRemisionDetalleFacturarProjection[];

	cantidadControls: {[detalleId: number]: FormControl} = {};

	dataSourceDetalles: MatTableDataSource<ClienteRemisionDetalleFacturarProjection> = new MatTableDataSource([]);
	displayedColumnsDetalles: string[] = [
		'articulo',
		'um',
		'cantidadRemision',
		'precioUnitarioRemision',
		'cantidadRelacionar',
		'cantidadRestante'
	];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ClientesRemisionesDetallesDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ClientesRemisionesDetallesDialogData,
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

	setData(data: ClientesRemisionesDetallesDialogData) {
		this.codigoRemision = data.codigoRemision;
		this.detalles = data.detalles;
		this.dataSourceDetalles.data = [...this.detalles];

		this.detalles.forEach(detalle => {
			let cantidadControl: FormControl = new FormControl(detalle.cantidadRelacionar || 0, [Validators.min(0),Validators.max((detalle.cantidad || 0))]);
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