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

export interface PonderarTareasData {
	examenes: any[];
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'ponderar-tareas',
	templateUrl: 'ponderar-tareas.dialog.html',
	animations: fuseAnimations
})
export class PonderarTareasComponent {

	private _unsubscribeAll: Subject < any > ;
	examenes: any[];

	constructor(
		public dialogRef: MatDialogRef < PonderarTareasComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: PonderarTareasData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
		private el: ElementRef,
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
		console.log(data);

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

	setData(data: PonderarTareasData) {
		this.examenes = data.examenes;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.total() <= 100){
			this.dialogRef.close(this.examenes);
		}else{
			this._matSnackBar.open(this.translate.instant('La ponderación no puede ser mayor a 100'), 'OK', {
                duration: 5000,
            });
		}
		
	}

	total(){
		let total: number  = 0;
		this.examenes.forEach(examen =>{
			total = total + Number(examen.porcentaje);
		});
		return total;
	}
}