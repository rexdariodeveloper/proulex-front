import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ValidatorService } from '@services/validators.service';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { ImpuestosArticuloSATService } from '@app/main/services/impuestos-articulo-sat.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const MAX_28: number = 9999999999999999999999999999.99;

export interface ConceptoDialogData {
	articulo: any;
	listUnidadMedida: UnidadMedidaComboProjection[];
	listObjetoImpuesto: ControlMaestroMultipleComboSimpleProjection[];

	onAceptar: (registro: any) => void;
}

@Component({
	selector: 'concepto-dialog',
	styleUrls: ['./concepto.dialog.scss'],
	templateUrl: 'concepto.dialog.html',
	encapsulation: ViewEncapsulation.None
})
export class ConceptoDialogComponent {

	_unsubscribeAll: Subject<any>;
	form: FormGroup;

	articulo: any;
	listUnidadMedida: UnidadMedidaComboProjection[];
	listObjetoImpuesto: ControlMaestroMultipleComboSimpleProjection[];

	unidadMedidaControl: FormControl = new FormControl();
	objetoImpuestoControl: FormControl = new FormControl();

	ivaControl: FormControl = new FormControl();
	ivaExentoControl: FormControl = new FormControl();

	iepsControl: FormControl = new FormControl();
	iepsCuotaFijaControl: FormControl = new FormControl();
	iepsCuotaFijaCheckControl: FormControl = new FormControl();

	constructor(
		public dialogRef: MatDialogRef<ConceptoDialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _formBuilder: FormBuilder,
		public validatorService: ValidatorService,
		public _impuestosService: ImpuestosArticuloSATService,
		private _matSnackBar: MatSnackBar,
		@Inject(MAT_DIALOG_DATA) public data: ConceptoDialogData,
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		// Set the private defaults
		this._unsubscribeAll = new Subject();

		this.setData(data);
	}

	ngOnDestroy() {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	setData(data: ConceptoDialogData) {
		this.articulo = data.articulo;
		this.listUnidadMedida = data.listUnidadMedida;
		this.listObjetoImpuesto = data.listObjetoImpuesto;

		setTimeout(() => {
			this.form = this.createForm();
			this.form.enable();

			if (this.articulo) {
				for (let campoRegistro in this.articulo) {
					if (!!this.form.controls[campoRegistro]) {
						this.form.controls[campoRegistro].setValue(this.articulo[campoRegistro]);
					}
				}
			} else {
				for (let campoRegistro in this.form.controls) {
					this.form.controls[campoRegistro].setValue(null);
					this.form.controls[campoRegistro].markAsUntouched();
					this.form.controls[campoRegistro].updateValueAndValidity();
				}
			}

			this.unidadMedidaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				this.form.controls.unidadMedidaId.setValue(data?.id || null);
			});

			this.objetoImpuestoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				this.form.controls.objetoImpuestoId.setValue(data?.id || null);
			});

