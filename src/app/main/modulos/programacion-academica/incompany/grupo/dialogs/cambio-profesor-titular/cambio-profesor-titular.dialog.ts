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
import { GruposService } from '../../../../grupos/grupos/grupos.service';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';

export interface CambioProfesorIncompanyTitularData {
	profesorTitular: EmpleadoComboProjection;
	categoriaTitular: string;
	sueldoTitular: number;
	profesores: EmpleadoComboProjection[];
	cursoId: number;
	grupoId: number;
	permisoSueldo: boolean;
	fechasHabiles: string[];
}

@Component({
	selector: 'cambio-profesor-titular',
	templateUrl: 'cambio-profesor-titular.dialog.html',
	animations: fuseAnimations
})
export class CambioProfesorTitularIncompanyComponent {
	profesorTitular: EmpleadoComboProjection;
	categoriaTitular: string;
	sueldoTitular: number;
	profesores: EmpleadoComboProjection[];
	cursoId: number;
	grupoId: number;
	permisoSueldo: boolean = false;
	fechasHabiles: string[] = null;

    fechaInicioControl: FormControl = new FormControl(moment(),[Validators.required]);
    profesorNuevoControl: FormControl = new FormControl(null,[Validators.required]);
	motivo: string;

	categoriaNuevo: string = null;
	sueldoNuevo: number = null;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < CambioProfesorTitularIncompanyComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: CambioProfesorIncompanyTitularData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
		public _grupoService: GruposService,
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

	setData(data: CambioProfesorIncompanyTitularData) {
		this.profesorTitular = data.profesorTitular;
        this.categoriaTitular = data.categoriaTitular;
        this.sueldoTitular = data.sueldoTitular;
        this.profesores = data.profesores;
        this.cursoId = data.cursoId;
        this.grupoId = data.grupoId;
        this.permisoSueldo = !!data.permisoSueldo;
        this.fechasHabiles = data.fechasHabiles;

		this.profesorNuevoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.profesorNuevoControl.value){
                this._grupoService.getDatosSueldo(this.cursoId,this.profesorNuevoControl.value.id,this.grupoId).then(value =>{
                    try{
						this.categoriaNuevo = value.data.categoria;
						this.sueldoNuevo = value.data.sueldo;
                    }catch(e){
						this.categoriaNuevo = null;
						this.sueldoNuevo = null;
                        this._matSnackBar.open(this.translate.instant('El curso o el profesor no tienen tabulador'), 'OK', {
                            duration: 5000,
                        });
                    }
                    
                });
            }
        });
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
    	if(!this.fechaInicioControl?.value){
			this._matSnackBar.open(this.translate.instant('Selecciona una fecha de inicio'), 'OK', {
				duration: 5000,
			});
			return;
		}
		if(!this.profesorNuevoControl?.value){
			this._matSnackBar.open(this.translate.instant('Selecciona al nuevo profesor titular'), 'OK', {
				duration: 5000,
			});
			return;
		}
		if(!this.sueldoNuevo){
			this._matSnackBar.open(this.translate.instant('El sueldo no puede ir vacío'), 'OK', {
				duration: 5000,
			});
			return;
		}
		this.dialogRef.close({
			fechaInicio: this.fechaInicioControl.value,
			profesorTitular: this.profesorNuevoControl.value,
			sueldo: this.sueldoNuevo,
			motivo: this.motivo,
			categoria: this.categoriaNuevo
		});
	}

	fechaValida(fecha: Moment){
		return this.fechasHabiles.includes(fecha.format('YYYY-MM-DD'));
	}

}