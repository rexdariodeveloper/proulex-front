import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuListadoGeneralDetalleEditarProjection } from '@models/menu-listado-general-detalle';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { FormGroup } from '@angular/forms';
import { EmpleadoContratoResponsabilidad } from '@app/main/modelos/empleado-contrato-responsabilidad';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';

export interface ResponsabilidadDialogData {
	esNuevo: boolean;
	responsabilidad: EmpleadoContratoResponsabilidad;
    titulo: string;
    index: number;
	camposListado: FieldConfig[];
	onAceptar: (registro: any) => void;
}

@Component({
	selector: 'responsabilidad',
	templateUrl: 'responsabilidad.dialog.html',
})
export class EmpleadoContratoResponsabilidadComponent {

	@ViewChild('camposDinamicos') camposDinamicos: PixvsDynamicComponent;

	esNuevo: boolean;
    esHabilidad: boolean;
	responsabilidad: any;
	camposListado: FieldConfig[];
    titulo: String = 'Registro';
    index: number = -1;

	private form: FormGroup;

	constructor(
		public dialogRef: MatDialogRef < EmpleadoContratoResponsabilidadComponent > ,
		@Inject(MAT_DIALOG_DATA) public data: ResponsabilidadDialogData
	) {
		this.setData(data);
		console.log(data);
	}

	setData(data: ResponsabilidadDialogData) {
        this.titulo = data.titulo;
		this.esNuevo = data.esNuevo;
		this.responsabilidad = data.responsabilidad;
		this.camposListado = data.camposListado;
        this.index = data.index;
		setTimeout(() => {
			this.form = this.camposDinamicos.form.form;
			if(this.responsabilidad){
				for(let campoRegistro in this.responsabilidad){
					if(!!this.form.controls[campoRegistro]){
						this.form.controls[campoRegistro].setValue(this.responsabilidad[campoRegistro]);
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
			if(this.responsabilidad){
				registroActualizar.id = this.responsabilidad.id;
			}
			registroActualizar['esNuevo'] = this.esNuevo;
            registroActualizar['index'] = this.index;
			this.data.onAceptar(registroActualizar);
			this.dialogRef.close();
		} else {
			this.camposDinamicos.form.validateAllFormFields(this.form);
		}
	}

}