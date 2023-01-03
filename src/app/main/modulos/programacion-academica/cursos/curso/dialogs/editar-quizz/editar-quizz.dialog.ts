import { Component,ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { OrdenCompraDetalleRelacionarProjection } from '@app/main/modelos/orden-compra-detalle';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { takeUntil, take } from 'rxjs/operators';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

const MAX_28: number = 9999999999999999999999999999.99;

export interface EditarQuizzData {
	nombre: string;
	porcentaje: number;
	porcentajeTotal: number;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'editar-quizz',
	templateUrl: 'editar-quizz.dialog.html',
	animations: fuseAnimations
})
export class EditarQuizzComponent {

	private _unsubscribeAll: Subject < any > ;
	nombre: string;
	porcentaje: number;
	porcentajeTotal: number;

	constructor(
		public dialogRef: MatDialogRef < EditarQuizzComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: EditarQuizzData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
		private el: ElementRef,
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
	}

	ngAfterViewInit(){

	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: EditarQuizzData) {
		this.porcentajeTotal = data.porcentajeTotal;
		this.nombre = data.nombre;
		this.porcentaje = data.porcentaje;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if( (this.porcentaje + this.porcentajeTotal <= 100) ){
			let json ={
				nombre: this.nombre,
				porcentaje: this.porcentaje
			}
			this.dialogRef.close(json);
		}else{
			this._matSnackBar.open(this.translate.instant('El porcentaje total no puede ser mayor a ' + (100 - this.porcentajeTotal)), 'OK', {
                duration: 5000,
            });
		}
		
	}

}