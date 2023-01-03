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
import { ProgramaIdiomaExamenEditarProjection } from '@app/main/modelos/programa-idioma-examen';

const MAX_28: number = 9999999999999999999999999999.99;

@Component({
	selector: 'add-quizz',
	templateUrl: 'add-quizz.dialog.html',
	animations: fuseAnimations
})
export class GrupoTareaDialogComponent {

	grupo: ProgramaIdiomaExamenEditarProjection = new ProgramaIdiomaExamenEditarProjection();
	totalPonderado: number = 0.00;
	form: FormGroup = null;
	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef <GrupoTareaDialogComponent> ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
		private el: ElementRef,
	) {
		this._unsubscribeAll = new Subject();
		this.grupo = data?.grupo;
		this.totalPonderado = data?.totalPonderado;
		this.form = this.createForm();
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	createForm(): FormGroup{
		let form = this._formBuilder.group({
			id: new FormControl(this.grupo?.id, []),
			programaIdiomaNivelId: new FormControl(this.grupo?.programaIdiomaNivelId, []),
			nombre: new FormControl(this.grupo?.nombre, [Validators.required]),
			porcentaje: new FormControl(this.grupo?.porcentaje, [Validators.required]),
			activo: new FormControl(true, []),
			orden: new FormControl(this.grupo?.orden, []),
			detalles: new FormControl(this.grupo?.detalles, []),
		});

		return form;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		let ponderacion: number = Number(this.form.get('porcentaje').value);
		if(this.totalPonderado + ponderacion > 100){
			this._matSnackBar.open(this.translate.instant('El porcentaje total no puede ser mayor a 100'), 'OK', {
				duration: 5000,
			});
		} else
			this.dialogRef.close(this.form.getRawValue());
	}
}