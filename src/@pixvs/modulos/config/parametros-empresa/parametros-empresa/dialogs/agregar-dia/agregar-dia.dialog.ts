import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntil, take } from 'rxjs/operators';



const MAX_28: number = 9999999999999999999999999999.99;

export interface AgregarDiaData {
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'agregar-dia',
	templateUrl: 'agregar-dia.dialog.html',
	animations: fuseAnimations
})
export class AgregarDiaComponent {

	nombreProveedor: string;
	codigoProveedor: string;

	private _unsubscribeAll: Subject < any > ;

	tipoDia = [
		{
			id: 0,
			label: 'Dia no laboral por año'
		},
		{
			id: 1,
			label: 'Dia no laboral fijo'
		},
		{
			id: 2,
			label: 'Periodo vacacional'
		}
	]

	form: FormGroup = null;
	tipoDiaControl: FormControl = new FormControl();

	mostrarFechaFin: boolean = false;


	constructor(
		public dialogRef: MatDialogRef < AgregarDiaComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AgregarDiaData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar
	) {
		this._unsubscribeAll = new Subject();
		//this.setData(data);
		this.form = this.createForm();

		this.form.get('tipoDia').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.form.get('tipoDia').value.id == 2){
				this.mostrarFechaFin = true;
			}else{
				this.mostrarFechaFin = false;
			}
		})
	}

	ngOnInit(): void {

	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	createForm(): FormGroup {
		this.tipoDiaControl = new FormControl(null, [Validators.required]);

        let form = this._formBuilder.group({
            tipoDia: this.tipoDiaControl,
            fecha: new FormControl(null,[Validators.required]),
            fechaFin: new FormControl(null),
            descripcion: new FormControl(null,[Validators.required])
        });

        return form;
    }

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.form.valid){
			this.data.onAceptar(this.form.getRawValue());
			this.dialogRef.close();
		}
		
	}

	isRequired(campo: string, form: FormGroup) {

        let form_field = form.get(campo);
        if (!form_field.validator) {
            return false;
        }

        let validator = form_field.validator({} as AbstractControl);
        return !!(validator && validator.required);

    }

}