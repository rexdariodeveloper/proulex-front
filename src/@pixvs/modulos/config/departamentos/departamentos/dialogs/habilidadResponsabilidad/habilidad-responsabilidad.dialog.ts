import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuListadoGeneralDetalleEditarProjection } from '@models/menu-listado-general-detalle';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';

export interface HabilidadResponsabilidadDialogData {
	esNuevo: boolean;
	habilidadResponsabilidad: any;
    titulo: string;
    esResponsabilidad: boolean,
    index: number,
	camposListado: FieldConfig[];
	onAceptar: (registro: any) => void;
}

@Component({
	selector: 'habilidad-responsabilidad',
	templateUrl: 'habilidad-responsabilidad.dialog.html',
})
export class HabilidadResponsabilidadDialogComponent {

	@ViewChild('camposDinamicos') camposDinamicos: PixvsDynamicComponent;

	esNuevo: boolean;
    esResponsabilidad: boolean;
	habilidadResponsabilidad: any;
	camposListado: FieldConfig[];
    titulo: String = 'Registro';
    index: number = -1;

	private form: FormGroup;

	constructor(
		public dialogRef: MatDialogRef < HabilidadResponsabilidadDialogComponent > ,
		@Inject(MAT_DIALOG_DATA) public data: HabilidadResponsabilidadDialogData
	) {
		this.setData(data);
		console.log(data);
	}

	setData(data: HabilidadResponsabilidadDialogData) {
        this.titulo = data.titulo;
		this.esNuevo = data.esNuevo;
		this.habilidadResponsabilidad = data.habilidadResponsabilidad;
		this.camposListado = data.camposListado;
        this.esResponsabilidad = data.esResponsabilidad;
        this.index = data.index;
		setTimeout(() => {
			this.form = this.camposDinamicos.form.form;
			if(this.habilidadResponsabilidad){
				for(let campoRegistro in this.habilidadResponsabilidad){
					if(!!this.form.controls[campoRegistro]){
						this.form.controls[campoRegistro].setValue(this.habilidadResponsabilidad[campoRegistro]);
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
			if(this.habilidadResponsabilidad?.id){
				registroActualizar.id = this.habilidadResponsabilidad.id;
			}
            registroActualizar['departamentoId'] = !!this.habilidadResponsabilidad.departamentoId ? this.habilidadResponsabilidad.departamentoId : null;;
			registroActualizar['esNuevo'] = this.esNuevo;
            registroActualizar['esResponsabilidad'] = this.esResponsabilidad;
            registroActualizar['index'] = this.index;
            
			this.data.onAceptar(registroActualizar);
			this.dialogRef.close();
		} else {
			this.camposDinamicos.form.validateAllFormFields(this.form);
		}
	}

}