import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuListadoGeneralDetalleEditarProjection } from '@models/menu-listado-general-detalle';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { FormGroup } from '@angular/forms';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';

export interface RegistroCatalogoDialogData {
	esNuevo: boolean;
	registro: any;
	camposListado: MenuListadoGeneralDetalleEditarProjection[];
	listados: any;
	onAceptar: (registro: any) => void;
	onBorrar: (registro: any) => void;
}

@Component({
	selector: 'registro-catalogo-dialog',
	templateUrl: 'registro-catalogo.dialog.html',
})
export class RegistroCatalogoDialogComponent {

	@ViewChild('camposDinamicos') camposDinamicos: PixvsDynamicComponent;

	esNuevo: boolean;
	registro: any;
	camposListado: MenuListadoGeneralDetalleEditarProjection[];
	listados: any;

	private form: FormGroup;

	constructor(
		public dialogRef: MatDialogRef < RegistroCatalogoDialogComponent > ,
		@Inject(MAT_DIALOG_DATA) public data: RegistroCatalogoDialogData,
		public dialog: MatDialog,
		private translate: TranslateService
	) {
		this.setData(data);
	}

	setData(data: RegistroCatalogoDialogData) {
		this.esNuevo = data.esNuevo;
		this.registro = data.registro;
		this.camposListado = data.camposListado;
		this.listados = data.listados;
		for(let campo of this.camposListado){
			if(campo.jsonConfig.type == 'pixvsMatSelect'){
				campo.jsonConfig.list = this.listados[campo.campoModelo];
			}
		}
		setTimeout(() => {
			this.form = this.camposDinamicos.form.form;
			if(this.registro){
				for(let campoRegistro in this.registro){
					if(!!this.form.controls[campoRegistro]){
						this.form.controls[campoRegistro].setValue(this.registro[campoRegistro]);
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
			if(this.registro){
				registroActualizar.id = this.registro.id;
			}
			this.data.onAceptar(registroActualizar);
			this.dialogRef.close();
		} else {
			this.camposDinamicos.form.validateAllFormFields(this.form);
		}
	}

	borrar(): void {
		
		const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
			width: '400px',
			data: {
				mensaje: this.translate.instant('MENSAJE.CONFIRMACION_BORRAR')
			}
		});

		dialogRef.afterClosed().subscribe(confirm => {
			if(confirm){
				this.data.onBorrar(this.registro);
				this.dialogRef.close();
			}
		});
	}

}