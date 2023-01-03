import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { EmpleadoComboProjection } from '@app/main/modelos/empleado';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { takeUntil, take } from 'rxjs/operators';
import { GruposService } from '../../../grupos/grupos.service';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';

const MAX_28: number = 9999999999999999999999999999.99;

export interface ListadoClases {
    numeroClase: number;
    fechaClase: string;
    profesor: string;
    estatus: string;
    historial: any[];    
}

export interface AddExamenData {
	clases: ListadoClases[];
	nombreProfesor: string;
	profesores: EmpleadoComboProjection[];
	fechaSelected: number;
	formasPago: any[];
	profesorSustituto: any;
	idCurso: number;
	idGrupo: number;
	idIdioma: number;
	idHorario: number;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'add-examen',
	templateUrl: 'add-examen.dialog.html',
	animations: fuseAnimations
})
export class AddExamenComponent {
	@ViewChild('claseSelect') claseSelect: PixvsMatSelectComponent;

	tipos = [
		{
			id: 0,
			nombre:'Clase'
		},
		{
			id: 1,
			nombre:'Periodo'
		}
	];

	motivo: string;
	clases: ListadoClases[];
	nombreProfesor: string;
	profesores: EmpleadoComboProjection[];
	fechaSelected: number;
	formasPago: any[];
	profesorSustituto: any;
	categoriaProfesor: string;
	sueldo: number;
	idCurso: number;
	idIdioma: number;
	idHorario: number;
	idGrupo: number;

	listadoProfesorSustituto: FormArray;

