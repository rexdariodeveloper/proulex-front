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
import * as moment from "moment";

class DiaNoLaboral {
	fecha: Moment;
	diaSemana: number;
	diaMes: number;
	mes: number;
	anio: number;
}

export interface ProgramacionEditarDetalleDialogData {
	idTmp: number;
	idioma: ControlMaestroMultipleComboProjection;
	ciclo: PACicloFechaProjection;
	paModalidad: PAModalidadDiasProjection;
    programas: ProgramaCalcularDiasProjection[];
	numeroClases: number;
	fechaMinima: Moment;
	fechaInicio: Moment;
	fechaFin: Moment;
	comentarios: string;
	diasNoLaboralesCicloFiltrados: DiaNoLaboral[];

	onAceptar: (idioma: ControlMaestroMultipleComboProjection, paModalidad: PAModalidadDiasProjection, idTmp: number, numeroClases: number, fechaInicio: Moment, fechaFin: Moment, comentarios: string) => void;
}

@Component({
	selector: 'programacion-editar-detalle-dialog',
	templateUrl: 'editar-detalle.dialog.html',
	styleUrls: ['editar-detalle.dialog.scss'],
	host: {
		class: 'header-bg'
	},
	encapsulation: ViewEncapsulation.None
})
export class ProgramacionEditarDetalleDialogComponent {

	idTmp: number;
	fechaMinima: Moment;

	idioma: ControlMaestroMultipleComboProjection;
	ciclo: PACicloFechaProjection;
	
	paModalidades: PAModalidadDiasProjection[] = [];
	programas: ProgramaCalcularDiasProjection[] = [];

	form: FormGroup;

	paModalidadControl: FormControl = new FormControl();
	programaControl: FormControl = new FormControl();
	numeroClasesControl: FormControl = new FormControl();
	fechaInicioControl: FormControl = new FormControl();
	fechaFinControl: FormControl = new FormControl();

	numeroClasesAnterior: number;
	fechaInicioAnterior: Moment;
	fechaFinAnterior: Moment;

	comentariosDefault: string;

	diasNoLaboralesCicloFiltrados: DiaNoLaboral[];

	@ViewChild('programasSelect') private programasSelect: PixvsMatSelectComponent;
	@ViewChild('paModalidadSelect') private paModalidadSelect: PixvsMatSelectComponent;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ProgramacionEditarDetalleDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ProgramacionEditarDetalleDialogData,
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

