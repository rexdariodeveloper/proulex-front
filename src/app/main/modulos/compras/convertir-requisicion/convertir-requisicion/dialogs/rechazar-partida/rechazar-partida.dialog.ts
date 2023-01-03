import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuListadoGeneralDetalleEditarProjection } from '@models/menu-listado-general-detalle';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { FormGroup, FormBuilder, AbstractControl, FormControl, Validators } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { OrdenCompraDetalleEditarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ArticuloComboProjection, ArticuloPrecargarProjection, ArticuloUltimasComprasProjection } from '@app/main/modelos/articulo';
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
import { OrdenCompra } from '@app/main/modelos/orden-compra';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import * as moment from 'moment';
import { RequisicionPartidaConvertirListadoProjection } from '@app/main/modelos/requisicion-partida';

const MAX_28: number = 9999999999999999999999999999.99;

export interface RechazarPartidaDialogData {
	partidaRechazar: RequisicionPartidaConvertirListadoProjection;
	onAceptar: (partidaRechazar: RequisicionPartidaConvertirListadoProjection, comentario: string) => void;
}

@Component({
	selector: 'rechazar-partida-dialog',
	templateUrl: 'rechazar-partida.dialog.html',
})
export class RechazarPartidaDialogComponent {

	partidaRechazar: RequisicionPartidaConvertirListadoProjection;

	form: FormGroup;
	comentarioControl: FormControl;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < RechazarPartidaDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: RechazarPartidaDialogData,
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
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: RechazarPartidaDialogData) {
		this.partidaRechazar = data.partidaRechazar;
		
		this.comentarioControl = new FormControl(null,[Validators.required,Validators.maxLength(255)]);
		this.form = this._formBuilder.group({
			comentario: this.comentarioControl
		});
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			this.form.disable();
			this.data.onAceptar(this.partidaRechazar,this.comentarioControl.value);
			this.dialogRef.close();
		} else {

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

	isRequired(campo: string) {

		let form_field = this.form.get(campo);
		if (!form_field.validator) {
			return false;
		}

		let validator = form_field.validator({} as AbstractControl);
		return !!(validator && validator.required);

	}

}