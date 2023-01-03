import { Component, ElementRef, Inject, ViewChild, ViewEncapsulation } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { ValidatorService } from "@services/validators.service";
import { Subject } from "rxjs";
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { PAModalidadComboProjection, PAModalidadDiasProjection } from "@app/main/modelos/pamodalidad";
import { PACicloFechaProjection } from "@app/main/modelos/paciclo";
import { takeUntil } from "rxjs/operators";
import { ProgramaCalcularDiasProjection } from "@app/main/modelos/programa";
import { Moment } from "moment";
import { PixvsMatSelectComponent } from "@pixvs/componentes/mat-select-search/pixvs-mat-select.component";
import { isDefined } from "@angular/compiler/src/util";
import * as moment from "moment";
import { ProgramacionAcademicaComercialComboProjection } from "@app/main/modelos/programacion-academica-comercial";
import { ProgramacionAcademicaComercialDetalleMetaListadoProjection } from "@app/main/modelos/programacion-academica-comercial-detalle";

export interface EditarMetaDialogData {
	programacionAcademicaComercial: ProgramacionAcademicaComercialComboProjection;
    paModalidad: PAModalidadComboProjection;
    programacionAcademicaComercialDetalle: ProgramacionAcademicaComercialDetalleMetaListadoProjection;
    meta: number;

	onAceptar: (programacionAcademicaComercialDetalle: ProgramacionAcademicaComercialDetalleMetaListadoProjection, meta: number) => void;
}

@Component({
	selector: 'editar-meta-dialog',
	templateUrl: 'editar-meta.dialog.html',
	styleUrls: ['editar-meta.dialog.scss'],
	host: {
		class: 'header-bg'
	},
	encapsulation: ViewEncapsulation.None
})
export class EditarMetaDialogComponent {

    programacionAcademicaComercial: ProgramacionAcademicaComercialComboProjection;
    paModalidad: PAModalidadComboProjection;
    programacionAcademicaComercialDetalle: ProgramacionAcademicaComercialDetalleMetaListadoProjection;

    form: FormGroup;
	programacionAcademicaComercialControl: FormControl = new FormControl();
    paModalidadControl: FormControl = new FormControl();
    metaControl: FormControl = new FormControl();

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < EditarMetaDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: EditarMetaDialogData,
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

	setData(data: EditarMetaDialogData) {
		this.programacionAcademicaComercial = data.programacionAcademicaComercial;
        this.paModalidad = data.paModalidad;
        this.programacionAcademicaComercialDetalle = data.programacionAcademicaComercialDetalle;

		this.programacionAcademicaComercialControl = new FormControl(this.programacionAcademicaComercial.nombre, [Validators.required]);
		this.paModalidadControl = new FormControl(this.paModalidad.nombre, [Validators.required]);
		this.metaControl = new FormControl(data.meta,[Validators.required,Validators.min(0)]);
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();

			this.data.onAceptar(this.programacionAcademicaComercialDetalle, registroActualizar.meta);
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

		let form = this._formBuilder.group({
			programacionAcademicaComercial: this.programacionAcademicaComercialControl,
			paModalidad: this.paModalidadControl,
			meta: this.metaControl
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