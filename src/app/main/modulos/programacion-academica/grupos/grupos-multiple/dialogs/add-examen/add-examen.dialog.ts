import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { OrdenCompraDetalleRelacionarProjection } from '@app/main/modelos/orden-compra-detalle';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { takeUntil, take } from 'rxjs/operators';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

const MAX_28: number = 9999999999999999999999999999.99;

export interface AddExamenData {
	curso: any;
	modalidad: any;
	tipoGrupo: any;
	niveles: any;
	planteles: any;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'add-examen',
	templateUrl: 'add-examen.dialog.html',
	animations: fuseAnimations
})
export class AddExamenComponent {
	@ViewChild('nivelSelect') nivelSelect: PixvsMatSelectComponent;
	curso: any;
	modalidad: any;
	tipoGrupo: any;
	niveles: any;
	planteles: any;
	nivel: number = 1;
	numeroGrupos: number = 1;
	cupo: number = 20;

	cursoNombre: string;
	modalidadNombre: string;

	tipoGrupoControl: FormControl = new FormControl();
	horarioControl: FormControl = new FormControl();
	nivelesControl: FormControl = new FormControl();
	plantelControl: FormControl = new FormControl();

	private _unsubscribeAll: Subject < any > ;

	nivelesArrays = [];

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
		this.cursoNombre = this.curso.value.nombre;
		this.modalidadNombre = this.modalidad.value.codigo +'-'+this.modalidad.value.nombre;
		for(var i=1;i<=this.niveles;i++){
			this.nivelesArrays.push({
				id: i,
				nombre: 'Nivel '+i	
			});
		}
	}

	ngOnInit(): void {
		if(this.planteles && this.planteles.length > 0){
			this.cupo = 25;
		}
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AddExamenData) {
		this.curso = data.curso;
		this.modalidad = data.modalidad;
		this.tipoGrupo = data.tipoGrupo;
		this.niveles = data.niveles;
		this.planteles = data.planteles;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.planteles && this.planteles.length > 0 && !this.plantelControl.value){
			this.plantelControl.markAsTouched();
			this._matSnackBar.open(this.translate.instant('El plantel es obligatorio'), 'OK', {
                duration: 5000,
            });
		}
		else if(this.numeroGrupos && this.nivel && (this.nivel <= this.niveles) && this.horarioControl?.value && this.tipoGrupoControl?.value && this.cupo){
			let grupo ={
				total: this.numeroGrupos,
				nivel: this.nivelesControl.value.id,
				modalidadHorario: this.horarioControl,
				tipoGrupo: this.tipoGrupoControl,
				cupo: this.cupo,
				sucursalPlantel: this.plantelControl
			}
			
			//this.data.onAceptar(true);
			this.dialogRef.close(grupo);
		}
		else if(this.nivel > this.niveles){
			this._matSnackBar.open(this.translate.instant('El nivel máximo permitido es '+this.niveles), 'OK', {
                duration: 5000,
            });
		}
		else{
			this._matSnackBar.open(this.translate.instant('Favor de completar todos los datos'), 'OK', {
                duration: 5000,
            });
		}
		
	}

}