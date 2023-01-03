import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';

export interface NuevoRegistroDialogData {
	campos: FieldConfig[];
	onAceptar: (registro: any) => void;
}

@Component({
	selector: 'mat-select-search-nuevo-dialog',
	templateUrl: 'nuevo.dialog.html',
})
export class NuevoRegistroDialogComponent {

	@ViewChild('camposDinamicos') camposDinamicos: PixvsDynamicComponent;

	
	campos: FieldConfig[];

	private form: FormGroup;

	constructor(
		public dialogRef: MatDialogRef < NuevoRegistroDialogComponent > ,
		@Inject(MAT_DIALOG_DATA) public data: NuevoRegistroDialogData
	) {
		this.setData(data);
	}

	setData(data: NuevoRegistroDialogData) {
		console.log('data',data);
		this.campos = data.campos;
		setTimeout(() => {
			this.form = this.camposDinamicos.form.form;
		});
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();
			this.data.onAceptar(registroActualizar);
			this.dialogRef.close();
		} else {
			this.camposDinamicos.form.validateAllFormFields(this.form);
		}
	}

}