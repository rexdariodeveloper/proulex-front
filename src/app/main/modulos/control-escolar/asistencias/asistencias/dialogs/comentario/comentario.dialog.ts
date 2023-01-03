import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

export interface ComentarioDialogData {
	row: any,
	onAceptar: (row: any) => void;
}

@Component({
	selector: 'comentario',
	templateUrl: 'comentario.dialog.html',
	animations: fuseAnimations
})
export class ComentarioDialogComponent {

	row: any = null;
	form: FormGroup;
	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef <ComentarioDialogComponent>,
		private formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ComentarioDialogData,
		public validatorService: ValidatorService
	) {
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.row = this.data.row;
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

		return form;
	}
}