	tipoControl: FormControl = new FormControl({id: 0,nombre:'Clase'},[Validators.required]);
	claseControl: FormControl = new FormControl(null,[Validators.required]);
	claseInicioControl: FormControl = new FormControl(null,[Validators.required]);
	claseFinControl: FormControl = new FormControl(null,[Validators.required]);
	profesorControl: FormControl = new FormControl(null,[Validators.required]);
	formaPagoControl: FormControl = new FormControl(null,[Validators.required]);
	clasesInicio = [];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < AddExamenComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AddExamenData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
		public _grupoService: GruposService,
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
		this.clasesInicio = [this.clases[this.fechaSelected]];
		console.log(data);
	}

	ngOnInit(): void {
		this.tipoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
		this.claseControl = new FormControl(this.clases[this.fechaSelected]);
		this.claseInicioControl = new FormControl(this.clases[this.fechaSelected]);
			//this.claseSelect.setDatos(this.clases);
		});
		this.profesorControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.profesorControl.value){
                this._grupoService.getDatosSueldo(this.idCurso,this.profesorControl.value.id,this.idGrupo).then(value =>{
                    if(value.data){
	                    this.categoriaProfesor = value.data.categoria;
	                    this.sueldo = value.data.sueldo;
                    }else{
                    	this.categoriaProfesor = null;
                    	this.sueldo = null;
                    	this._matSnackBar.open(this.translate.instant('El curso o el profesor no tienen tabulador'), 'OK', {
                            duration: 5000,
                        });
                    }
                });
            }
		});
		if(this.profesorSustituto){
			this.profesorControl.setValue(this.profesorSustituto.empleado);
			this.formaPagoControl.setValue(this.profesorSustituto.formaPago);
			this.motivo = this.profesorSustituto.comentario;
			this.categoriaProfesor = this.profesorSustituto.categoriaProfesor;
			this.sueldo = this.profesorSustituto.sueldoProfesor;
		}
	}

	ngAfterViewInit(){
		
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AddExamenData) {
		this.clases = data.clases;
		this.nombreProfesor = data.nombreProfesor;
		this.profesores = data.profesores;
		this.fechaSelected = data.fechaSelected;
		this.formasPago = data.formasPago;
		this.profesorSustituto = data.profesorSustituto;
		this.idCurso = data.idCurso;
		this.idIdioma = data.idIdioma;
		this.idHorario = data.idHorario;
		this.idGrupo = data.idGrupo;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		this.listadoProfesorSustituto = new FormArray([]);
		if(this.motivo == null){
			setTimeout(function() { document.getElementById("motivo").focus() });
    	}
    	else if(!this.categoriaProfesor || !this.sueldo){
    		this._matSnackBar.open(this.translate.instant('El sueldo y la categoria son obligatorios'), 'OK', {
                duration: 5000,
            });
    	}
    	else if(this.formaPagoControl.value == null){
    		this.formaPagoControl.markAsTouched();
    		return;
    	}
    	else if(this.tipoControl.value == null){
    		this.tipoControl.markAsTouched();
    		return;
    	}else if(this.claseControl.value == null && this.tipoControl.value.id == 0){
    		this.claseControl.markAsTouched();
    		return;
    	}else if(this.claseInicioControl.value == null && this.tipoControl.value.id == 1){
    		this.claseInicioControl.markAsTouched();
    		return;
    	}else if(this.claseFinControl.value == null && this.tipoControl.value.id == 1){
    		this.claseFinControl.markAsTouched();
    		return;
    	}else if(this.profesorControl.value == null){
    		this.profesorControl.markAsTouched();
    		return;
    	}else if(this.profesorControl.value.nombreCompleto.replace(this.profesorControl.value.nombreCompleto.substr(0, this.profesorControl.value.nombreCompleto.indexOf('-')),'').replace('-','') == this.nombreProfesor){
    		this._matSnackBar.open(this.translate.instant('El profesor sustituto no puede ser el profesor titular'), 'OK', {
                duration: 5000,
            });
    	}else if(this.tipoControl.value.id == 1 && moment(this.claseInicioControl.value.fechaClase.match(/(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g)[0]).isAfter(moment(this.claseFinControl.value.fechaClase.match(/(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g)[0]))){
    		this._matSnackBar.open(this.translate.instant('La fecha de inicio no puede ser mayor a la fecha de fin'), 'OK', {
                duration: 5000,
            });
    	}
    	else{
    		if(this.tipoControl.value.id == 0){
    			let form: FormGroup = this._formBuilder.group({
    				id: [null],
    				grupoId: new FormControl(null),
    				fecha: new FormControl(this.claseControl.value.fechaClase.match(/(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g)[0]),
    				empleado: new FormControl(this.profesorControl.value),
    				comentario: new FormControl(this.motivo),
	    			formaPago: new FormControl(this.formaPagoControl.value),
	    			categoriaProfesor: new FormControl(this.categoriaProfesor),
	    			sueldoProfesor: new FormControl(this.sueldo)
    			});
    			this.listadoProfesorSustituto.push(form);
    		}
    		else{
    			let indexInicio = this.clases.findIndex(clase =>{
    				return clase.numeroClase == this.claseInicioControl.value.numeroClase
    			});
    			let indexFin = this.clases.findIndex(clase =>{
    				return clase.numeroClase == this.claseFinControl.value.numeroClase
    			});
    			const clasesPeriodo = this.clases.slice(indexInicio,indexFin+1);
    			for(var i=0;i<clasesPeriodo.length;i++){
    				let form: FormGroup = this._formBuilder.group({
	    				id: [null],
	    				grupoId: new FormControl(null),
	    				fecha: new FormControl(clasesPeriodo[i].fechaClase.match(/(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g)[0]),
	    				empleado: new FormControl(this.profesorControl.value),
	    				formaPago: new FormControl(this.formaPagoControl.value),
	    				categoriaProfesor: new FormControl(this.categoriaProfesor),
	    				sueldoProfesor: new FormControl(this.sueldo)
	    			});
	    			this.listadoProfesorSustituto.push(form);
    			}
    		}
    		this.dialogRef.close(this.listadoProfesorSustituto);
    	}
		
		
	}

}