import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { locale as english } from '../../i18n/en';
import { locale as spanish } from '../../i18n/es';

export interface ArticuloDialogData {
	esNuevo: boolean;
	articulo: any;
	camposListado: FieldConfig[];
	onAceptar: (registro: any) => void;
}

@Component({
	selector: 'articulo-dialog',
	templateUrl: 'articulo.dialog.html',
})
export class ArticuloDialogComponent {

	@ViewChild('camposDinamicos') camposDinamicos: PixvsDynamicComponent;

	esNuevo: boolean;
	articulo: any;
	camposListado: FieldConfig[];
	_unsubscribeAll: Subject<any>;

	private form: FormGroup;

	constructor(
		public dialogRef: MatDialogRef<ArticuloDialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
		private el: ElementRef,
		@Inject(MAT_DIALOG_DATA) public data: ArticuloDialogData
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		// Set the private defaults
		this._unsubscribeAll = new Subject();

		this.setData(data);
	}

	setData(data: ArticuloDialogData) {
		this.esNuevo = data.esNuevo;
		this.articulo = data.articulo;
		this.camposListado = data.camposListado;

		setTimeout(() => {
			this.form = this.camposDinamicos.form.form;

			if (this.articulo) {
				for (let campoRegistro in this.articulo) {
					if (!!this.form.controls[campoRegistro]) {
						this.form.controls[campoRegistro].setValue(this.articulo[campoRegistro]);
						this.form.controls[campoRegistro].updateValueAndValidity();
					}
				}
			} else {
				for (let campoRegistro in this.form.controls) {
					this.form.controls[campoRegistro].setValue(null);
					this.form.controls[campoRegistro].markAsUntouched();
					this.form.controls[campoRegistro].updateValueAndValidity();
				}
			}
			this.form.controls['cantidadTransferida'].setValue(this.form.controls['restante'].value);
		});
	}

	ngAfterViewInit(): void {
		setTimeout(()=>{
			this.el.nativeElement.querySelectorAll('input')[2].focus();
			this.form.controls['cantidadTransferida'].setValue(null);
		}, 500)
	}

	cantidadValida(): boolean {
		if(!this.form?.controls)
			return false;
		let enviada = Number(this.form.controls['restante'].value);
		let recibida = Number(this.form.controls['cantidadTransferida'].value);
		let spill = Number(this.form.controls['spill'].value);
		
		return (enviada == recibida + spill);
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();
			registroActualizar.id = this.articulo.id;

			if (registroActualizar.restante < registroActualizar.cantidadTransferida + registroActualizar.cantidadDevuelta + registroActualizar.spill) {
				this._matSnackBar.open(this.translate.instant('CANTIDAD_RESTANTE'), 'OK', { duration: 5000 });
			} else if (registroActualizar.cantidadTransferida == 0
				&& registroActualizar.cantidadDevuelta == 0
				&& registroActualizar.spill == 0) {
				this._matSnackBar.open(this.translate.instant('CANTIDAD_CERO'), 'OK', { duration: 5000 });
			} else {
				this.data.onAceptar(registroActualizar);
				this.dialogRef.close();
			}
		} else {
			this.camposDinamicos.form.validateAllFormFields(this.form);
		}
	}
}