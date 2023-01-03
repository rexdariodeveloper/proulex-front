import { Component, Inject, ViewChild } from '@angular/core';
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
	test: any;
	testFormat: any;
	titulo: any;
	modalidades: any;
	unidades: any;
	programaIdiomaExamenId: number;
	cursoId: number;
	vista: string;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'add-examen',
	templateUrl: 'add-examen.dialog.html',
	animations: fuseAnimations
})
export class AddExamenComponent {

	test: any;
	titulo: string;
	testFormat: any;
	modalidades: any;
	programaIdiomaExamenId: number;
	unidades: any;
	vista: string;
	modalidadControl: FormControl = new FormControl(null,[Validators.required]);
	testControl: FormControl = new FormControl(null,[Validators.required]);
	testFormatControl: FormControl = new FormControl();
	examenModalidadForm: FormArray;
	examenUnidadForm: FormArray;
	cursoId: number;
	examenForm: FormGroup;
	score: number;
	time: number;
	continuos: boolean;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < AddExamenComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AddExamenData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
		if(this.vista == 'nuevo'){
			this.modalidadControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
	            this.examenModalidadForm = new FormArray([]);
	            this.modalidadControl.value.forEach(modalidad =>{
	            	this.examenModalidadForm.push(this.createModalidadExamenForm(modalidad.modalidad));
	            });
	           console.log(this.examenModalidadForm); 
	        });
	        let modalidadesSelect = [];
	        this.examenModalidadForm = new FormArray([]);
			this.modalidades.forEach(modalidad =>{
				modalidadesSelect.push(modalidad);
				this.examenModalidadForm.push(this.createModalidadExamenForm(modalidad.modalidad));
			});

			this.modalidadControl = new FormControl(modalidadesSelect, [Validators.required]);
			this.examenUnidadForm = new FormArray([]);
			this.unidades.forEach(unidad =>{
				this.examenUnidadForm.push(this.createUnidadExamenForm(unidad,unidad.nivel));
			});
			
			this.modalidadControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
				this.examenModalidadForm = new FormArray([]);
				this.modalidadControl.value.forEach(modalidad =>{
					this.examenModalidadForm.push(this.createModalidadExamenForm(modalidad.modalidad));
				});
			});
		}
		

		
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AddExamenData) {
		this.test = data.test;
		this.testFormat = data.testFormat;
		this.modalidades = data.modalidades;
		this.programaIdiomaExamenId = data.programaIdiomaExamenId;
		this.unidades = data.unidades;
		this.vista = data.vista;
		this.cursoId = data.cursoId;
		this.titulo = data.titulo;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.vista == 'nuevo'){
			let form: FormGroup = this._formBuilder.group({
	            id: [null],
	            programaIdiomaId: new FormControl(this.cursoId),
	            actividadEvaluacion: this.testControl,
	            titulo: new FormControl(this.titulo),
	            test: this.testFormatControl,
	            score: new FormControl(this.score, [Validators.required]),
	            time: new FormControl(this.time, [Validators.required]),
	            continuos: new FormControl(this.continuos),
	            modalidades: this.examenModalidadForm,
	            unidades: this.examenUnidadForm
	        });
	        if(form.valid){
	        	this.examenForm = form;
	        }else{
	        	this._matSnackBar.open(this.translate.instant('Datos faltantes'), 'OK', {
	                duration: 5000,
	            });
	        }
	        
		}
		
		//this.data.onAceptar(true);
		this.dialogRef.close(this.examenForm);
	}

	createModalidadExamenForm(paModalidad: any){
		let form: FormGroup = this._formBuilder.group({
			id: [null],
			programaIdiomaExamenId: new FormControl(this.programaIdiomaExamenId),
			modalidad: new FormControl(paModalidad, [Validators.required]),
			dias: new FormControl(null, [Validators.required])
		})
		return form;
	}

	createUnidadExamenForm(librosMateriales: any, nivel: any){
		let form: FormGroup = this._formBuilder.group({
			id: [null],
			programaIdiomaExamenId: new FormControl(this.programaIdiomaExamenId),
			libroMaterial: new FormControl(librosMateriales, []),
			descripcion: new FormControl(null, [Validators.required]),
			nivel: new FormControl(nivel, []),
			articulo: new FormControl(librosMateriales.articulo)
		})
		return form;
	}

}