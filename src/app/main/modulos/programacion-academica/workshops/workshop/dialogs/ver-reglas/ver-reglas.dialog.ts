import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { OrdenCompraDetalleRelacionarProjection } from '@app/main/modelos/orden-compra-detalle';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

const MAX_28: number = 9999999999999999999999999999.99;

export interface VerreglasData {
	datos: any;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'ver-reglas',
	templateUrl: 'ver-reglas.dialog.html',
	animations: fuseAnimations
})
export class VerreglasComponent {
	@ViewChild(MatPaginator) paginator: MatPaginator;
	datos: any;
	datosTabla = [];
	dataSource: MatTableDataSource<any>;
	displayedColumns: string[] = ['libro', 'centro', 'carrera'];
	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < VerreglasComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: VerreglasData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
		for(var i=0;i<this.datos.articulo.length;i++){
            if(this.datos.articulo[i].reglas && this.datos.articulo[i].reglas.length >0 ){
            	this.datos.articulo[i].reglas.forEach(regla =>{
            		let json = {
            			articulo: this.datos.articulo[i].articulo.nombreArticulo,
            			centro: regla.carrera.cmmReferencia.referencia,
            			carrera: regla.carrera.valor
            		}
            		this.datosTabla.push(json);
            	});
                
            }
        }
        this.dataSource = new MatTableDataSource(this.datosTabla);
    	this.dataSource.paginator = this.paginator;
        setTimeout(() => this.dataSource.paginator = this.paginator);
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: VerreglasData) {
		this.datos = data.datos;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		this.dialogRef.close();
	}

}