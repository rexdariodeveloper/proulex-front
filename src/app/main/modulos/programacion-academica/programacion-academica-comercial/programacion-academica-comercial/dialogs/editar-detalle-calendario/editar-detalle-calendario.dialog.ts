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
import { ProgramacionAcademicaComercialDetalleEditarProjection } from "@app/main/modelos/programacion-academica-comercial-detalle";

export interface ProgramacionEditarDetalleCalendarioDialogData {
	detalles: ProgramacionAcademicaComercialDetalleEditarProjection[];
	idioma: ControlMaestroMultipleComboProjection;
	ciclo: PACicloFechaProjection;
	fechasMinimasMapDetalleIdTmp: {[detalleIdTmp:string]: Moment}
	onAceptar: (idioma: ControlMaestroMultipleComboProjection, paModalidad: PAModalidadDiasProjection, idTmp: number, numeroClases: number, fechaInicio: Moment, fechaFin: Moment, comentarios: string) => void;
}

@Component({
	selector: 'programacion-editar-detalle-calendario-dialog',
	templateUrl: 'editar-detalle-calendario.dialog.html',
	styleUrls: ['editar-detalle-calendario.dialog.scss'],
	host: {
		class: 'header-bg'
	},
	encapsulation: ViewEncapsulation.None
})
export class ProgramacionEditarDetalleCalendarioDialogComponent {

	detalles: ProgramacionAcademicaComercialDetalleEditarProjection[];
	detallesMapPaModalidadId: {[paModalidadId:string]: ProgramacionAcademicaComercialDetalleEditarProjection} = {};
	fechasMinimasMapDetalleIdTmp: {[detalleIdTmp:string]: Moment};

	idTmp: number;
	fechaMinima: Moment;

	idioma: ControlMaestroMultipleComboProjection;
	ciclo: PACicloFechaProjection;
	
	paModalidades: PAModalidadDiasProjection[];
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

	@ViewChild('programasSelect') private programasSelect: PixvsMatSelectComponent;
	@ViewChild('paModalidadSelect') private paModalidadSelect: PixvsMatSelectComponent;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ProgramacionEditarDetalleCalendarioDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ProgramacionEditarDetalleCalendarioDialogData,
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

	setData(data: ProgramacionEditarDetalleCalendarioDialogData) {
		this.detalles = data.detalles;
		this.detalles.forEach(detalle => {
			this.detallesMapPaModalidadId[detalle.paModalidad.id] = detalle;
		});
		this.fechasMinimasMapDetalleIdTmp = data.fechasMinimasMapDetalleIdTmp;
		this.idioma = data.idioma;
		this.ciclo = data.ciclo;
		this.paModalidades = this.detalles.map(detalle => detalle.paModalidad);

		this.paModalidadControl = new FormControl(null, [Validators.required]);
		this.programaControl = new FormControl([], [Validators.required]);
		this.numeroClasesControl = new FormControl(null,[Validators.required,Validators.min(0)]);
		this.fechaInicioControl = new FormControl(null,[Validators.required]);
		this.fechaFinControl = new FormControl(null,[Validators.required]);

		this.paModalidadControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((paModalidad: PAModalidadDiasProjection) => {
			this.setPaModalidad(paModalidad);
		})
	}

	setPaModalidad(paModalidad: PAModalidadDiasProjection) {
		if(!!paModalidad){
			let detalle = this.detallesMapPaModalidadId[paModalidad.id];
	
			this.idTmp = detalle.idTmp;
			this.programas = detalle.programas;
			
			this.fechaMinima = this.fechasMinimasMapDetalleIdTmp[detalle.idTmp];
	
			// this.paModalidadControl.setValue(detalle.paModalidad);
			this.programaControl.setValue(detalle.programas);
			this.numeroClasesControl.setValue(detalle.numeroClases);
			this.fechaInicioControl.setValue(moment(detalle.fechaInicio));
			this.fechaFinControl.setValue(moment(detalle.fechaFin));
	
			this.numeroClasesAnterior = detalle.numeroClases;
			this.fechaInicioAnterior = detalle.fechaInicio;
			this.fechaFinAnterior = detalle.fechaFin;
	
			this.comentariosDefault = detalle.comentarios;
		}else{
			this.idTmp = null;
		}
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
		while(clasesRestantes > 0){
			if(paModalidad.diasSemanaActivos[fecha.day()]){
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
		while(Number(fecha) <= Number(fechaFin)){
			if(paModalidad.diasSemanaActivos[fecha.day()]){
				numeroClases++;
			}
			fecha.add(1,'day');
		}
		this.numeroClasesControl.setValue(numeroClases);
	}

}