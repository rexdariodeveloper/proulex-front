import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { fuseAnimations } from '@fuse/animations';
import {  FormControl, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';

export interface TipoAsistenciaDialogData {
	tienePermiso: boolean,
	row: any,
	horasDia: number,
	onAceptar: (row: any) => void;
}

@Component({
	selector: 'tipo-asistencia',
	templateUrl: 'tipo-asistencia.dialog.html',
	animations: fuseAnimations
})
export class TipoAsistenciaDialogComponent {

	tienePermiso: boolean = false;
	row: any = null;
	horasDia: number = 0;
	form: FormGroup;
	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef <TipoAsistenciaDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: TipoAsistenciaDialogData,
		public validatorService: ValidatorService
	) {
		this._unsubscribeAll = new Subject();
		this.tienePermiso = this.data.tienePermiso;
		this.row = this.data.row;
		this.horasDia = this.data.horasDia * 60;
		this.form = this.createForm();
		this.form.enable();
	}

	ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		this.data.onAceptar(this.form);
		this.dialogRef.close();
	}

	createForm(): FormGroup {
		let form: FormGroup = new FormGroup({});
		Object.keys(this.row).forEach( key => {
			form.addControl(key, new FormControl(this.row[key]));
		});

		if (form.get('tipoAsistenciaId').value == null)
			form.get('tipoAsistenciaId').setValue(ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.ASISTENCIA, { emitEvent: false });

		form.get('minutosRetardo').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
			if( !!data ){
				if(data > this.horasDia)
					form.get('minutosRetardo').setValue( this.horasDia );
			}
		});

		return form;
	}
}