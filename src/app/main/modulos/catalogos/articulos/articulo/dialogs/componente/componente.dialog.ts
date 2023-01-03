import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuListadoGeneralDetalleEditarProjection } from '@models/menu-listado-general-detalle';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { FormGroup, FormBuilder, AbstractControl, FormControl, Validators } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { OrdenCompraDetalleEditarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ArticuloComboProjection, ArticuloPrecargarProjection } from '@app/main/modelos/articulo';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { ArticulosTipos } from '@app/main/modelos/mapeos/articulos-tipos';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ArticuloComponenteEditarProjection } from '@app/main/modelos/articulo-componente';

const MAX_28: number = 9999999999999999999999999999.99;

export interface ArticuloComponenteDialogData {
	esNuevo: boolean;
	componente: ArticuloComponenteEditarProjection;
	articulos: ArticuloComboProjection[];
	articulosOmitirIds: number[];
	onAceptar: (registro: any) => void;
}

@Component({
	selector: 'articulo-componente-dialog',
	templateUrl: 'componente.dialog.html',
})
export class ArticuloComponenteDialogComponent {

	esNuevo: boolean;
	componente: ArticuloComponenteEditarProjection;

	form: FormGroup;
	
	articuloControl: FormControl = new FormControl();
	articulos: ArticuloComboProjection[];
	articulosOmitirIds: number[] = [];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ArticuloComponenteDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ArticuloComponenteDialogData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private el: ElementRef
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this.form = this.createForm();
		this.form.enable();
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: ArticuloComponenteDialogData) {
		this.articulosOmitirIds = data.articulosOmitirIds;
		this.esNuevo = data.esNuevo;
		this.componente = data.componente;
		this.articulos = data.articulos.filter(articulo => {
			return !this.articulosOmitirIds.includes(articulo.id) || articulo.id == this.componente?.componente?.id;
		});
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();
			if(this.componente){
				registroActualizar.id = this.componente.id;
			}
			this.data.onAceptar(registroActualizar);
			this.dialogRef.close();
		} else {
			this.form.markAllAsTouched();
			// this.camposDinamicos.form.validateAllFormFields(this.form);
			for (const key of Object.keys(this.form.controls)) {
				if (this.form.controls[key].invalid) {
					const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

					if (invalidControl) {
						//let tab = invalidControl.parents('div.tab-pane').scope().tab
						//tab.select();                           
						invalidControl.focus();
						break;
					}

				}
			}

			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});
		}
	}

	createForm(): FormGroup {

		this.articuloControl = new FormControl(this.componente?.componente || null, [Validators.required]);

		let form = this._formBuilder.group({
			id: [this.componente?.id || null],
			componente: this.articuloControl,
			cantidad: new FormControl(this.componente?.cantidad || null, [Validators.required, Validators.min(0.000001)])
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

}