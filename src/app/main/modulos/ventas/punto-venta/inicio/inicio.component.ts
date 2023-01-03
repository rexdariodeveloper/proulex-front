import { Component, ElementRef, ViewEncapsulation } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { ValidatorService } from "@services/validators.service";
import { PuntoVentaInicioService } from "./inicio.service";
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as en } from './i18n/en';
import { locale as es } from './i18n/es';
import { SucursalComboProjection } from "@app/main/modelos/sucursal";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { JsonResponse } from "@models/json-response";
import { SucursalPlantelComboProjection } from "@app/main/modelos/sucursal-plantel";

@Component({
    selector: 'punto-venta-inicio',
    templateUrl: './inicio.component.html',
    styleUrls: ['./inicio.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PuntoVentaInicioComponent {

    // Propiedades de configuración de la ficha
    private rutaPuntoVentaAbierto = '/app/ventas/punto-venta/abierto';

    // Propiedades de formulario principal
    form: FormGroup;
	sucursalControl: FormControl = new FormControl();
	plantelControl: FormControl = new FormControl();

    // Listados
    sucursales: SucursalComboProjection[] = [];
    planteles: SucursalPlantelComboProjection[] = [];

    // Private
	private _unsubscribeAll: Subject<any>;

    constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _formBuilder: FormBuilder,
		private router: Router,
		private _matSnackBar: MatSnackBar,
		public _puntoVentaInicioService: PuntoVentaInicioService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(en, es);

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		// Subscribe to update datos on changes
		this._puntoVentaInicioService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

                if(datos.turnoAbierto){
					this._puntoVentaInicioService.setSucursalPuntoVentaId(datos.sucursalTurnoId);
					this._puntoVentaInicioService.setPlantelPuntoVentaId(datos.plantelTurnoId);
                    this.router.navigate([this.rutaPuntoVentaAbierto]);
                }else{
                    // Inicializar listados
                    this.sucursales = datos.sucursales;
    
                    // Inicializar form
                    this.form = this.createInicioForm();
                }

			});

		// Subscribe to update planteles on changes
		this._puntoVentaInicioService.onPlantelesChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

                if(datos){
					this.planteles = datos.planteles;
					if(datos.planteles.length > 1){
						this.plantelControl.setValidators([Validators.required]);
					}else{
						this.plantelControl.clearValidators();
					}
					this.plantelControl.updateValueAndValidity();
                }

			});

	}

	createInicioForm(): FormGroup {

		// Inicializar FormControls
		this.sucursalControl = new FormControl(null,[Validators.required]);
		
		this.sucursalControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(sucursal => {
			if(!!sucursal?.id){
				this._puntoVentaInicioService.getPlanteles(sucursal.id);
			}else{
				this.planteles = [];
				this.plantelControl.clearValidators();
				this.plantelControl.updateValueAndValidity();
			}
		});
		
		// Inicializar Form
		let form = this._formBuilder.group({
			sucursal: this.sucursalControl,
			plantel: this.plantelControl
		});

		return form;
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	isRequired(campo: string, form: FormGroup = this.form) {

		let form_field = form.get(campo);
		if (!form_field.validator) {
			return false;
		}

		let validator = form_field.validator({} as AbstractControl);
		return !!(validator && validator.required);

	}

    abrirTurno() {
		if (this.form.valid) {
			this._puntoVentaInicioService.cargando = true;
			this.form.disable({emitEvent: false});

			let formRaw = this.form.getRawValue();
            let body = {
                sucursalId: formRaw.sucursal.id,
                plantelId: this.planteles.length == 1 ? this.planteles[0].id : (!this.planteles.length ? null : formRaw.plantel.id)
            };

			this._puntoVentaInicioService.guardar(JSON.stringify(body), `/api/v1/punto-venta/turno/abrir`).then(
				((result: JsonResponse) => {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
                        this._puntoVentaInicioService.setSucursalPuntoVentaId(formRaw.sucursal.id);
                        this._puntoVentaInicioService.setPlantelPuntoVentaId(body.plantelId);
						this.router.navigate([this.rutaPuntoVentaAbierto]);
					} else {
						this._puntoVentaInicioService.cargando = false;
						this.form.enable();
					}
				}).bind(this)
			);
		} else {
			for (const key of Object.keys(this.form.controls)) {
				this.form.controls[key].markAsTouched();
			}
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

			this._puntoVentaInicioService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});
		}

	}

}