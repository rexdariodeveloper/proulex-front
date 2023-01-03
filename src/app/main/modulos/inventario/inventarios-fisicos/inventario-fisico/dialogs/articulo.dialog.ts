import { Component, Inject, ViewChild } from '@angular/core';
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
	localidadId: number;
	listadoLocalidadesArticulos: any[];
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
	localidadId: number;
	_unsubscribeAll: Subject<any>;
	listadoLocalidadesArticulos: any[];

	private form: FormGroup;

	constructor(
		public dialogRef: MatDialogRef<ArticuloDialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
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
		this.localidadId = data.localidadId;
		this.listadoLocalidadesArticulos = data.listadoLocalidadesArticulos;

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
		});
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();

			if (this.articulo) {
				registroActualizar.id = this.articulo.id;
			}

			if (registroActualizar.cantidad == 0) {
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