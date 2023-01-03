import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { ValidatorService } from '@services/validators.service';
import { OrdenCompraDetalleRelacionarProjection } from '@app/main/modelos/orden-compra-detalle';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { takeUntil, take } from 'rxjs/operators';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

const MAX_28: number = 9999999999999999999999999999.99;

export interface VerificarRfcData {
	articulos: any[];
	//codigoProveedor: string;
	//onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'verificar-rfc',
	templateUrl: 'verificar-rfc.dialog.html',
	animations: fuseAnimations
})
export class VerificarRfcComponent {

	articulos: any[];
	articuloControl: FormControl = new FormControl();
	articulo:any;

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
		this.articuloControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			let articuloGuardar = Object.assign({}, this.articuloControl.value);
            this.articulo = articuloGuardar;
            this.articulo['precioVenta']=0;
            this.articulo['importeIva']=0;
            this.articulo['importeIeps']=0;
            this.articulo['precioUnitario']=0;
        });
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: VerificarRfcData) {
		this.articulos = data.articulos;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		let arti = this.articulo;
		let form = this._formBuilder.group({
			id:[null],
			listadoPrecioId: new FormControl(null),
			padreId: new FormControl(null),
			precioVenta: new FormControl(this.articulo.precioVenta),
			articulo: new FormControl(arti)
		})
		this.dialogRef.close(form.value);
	}

	redondeo2Decimales(num: number){
        return Number((Math.round(num * 100) / 100).toFixed(2));
    }

    actualizarDatos(){
        this.articulo.precioUnitario=this.articulo.precioVenta/(1+this.articulo.iva+this.articulo.ieps);
        this.articulo.importeIva=(this.articulo.precioVenta/(1+this.articulo.iva+this.articulo.ieps))*this.articulo.iva;
        this.articulo.importeIeps=(this.articulo.precioVenta/(1+this.articulo.iva+this.articulo.ieps))*this.articulo.ieps;
    }

}