import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface ErroresDialogData {
	response: any,
	onAceptar: (row: any) => void;
}

export class ErroresDataSource {
	row: string;
	code: string;
	message: string;
}

@Component({
	selector: 'errores',
	templateUrl: 'errores.dialog.html',
	animations: fuseAnimations
})
export class ErroresDialogComponent {

	response: ErroresDataSource[] = [];
	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef <ErroresDialogComponent>,
		private formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ErroresDialogData,
		public validatorService: ValidatorService
	) {
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.response = this.data.response.map(error => {
			let e:ErroresDataSource = new ErroresDataSource();
			e.row = error[0];
			e.code = error[1];
			e.message = error[2];

			return e;
		});
	}

	ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		this.dialogRef.close();
	}
}