	setData(data: ProgramacionEditarDetalleDialogData) {
		this.idTmp = data.idTmp;
		this.idioma = data.idioma;
		this.ciclo = data.ciclo;
		this.paModalidades = [data.paModalidad];
		this.programas = data.programas;
		this.fechaMinima = data.fechaMinima;

		this.paModalidadControl = new FormControl(data.paModalidad, [Validators.required]);
		this.programaControl = new FormControl(data.programas, [Validators.required]);
		this.numeroClasesControl = new FormControl(data.numeroClases,[Validators.required,Validators.min(0)]);
		this.fechaInicioControl = new FormControl(data.fechaInicio,[Validators.required]);
		this.fechaFinControl = new FormControl(data.fechaFin,[Validators.required]);

		this.numeroClasesAnterior = data.numeroClases;
		this.fechaInicioAnterior = data.fechaInicio;
		this.fechaFinAnterior = data.fechaFin;

		this.comentariosDefault = data.comentarios;

		this.diasNoLaboralesCicloFiltrados = data.diasNoLaboralesCicloFiltrados;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();

			this.data.onAceptar(this.idioma, registroActualizar.paModalidad, this.idTmp, registroActualizar.numeroClases, registroActualizar.fechaInicio, registroActualizar.fechaFin, registroActualizar.comentarios);
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

		this.paModalidadControl.disable();
		this.programaControl.disable();

		this.numeroClasesControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((numeroClases: number) => {
			if(this.numeroClasesAnterior != numeroClases){
				this.numeroClasesAnterior = numeroClases;
				if(!!numeroClases){
					if(isDefined(this.fechaInicioControl.value)){
						this.calcularFechaFin();
					}
				}else{
					this.fechaFinControl.setValue(null);
				}
			}
		});
		this.fechaInicioControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((fecha: Moment) => {
			if(Number(this.fechaInicioAnterior) != Number(fecha)){
				this.fechaInicioAnterior = this.fechaInicioControl.value;
				if(!!fecha){
					let paModalidad: PAModalidadDiasProjection = this.paModalidadControl.value;
					let cambiarFecha: boolean = false;
					while(!paModalidad.diasSemanaActivos[fecha.day()]){
						fecha.add(1,'day');
						cambiarFecha = true;
					}
					if(cambiarFecha){
						this.fechaInicioControl.setValue(fecha);
					}else{
						this.calcularFechaFin();
					}
				}else{
					this.fechaFinControl.setValue(null);
				}
			}
		});
		this.fechaFinControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((fecha: Moment) => {
			if(Number(this.fechaFinAnterior) != Number(fecha)){
				this.fechaFinAnterior = this.fechaFinControl.value;
				if(!!fecha){
					let paModalidad: PAModalidadDiasProjection = this.paModalidadControl.value;
					let cambiarFecha: boolean = false;
					while(!paModalidad.diasSemanaActivos[fecha.day()]){
						fecha.subtract(1,'day');
						cambiarFecha = true;
					}
					if(cambiarFecha){
						this.fechaFinControl.setValue(fecha);
					}else{
						this.calcularNumeroClases();
					}
				}else{
					this.numeroClasesControl.setValue(null);
				}
			}
		});

		let form = this._formBuilder.group({
			paModalidad: this.paModalidadControl,
			programas: this.programaControl,
			numeroClases: this.numeroClasesControl,
			fechaInicio: this.fechaInicioControl,
			fechaFin: this.fechaFinControl,
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

	calcularFechaFin(){
		let paModalidad: PAModalidadDiasProjection = this.paModalidadControl.value;
		let clasesRestantes: number = Number(this.numeroClasesControl.value);
		let fecha: Moment = moment(this.fechaInicioControl.value);
		let diasNoLaboralesCicloFiltrados = [].concat(this.diasNoLaboralesCicloFiltrados);
		while(clasesRestantes > 0){
			while(isDefined(diasNoLaboralesCicloFiltrados[0]) && diasNoLaboralesCicloFiltrados[0].fecha < fecha){
				diasNoLaboralesCicloFiltrados = diasNoLaboralesCicloFiltrados.slice(1);
			}
			if(paModalidad.diasSemanaActivos[fecha.day()] && (!isDefined(diasNoLaboralesCicloFiltrados[0]) || diasNoLaboralesCicloFiltrados[0].fecha > fecha)){
				clasesRestantes--;
			}
			fecha.add(1,'day');
		}
		fecha.subtract(1,'day');
		this.fechaFinControl.setValue(fecha);
	}

	calcularNumeroClases(){
		let paModalidad: PAModalidadDiasProjection = this.paModalidadControl.value;
		let fecha: Moment = moment(this.fechaInicioControl.value);
		let fechaFin: Moment = moment(this.fechaFinControl.value);
		let numeroClases: number = 0;
		let diasNoLaboralesCicloFiltrados = [].concat(this.diasNoLaboralesCicloFiltrados);
		while(Number(fecha) <= Number(fechaFin)){
			while(isDefined(diasNoLaboralesCicloFiltrados[0]) && diasNoLaboralesCicloFiltrados[0].fecha < fecha){
				diasNoLaboralesCicloFiltrados = diasNoLaboralesCicloFiltrados.slice(1);
			}
			if(paModalidad.diasSemanaActivos[fecha.day()] && (!isDefined(diasNoLaboralesCicloFiltrados[0]) || diasNoLaboralesCicloFiltrados[0].fecha > fecha)){
				numeroClases++;
			}
			fecha.add(1,'day');
		}
		this.numeroClasesControl.setValue(numeroClases);
	}

}