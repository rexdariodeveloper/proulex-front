import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ValidatorService } from '@services/validators.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { Subject } from 'rxjs';

export interface MotivoCancelacionDialogData {
	onAceptar: (registro: any) => void;
	listMotivosCancelacion: any[];
}

@Component({
	selector: 'motivo-cancelacion-dialog',
	templateUrl: './motivo-cancelacion.dialog.html',
	styleUrls: ['./motivo-cancelacion.dialog.scss'],
	animations: fuseAnimations,
})
export class MotivoCancelacionDialogComponent {

	localeEN = generalEN;
	localeES = generalES;

	_unsubscribeAll: Subject<any>;
	form: FormGroup;

	listMotivosCancelacion: any[];
	motivoCancelacionControl: FormControl = new FormControl();

	constructor(
		public dialogRef: MatDialogRef<MotivoCancelacionDialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _formBuilder: FormBuilder,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		@Inject(MAT_DIALOG_DATA) public data: MotivoCancelacionDialogData,
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		// Set the private defaults
		this._unsubscribeAll = new Subject();

		this.setData(data);
	}

	ngOnDestroy() {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	setData(data: MotivoCancelacionDialogData) {
		this.listMotivosCancelacion = data.listMotivosCancelacion;

		setTimeout(() => {
			this.form = this.createForm();
			this.form.enable();

			for (let campoRegistro in this.form.controls) {
				this.form.controls[campoRegistro].setValue(null);
				this.form.controls[campoRegistro].markAsUntouched();
				this.form.controls[campoRegistro].updateValueAndValidity();
			}
		});
	}

	createForm(): FormGroup {
		this.motivoCancelacionControl = new FormControl(null, [Validators.required]);

		let form = this._formBuilder.group({
			motivoCancelacionId: this.motivoCancelacionControl.value?.id || null,
			motivoCancelacion: this.motivoCancelacionControl
		});

		return form;
	}

	isRequired(campo: string) {
		let form_field = this.form.get(campo);

		if (!form_field.validator) {
			return false;
		}

		let validator = form_field.validator({} as AbstractControl);

		return !!(validator && validator.required);
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			this.data.onAceptar(this.motivoCancelacionControl.value.id);
			this.dialogRef.close();
		} else {
			Object.keys(this.form.controls).forEach(field => {
				const control = this.form.get(field);
				control.markAsTouched({ onlySelf: true });
			});
		}
	}
}