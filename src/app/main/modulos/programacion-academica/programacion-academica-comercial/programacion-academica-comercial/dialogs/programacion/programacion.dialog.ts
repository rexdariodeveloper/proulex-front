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
import { ProgramacionAcademicaComercialService } from "../../programacion-academica-comercial.service";
import { PACicloFechaProjection } from "@app/main/modelos/paciclo";
import { takeUntil } from "rxjs/operators";
import { ProgramaCalcularDiasProjection } from "@app/main/modelos/programa";
import { Moment } from "moment";
import { PixvsMatSelectComponent } from "@pixvs/componentes/mat-select-search/pixvs-mat-select.component";
import { isDefined } from "@angular/compiler/src/util";

export interface ProgramacionDialogData {
	idioma: ControlMaestroMultipleComboProjection;
	ciclo: PACicloFechaProjection;
	paModalidades: PAModalidadDiasProjection[];

	paModalidad?: PAModalidadDiasProjection;
	programas?: ProgramaCalcularDiasProjection[];
	numeroClases?: number;
	fechaInicio?: Moment;
	comentarios?: string;

	onAceptar: (idioma: ControlMaestroMultipleComboProjection, paModalidad: PAModalidadDiasProjection, programas: ProgramaCalcularDiasProjection[], numeroClases: number, fechaInicio: Moment, comentarios: string) => void;
}

@Component({
	selector: 'programacion-dialog',
	templateUrl: 'programacion.dialog.html',
	styleUrls: ['programacion.dialog.scss'],
	host: {
		class: 'header-bg'
	},
	encapsulation: ViewEncapsulation.None
})
export class ProgramacionDialogComponent {

	idioma: ControlMaestroMultipleComboProjection;
	ciclo: PACicloFechaProjection;
	
	paModalidades: PAModalidadDiasProjection[] = [];
	programas: ProgramaCalcularDiasProjection[] = [];

	form: FormGroup;

	paModalidadControl: FormControl = new FormControl();
	programaControl: FormControl = new FormControl();

	paModalidadDefault: PAModalidadDiasProjection;
	programasDefault: ProgramaCalcularDiasProjection[];
	numeroClasesDefault: number;
	fechaInicioDefault: Moment;
	comentariosDefault: string;

	@ViewChild('programasSelect') private programasSelect: PixvsMatSelectComponent;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ProgramacionDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ProgramacionDialogData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private el: ElementRef,
		public _programacionAcademicaComercialService: ProgramacionAcademicaComercialService
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

	setData(data: ProgramacionDialogData) {
		this.idioma = data.idioma;
		this.ciclo = data.ciclo;
		this.paModalidades = data.paModalidades;

		this.paModalidadDefault = data.paModalidad || null;
		this.programasDefault = data.programas || [];
		this.numeroClasesDefault = data.numeroClases || null;
		this.fechaInicioDefault = data.fechaInicio || null;
		this.comentariosDefault = data.comentarios || null;

		this._programacionAcademicaComercialService.onProgramasCalcularDiasChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(programas => {
			this.programas = programas || [];
			if(isDefined(this.programasSelect)){
				this.programasSelect.setDatos(this.programas);
			}
		});
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();

			this.data.onAceptar(this.idioma, registroActualizar.paModalidad, registroActualizar.programas, registroActualizar.numeroClases, registroActualizar.fechaInicio, registroActualizar.comentarios);
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

		this.paModalidadControl = new FormControl(this.paModalidadDefault, [Validators.required]);
		this.programaControl = new FormControl(this.programasDefault, [Validators.required]);

		this.paModalidadControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value: PAModalidadComboProjection) => {
			if(value){
				this._programacionAcademicaComercialService.getProgramasCalcularDias(this.idioma.id,value.id);
			}else{
				this._programacionAcademicaComercialService.onProgramasCalcularDiasChanged.next(null);
			}
		});

		let form = this._formBuilder.group({
			paModalidad: this.paModalidadControl,
			programas: this.programaControl,
			numeroClases: new FormControl(this.numeroClasesDefault,[Validators.required,Validators.min(0)]),
			fechaInicio: new FormControl(this.fechaInicioDefault,[Validators.required]),
			comentarios: new FormControl(this.comentariosDefault,[])
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