			this.form.controls.cantidad.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				this.calculaTotales();
			});

			this.form.controls.valorUnitario.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				this.calculaTotales();
			});

			this.form.controls.descuento.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				this.calculaTotales();
			});

			this.form.controls.iva.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				this.calculaTotales();
			});

			this.form.controls.ieps.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				this.calculaTotales();
			});

			this.form.controls.iepsCuotaFija.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				this.calculaTotales();
			});

			this.ivaExentoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
				if (this.ivaExentoControl.value) {
					this.ivaControl.setValue('0');
				}

				this.habilitaComponentesImpuestos();
			});

			this.iepsCuotaFijaCheckControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
				if (this.iepsCuotaFijaCheckControl.value) {
					this.iepsControl.setValue(null);
				} else {
					this.iepsCuotaFijaControl.setValue(null);
				}
				
				this.habilitaComponentesImpuestos();
			});

			this.form.controls.importeIVA.disable();
			this.form.controls.importeIEPS.disable();
			this.form.controls.total.disable();

			this.habilitaComponentesImpuestos();
		});
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			if (this.form.controls.total.value <= 0) {
				this._matSnackBar.open('El total del artículo debe ser mayor a 0.', 'OK', { duration: 5000 });

				return;
			}
			
			this.data.onAceptar(this.form.getRawValue());
			this.dialogRef.close();
		} else {
			Object.keys(this.form.controls).forEach(field => {
				const control = this.form.get(field);
				control.markAsTouched({ onlySelf: true });
			});
		}
	}

	createForm(): FormGroup {
		this.unidadMedidaControl = new FormControl(this.articulo?.unidadMedida, [Validators.required]);
		this.objetoImpuestoControl = new FormControl(this.articulo?.objetoImpuesto, [Validators.required]);
		this.ivaControl = new FormControl(this.articulo?.iva, [Validators.min(0), Validators.max(100), Validators.required]);
		this.ivaExentoControl = new FormControl(this.articulo?.ivaExento || false, []);
		this.iepsControl = new FormControl(this.articulo?.ieps || false, []);
		this.iepsCuotaFijaControl = new FormControl(this.articulo?.iepsCuotaFija || false, []);
		this.iepsCuotaFijaCheckControl = new FormControl(!!this.articulo?.iepsCuotaFija, []);

		let form = this._formBuilder.group({
			id: this.articulo?.id || null,
			descripcion: new FormControl(this.articulo?.descripcion || null, [Validators.required]),
			unidadMedidaId: this.unidadMedidaControl.value?.id || null,
			unidadMedida: this.unidadMedidaControl,
			cantidad: new FormControl(this.articulo?.cantidad || null, [Validators.required]),
			valorUnitario: new FormControl(this.articulo?.valorUnitario || null, [Validators.required]),
			subtotal: new FormControl(this.articulo?.subtotal || null, [Validators.required]),
			descuento: new FormControl(this.articulo?.descuento || null, [Validators.required]),
			iva: this.ivaControl,
			importeIVA: new FormControl(this.articulo?.importeIVA || null, [Validators.required]),
			ivaExento: this.ivaExentoControl,
			ieps: this.iepsControl,
			iepsCuotaFija: this.iepsCuotaFijaControl,
			importeIEPS: new FormControl(this.articulo?.importeIEPS || null, [Validators.required]),
			iepsCuotaFijaCheckControl: this.iepsCuotaFijaCheckControl,
			claveProdServ: new FormControl(this.articulo?.claveProdServ || null, [Validators.required]),
			total: new FormControl(this.articulo?.total || null, [Validators.required]),
			objetoImpuestoId: this.objetoImpuestoControl.value?.id || null,
			objetoImpuesto: this.objetoImpuestoControl
		});

		return form;
	}

	calculaTotales() {
		var modelo = this.form.getRawValue();

		var cantidad = modelo.cantidad || 0;
		var valorUnitario = modelo.valorUnitario || 0;
		var descuento = modelo.descuento || 0;

		var iva = modelo.iva || 0;		
		var ieps = modelo.ieps;
		var iepsCuotaFija = modelo.iepsCuotaFija;

		var valores = this._impuestosService.getMontos(cantidad, valorUnitario, (cantidad > 0 && valorUnitario > 0 ? descuento : 0), iva, ieps, iepsCuotaFija);

		this.form.controls.subtotal.setValue(valores.subtotal);
		this.form.controls.importeIVA.setValue(valores.iva);
		this.form.controls.importeIEPS.setValue(valores.ieps);
		this.form.controls.total.setValue(valores.total);
	}

	habilitaComponentesImpuestos() {
		if (this.ivaExentoControl.value) {
			this.form.controls.iva.disable();
		} else {
			this.form.controls.iva.enable();
		}

		// Limpiamos las validaciones
		this.form.controls.ieps.clearValidators();
		this.form.controls.iepsCuotaFija.clearValidators();

		if (this.iepsCuotaFijaCheckControl.value) {
			this.form.controls.iepsCuotaFija.setValidators([Validators.required, Validators.min(0), Validators.max(MAX_28)]);
		} else {
			this.form.controls.ieps.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
		}

		// Actualizamos los datos de las validaciones
		this.form.controls.ieps.updateValueAndValidity();
		this.form.controls.iepsCuotaFija.updateValueAndValidity();

		this.calculaTotales();
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