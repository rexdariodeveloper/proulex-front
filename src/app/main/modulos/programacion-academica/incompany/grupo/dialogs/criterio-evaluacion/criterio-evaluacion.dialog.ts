import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
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
import * as moment from 'moment';
import { ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection } from '@app/main/modelos/programa-grupo-incompany-criterio-evaluacion';

const MAX_28: number = 9999999999999999999999999999.99;

export interface CriterioEvaluacionData {
	esNuevo: boolean;
	criterio: ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection;
	testFormats: any;
	listaActividadEvaluacion: any;
	modalidad: any;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'criterio-evaluacion',
	templateUrl: 'criterio-evaluacion.dialog.html',
	animations: fuseAnimations
})
export class CriterioEvaluacionComponent {

	esNuevo: boolean = true;
	criterio: ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection;
	testFormats: any[];
	listaActividadEvaluacion: any;
	modalidad: any;
	criterioForm: FormGroup;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < CriterioEvaluacionComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: CriterioEvaluacionData,
		public _validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
		private _el: ElementRef
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

	setData(data: CriterioEvaluacionData) {
		this.esNuevo = data.esNuevo;
		this.criterio = data.criterio;
		this.testFormats = data.testFormats;
		this.listaActividadEvaluacion = data.listaActividadEvaluacion;
		this.modalidad = data.modalidad;
        this.criterioForm = this.createCriterioFormGroup(this.criterio);
	}

	createCriterioFormGroup(criterio: ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection): FormGroup{
		criterio = criterio ? criterio : new ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection();

		if(criterio.id == null){
			criterio.modalidad = this.modalidad;
		}

		let form: FormGroup = this._formBuilder.group({
            id:[criterio.id],
            incompanyGrupoId: new FormControl(criterio.grupoId),
            actividadEvaluacion: new FormControl(criterio.actividadEvaluacion, [Validators.required]),
            modalidad: new FormControl(criterio.modalidad),
            score: new FormControl(criterio.score, [Validators.required]),
            time: new FormControl(criterio.time, [Validators.required]),
			testFormat: new FormControl(criterio.testFormat, [Validators.required]),
            fechaAplica: new FormControl(criterio.fechaAplica ? moment(criterio.fechaAplica).format('YYYY-MM-DD') : null),
            activo: new FormControl(criterio.activo != null ? criterio.activo: true),
            dias: new FormControl(criterio.dias)
        });

		return form;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.criterioForm.valid)
			this.dialogRef.close(this.criterioForm);
		else{
			let campoKey = '';
			for (const key of Object.keys(this.criterioForm.controls)) {
				if(this.criterioForm.controls[key].invalid){
					this.criterioForm.controls[key].markAsTouched();
					if(campoKey == '')
					  	campoKey = key;
				}
			}

			const invalidControl = this._el.nativeElement.querySelector('[formcontrolname="' + campoKey + '"]');
			if (invalidControl) {
				invalidControl.focus();
			}

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});
		}
	}

}