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
import * as moment from 'moment';
import { ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection } from '@app/main/modelos/programa-grupo-incompany-criterio-evaluacion';

const MAX_28: number = 9999999999999999999999999999.99;

export interface ReprogramarClaseData {
	incompanyGrupoId: number;
	fechaActual: Date;
	horaActual: any;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'reprogramar-clase',
	templateUrl: 'reprogramar-clase.dialog.html',
	animations: fuseAnimations
})
export class ReprogramarClaseComponent {
	incompanyGrupoId: number;
	fechaActual: Date;
	horaActual: any;
	horaInicioActual: string;
	horaFinActual: string;
	claseReprogramada: FormGroup;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ReprogramarClaseComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ReprogramarClaseData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
		let form: FormGroup = this._formBuilder.group({
			id:[null],
			grupoId: new FormControl(this.incompanyGrupoId),
			fechaReprogramar: new FormControl(moment(this.fechaActual).format('YYYY-MM-DD')),
			fechaNueva: new FormControl(null),
			horaInicioString: new FormControl(null),
			horaFinString: new FormControl(null),
			horaInicioActual: new FormControl(this.horaInicioActual),
			horaFinActual: new FormControl(this.horaFinActual),
			motivo: new FormControl(null)
		});
		this.claseReprogramada = form;
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: ReprogramarClaseData) {
		this.incompanyGrupoId = data.incompanyGrupoId;
		this.fechaActual = data.fechaActual;
		this.horaInicioActual = String(data.horaActual).substring(0,8);
		this.horaFinActual = String(data.horaActual).substring(9,17);

		console.log(data);
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		this.dialogRef.close(this.claseReprogramada);
	}

}