import { Component,ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { ProgramaIdiomaExamenDetalle, ProgramaIdiomaExamenDetalleEditarProjection } from '@app/main/modelos/programa-idioma-examen-detalle';
import { ProgramaIdiomaExamenModalidad, ProgramaIdiomaExamenModalidadEditarProjection } from '@app/main/modelos/programa-idioma-examen-modalidad';
import { ProgramaIdiomaExamenUnidad, ProgramaIdiomaExamenUnidadEditarProjection } from '@app/main/modelos/programa-idioma-examen-unidad';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { PAActividadEvaluacionComboProjection } from '@app/main/modelos/paactividad';
import { ProgramaIdiomaModalidadEditarProjection } from '@app/main/modelos/programa-idioma-modalidad';
import { ProgramaIdiomaLibroMaterialEditarProjection } from '@app/main/modelos/programa-idioma-libro-material';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { takeUntil, take } from 'rxjs/operators';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

const MAX_28: number = 9999999999999999999999999999.99;

export interface AddTareaData {
	detalle: ProgramaIdiomaExamenDetalle;
	idCurso: number;
	titulo: string;
	test: PAActividadEvaluacionComboProjection[];
	testFormat: ControlMaestroMultipleComboProjection[];
	modalidades: PAModalidadComboProjection[];
	unidades: ProgramaIdiomaLibroMaterialEditarProjection[];
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'add-tarea',
	templateUrl: 'add-tarea.dialog.html',
	animations: fuseAnimations
})
export class AddTareaComponent {

	private _unsubscribeAll: Subject < any > ;
	detalle: ProgramaIdiomaExamenDetalle;
	form: FormGroup;
	modalidadesArray: FormArray;
	unidadesArray: FormArray;
	idCurso: number;
	titulo: string;
	test: PAActividadEvaluacionComboProjection[];
	testFormat: ControlMaestroMultipleComboProjection[];
	modalidades: PAModalidadComboProjection[];
	unidades: ProgramaIdiomaLibroMaterialEditarProjection[];

	actividadEvaluacionControl: FormControl;
	testControl: FormControl;
	modalidadControl: FormControl;

	pasosStepper: string[] = [
		'Test',
		'Días aplica',
		'Unidades'
	];

	@ViewChild('contenedorFicha') contenedorFicha;

	pasoSeleccionado: number = 0;

	temp: any;
	constructor(
		public dialogRef: MatDialogRef < AddTareaComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AddTareaData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
		private el: ElementRef,
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
		console.log(data);
		this.form = this.createForm();
		this.form.get('continuos').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.form.get('continuos').value){
				this.form.get('time').setValue(0);
			}
		});
	}

	ngOnInit(): void {
		this.modalidadControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.modalidadControl.value){
	            this.modalidadesArray = new FormArray([]);
	            try{
		            this.modalidadControl.value.forEach(modalidad =>{
		            	this.modalidadesArray.push(this.createModalidadesNuevoForm(modalidad,this.idCurso));
		            });
	        	}catch(e){}
	            this.temp = this.modalidadesArray; 
            }
        });
	}

	ngAfterViewInit(){

	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AddTareaData) {
		this.detalle = data.detalle;
		this.idCurso = data.idCurso;
		this.titulo = data.titulo;
		this.test = data.test;
		this.testFormat = data.testFormat;
		this.modalidades = data.modalidades;
		this.unidades = data.unidades;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.form.valid){
			this.form.removeControl('modalidades');
			this.form.addControl('modalidades',this.modalidadesArray);
			this.dialogRef.close(this.form);
		}else{
			this.markFormGroupTouched(this.form);
			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
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

	createForm(){
		this.modalidadesArray = new FormArray([]);
		this.unidadesArray = new FormArray([]);
		this.actividadEvaluacionControl = new FormControl(this.detalle.actividadEvaluacion, [Validators.required])
		this.testControl = new FormControl(this.detalle.test, [Validators.required]);
		this.modalidadControl = new FormControl(null);
		if(this.detalle.modalidades){
			let modalidadesSelected = [];
			try{
				this.detalle.modalidades.forEach(modalidad =>{
					this.modalidadesArray.push(this.createModalidadesForm(modalidad,this.detalle.id));
					modalidadesSelected.push(modalidad.modalidad);
				});
			}catch(e){};
			this.modalidadControl = new FormControl(modalidadesSelected);
		}
		if(this.detalle.unidades){
			this.detalle.unidades.forEach(unidad =>{
				this.unidadesArray.push(this.createUnidadesForm(unidad,this.detalle.id));
			});
		}else{
			//const uniqueObjects = [...new Map(this.unidades.map(item => [item.articulo.id && item.nivel, item])).values()];
			//this.unidades = uniqueObjects;
			console.log(this.unidades);
			this.unidades.forEach(unidad =>{
				if(!unidad.borrado){
					this.unidadesArray.push(this.createUnidadesNuevoForm(unidad,this.idCurso));	
				}
			});
		}
		let form: FormGroup = this._formBuilder.group({
			id: [this.detalle.id],
			programaIdiomaExamenId: new FormControl(this.detalle.programaIdiomaExamenId ? this.detalle.programaIdiomaExamenId : this.idCurso),
			actividadEvaluacion: this.actividadEvaluacionControl,
			test: this.testControl,
			time: new FormControl(this.detalle.time, [Validators.required]),
			puntaje: new FormControl(this.detalle.puntaje, [Validators.required]),
			continuos: new FormControl(this.detalle.continuos),
			activo: new FormControl(this.detalle.activo == null ? true : this.detalle.activo),
			//modalidades: this.modalidadesArray,
			unidades: this.unidadesArray
			//modalidadControl: this.modalidadControl
		})
		return form;
	}

	createModalidadesForm(modalidad: ProgramaIdiomaExamenModalidadEditarProjection, idDetalle: number){
		let form: FormGroup = this._formBuilder.group({
			id: [modalidad.id],
            examenDetalleId: new FormControl(idDetalle),           
    	    modalidad: new FormControl(modalidad.modalidad),
            dias: new FormControl(modalidad.dias, [Validators.required])
		})
		return form;
	}

	createUnidadesForm(unidad: ProgramaIdiomaExamenUnidadEditarProjection, idDetalle: number){
		let form: FormGroup = this._formBuilder.group({
			id:[unidad.id],
    		examenDetalleId: new FormControl(idDetalle),
    		libroMaterial: new FormControl(unidad.libroMaterial),
    		descripcion: new FormControl(unidad.descripcion, [Validators.required])
		});
		return form;
	}

	createUnidadesNuevoForm(libroMaterial: ProgramaIdiomaLibroMaterialEditarProjection, idDetalle: number){
		let form: FormGroup = this._formBuilder.group({
			id:[null],
    		examenDetalleId: new FormControl(idDetalle),
    		libroMaterial: new FormControl(libroMaterial),
    		descripcion: new FormControl(null, [Validators.required])
		});
		return form;
	}

	createModalidadesNuevoForm(modalidad: PAModalidadComboProjection, idDetalle: number){
		let form: FormGroup = this._formBuilder.group({
			id:[null],
    		examenDetalleId: new FormControl(idDetalle),
    		modalidad: new FormControl(modalidad),
    		dias: new FormControl(null, [Validators.required])
		});
		return form;
	}

	cambiarVista(paso: number){
		this.pasoSeleccionado = paso;
	}

}