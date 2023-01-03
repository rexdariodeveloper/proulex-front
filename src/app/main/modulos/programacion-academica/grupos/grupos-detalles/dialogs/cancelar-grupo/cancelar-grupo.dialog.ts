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

export interface CancelarGrupoData {
	fechaInicioGrupo: any;
	fechaFinGrupo: any;
}

@Component({
	selector: 'cancelar-grupo',
	templateUrl: 'cancelar-grupo.dialog.html',
	animations: fuseAnimations
})
export class CancelarGrupoComponent {
	fechaInicioGrupo: Moment;
	fechaFinGrupo: Moment;

    fechaCancelacionControl: FormControl = new FormControl(moment(),[Validators.required]);

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < CancelarGrupoComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: CancelarGrupoData,
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

	setData(data: CancelarGrupoData) {
		this.fechaInicioGrupo = moment(data.fechaInicioGrupo);
        this.fechaFinGrupo = moment(data.fechaFinGrupo);
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
    	if(!this.fechaCancelacionControl?.value){
			this._matSnackBar.open(this.translate.instant('Selecciona una fecha de cancelación'), 'OK', {
				duration: 5000,
			});
			return;
		}
		this.dialogRef.close({
			fechaCancelacion: this.fechaCancelacionControl.value.format('YYYY-MM-DD')
		});
	}

	fechaValida(fecha: Moment){
        let fechaMillis: number = Number(fecha);
        let fechaInicioMillis: number = Number(this.fechaInicioGrupo);
        let fechaFinMillis: number = Number(this.fechaFinGrupo);
        return fechaMillis >= fechaInicioMillis && fechaMillis <= fechaFinMillis;
	}

}