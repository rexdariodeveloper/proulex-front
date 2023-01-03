import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuListadoGeneralDetalleEditarProjection } from '@models/menu-listado-general-detalle';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { FormGroup } from '@angular/forms';
import { LocalidadListadoProjection } from '@app/main/modelos/localidad';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';

export interface LocalidadDialogData {
	esNuevo: boolean;
	localidad: LocalidadListadoProjection;
	camposListado: FieldConfig[];
	onAceptar: (registro: any) => void;
}

@Component({
	selector: 'localidad-dialog',
	templateUrl: 'localidad.dialog.html',
})
export class LocalidadDialogComponent {

	@ViewChild('camposDinamicos') camposDinamicos: PixvsDynamicComponent;

	esNuevo: boolean;
	localidad: any;
	camposListado: FieldConfig[];

	private form: FormGroup;

	constructor(
		public dialogRef: MatDialogRef < LocalidadDialogComponent > ,
		@Inject(MAT_DIALOG_DATA) public data: LocalidadDialogData
	) {
		this.setData(data);
		console.log(data);
	}

	setData(data: LocalidadDialogData) {
		this.esNuevo = data.esNuevo;
		this.localidad = data.localidad;
		this.camposListado = data.camposListado;
		setTimeout(() => {
			this.form = this.camposDinamicos.form.form;
			if(this.localidad){
				for(let campoRegistro in this.localidad){
					if(!!this.form.controls[campoRegistro]){
						this.form.controls[campoRegistro].setValue(this.localidad[campoRegistro]);
						this.form.controls[campoRegistro].updateValueAndValidity();
					}
				}
			}else{
				for(let campoRegistro in this.form.controls){
					this.form.controls[campoRegistro].setValue(null);
					this.form.controls[campoRegistro].markAsUntouched();
					this.form.controls[campoRegistro].updateValueAndValidity();
				}
			}
		});
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();
			if(this.localidad){
				registroActualizar.id = this.localidad.id;
			}
			registroActualizar['esNuevo'] = this.esNuevo;
			this.data.onAceptar(registroActualizar);
			this.dialogRef.close();
		} else {
			this.camposDinamicos.form.validateAllFormFields(this.form);
		}
	}

}