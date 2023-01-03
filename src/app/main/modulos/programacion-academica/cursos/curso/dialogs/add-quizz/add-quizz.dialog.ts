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

export interface AddExamenData {
	idCurso: number;
	porcentajeTotal: number;
	orden: number;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'add-quizz',
	templateUrl: 'add-quizz.dialog.html',
	animations: fuseAnimations
})
export class AddQuizzComponent {

	private _unsubscribeAll: Subject < any > ;
	nombre: string;
	porcentaje: number;
	idCurso: number;
	porcentajeTotal: number;
	orden: number;

	constructor(
		public dialogRef: MatDialogRef < AddQuizzComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AddExamenData,
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

	setData(data: AddExamenData) {
		this.idCurso = data.idCurso;
		this.porcentajeTotal = data.porcentajeTotal;
		this.orden = data.orden;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if((this.porcentajeTotal + this.porcentaje) > 100){
			this._matSnackBar.open(this.translate.instant('El porcentaje total no puede ser mayor a ' + (100 - this.porcentajeTotal)), 'OK', {
                duration: 5000,
            });
		}else{
			let form: FormGroup = this._formBuilder.group({
				id: [null],
				programaIdiomaNivelId: new FormControl(this.idCurso),
				nombre: new FormControl(this.nombre),
				porcentaje: new FormControl(this.porcentaje),
				activo: new FormControl(true),
				orden: new FormControl(this.orden),
				expand: new FormControl(true),
				detalles: new FormArray([])
			});
			//this.data.onAceptar(true);
			this.dialogRef.close(form);
		}
	}

	markFormGroupTouched(formGroup: FormGroup) {
	    (<any>Object).values(formGroup.controls).forEach(control => {
	      control.markAsTouched();

	      if (control.controls) {
	        this.markFormGroupTouched(control);
	      }
	    });
	}

}