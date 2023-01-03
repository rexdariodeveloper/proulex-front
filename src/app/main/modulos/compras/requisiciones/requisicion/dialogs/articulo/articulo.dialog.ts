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
import { ArticulosService } from '../../articulos.service';
import { ArticulosTipos } from '@app/main/modelos/mapeos/articulos-tipos';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { RequisicionPartidaEditarProjection } from '@app/main/modelos/requisicion-partida';
import * as moment from 'moment';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';

const MAX_28: number = 9999999999999999999999999999.99;

export interface ArticuloDialogData {
	esNuevo: boolean;
	articulo: RequisicionPartidaEditarProjection;
	articulos: ArticuloComboProjection[];
	articulosMiscelaneos: ArticuloComboProjection[];
	unidadesMedida: UnidadMedidaComboProjection[];
	onAceptar: (registro: any) => void;
}

@Component({
	selector: 'articulo-dialog',
	templateUrl: 'articulo.dialog.html',
})
export class ArticuloDialogComponent {

	@ViewChild('camposDinamicos') camposDinamicos: PixvsDynamicComponent;

	apiUrl: string = environment.apiUrl;

	esNuevo: boolean;
	articulo: RequisicionPartidaEditarProjection;

	form: FormGroup;

	miscCheckControl: FormControl = new FormControl();
	
	articuloControl: FormControl = new FormControl();
	articuloMiscControl: FormControl = new FormControl();
	articulos: ArticuloComboProjection[];
	articulosMiscelaneos: ArticuloComboProjection[];
	
	@ViewChild('unidadMedidaSelect') unidadMedidaSelect: PixvsMatSelectComponent;
	unidadMedidaControl: FormControl = new FormControl();
	unidadesMedida: UnidadMedidaComboProjection[];
	unidadesMedidaArticulo: UnidadMedidaComboProjection[] = [];
	
	camposNuevoRegistro: FieldConfig[] = [];

	bsNuevoArticulo: BehaviorSubject<ArticuloComboProjection> = new BehaviorSubject(null);
	bsMiscelaneoGuardado: BehaviorSubject<ArticuloComboProjection> = new BehaviorSubject(null);

	imageChangedEvent: any = '';
	croppedImage: any = '';

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ArticuloDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ArticuloDialogData,
		public validatorService: ValidatorService,
		public _articulosService: ArticulosService,
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

		this._articulosService.onGuardarMiscChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(articuloId => {
			if(articuloId){
				this._articulosService.onGuardarMiscChanged.next(null);
				let articulo: ArticuloComboProjection = {
					id: articuloId,
					nombreArticulo: this.miscelaneoNuevo.nombreArticulo,
					tipoArticuloId: ArticulosTipos.MISCELANEO
				};
				this.miscelaneoNuevo = null;
				this.bsMiscelaneoGuardado.next(articulo);
				this._articulosService.getListadoUM(articuloId);
			}
		});
		this._articulosService.onListadoUMChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(unidadesMedida => {
			if(unidadesMedida?.length){
				this._articulosService.onListadoUMChanged.next(null);
				this.unidadesMedidaArticulo = unidadesMedida;
				this.unidadMedidaSelect.setDatos(this.unidadesMedidaArticulo);
			}
		});
		this._articulosService.onArticuloPrecargarChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(articuloPrecargar => {
			this.precargarArticulo(articuloPrecargar);
		});
	}

	ngOnDestroy(): void {
		this._articulosService.onArticuloPrecargarChanged.next(null);
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: ArticuloDialogData) {
		this.esNuevo = data.esNuevo;
		this.articulo = data.articulo;
		this.articulos = data.articulos;
		this.articulosMiscelaneos = data.articulosMiscelaneos;
		this.unidadesMedida = data.unidadesMedida;

		this.camposNuevoRegistro = [{
			type: 'input',
			label: 'Nombre',
			inputType: 'text',
			name: 'nombreArticulo',
			validations: [
				{name: 'required', validator: Validators.required, message: 'Nombre requerido'}
			]
		},{
			type: 'pixvsMatSelect',
			label: 'Unidad de medida',
			name: 'unidadMedidaInventario',
			formControl: new FormControl(null,[Validators.required]),
			validations: [],
			multiple: false,
			selectAll: false,
			list: this.unidadesMedida,
			campoValor: 'nombre'
		}];

		if(this.articulo?.img64){
			this.croppedImage = this.articulo.img64;
		}
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			if (this.croppedImage) {
				this.form.get('img64').setValue(this.croppedImage);
			}
			let registroActualizar = this.form.getRawValue();
			if(this.articulo){
				registroActualizar.id = this.articulo.id;
			}
			this.data.onAceptar(registroActualizar);
			this.dialogRef.close();
		} else {
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
		if(this.articulo?.articulo?.tipoArticuloId == ArticulosTipos.MISCELANEO){
			this.miscCheckControl = new FormControl(true, []);
			this.articuloControl = new FormControl(null, []);
			this.articuloMiscControl = new FormControl(this.articulo?.articulo || null, [Validators.required]);
		}else{
			this.miscCheckControl = new FormControl(false, []);
			this.articuloControl = new FormControl(this.articulo?.articulo || null, [Validators.required]);
			this.articuloMiscControl = new FormControl(null, []);
		}
		this.unidadMedidaControl = new FormControl(this.articulo?.unidadMedida || null, [Validators.required]);

		this.articuloControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.articuloControl.value){
				this._articulosService.getArticuloPrecargar(this.articuloControl.value.id);
			}else{
				this.precargarArticulo(null);
			}
		});
		this.articuloMiscControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.articuloMiscControl.value){
				this._articulosService.getArticuloPrecargar(this.articuloMiscControl.value.id);
			}else{
				this.precargarArticulo(null);
			}
		})

		this.miscCheckControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.miscCheckControl.value){
				this.articuloControl.setValue(null);
				this.articuloControl.setValidators([]);
				this.articuloControl.updateValueAndValidity();

				this.articuloMiscControl.setValue(this.articulo?.articulo || null);
				this.articuloMiscControl.setValidators([Validators.required]);
				this.articuloMiscControl.updateValueAndValidity();

				this.form.setControl("articulo",this.articuloMiscControl);
			}else{
				this.articuloControl.setValue(this.articulo?.articulo || null);
				this.articuloControl.setValidators([Validators.required]);
				this.articuloControl.updateValueAndValidity();

				this.articuloMiscControl.setValue(null);
				this.articuloMiscControl.setValidators([]);
				this.articuloMiscControl.updateValueAndValidity();
				this.form.setControl("articulo",this.articuloControl);
			}
		});

		let form = this._formBuilder.group({
			id: [this.articulo?.id || null],
			articulo: this.miscCheckControl.value ? this.articuloMiscControl : this.articuloControl,
			unidadMedida: this.unidadMedidaControl,
			cantidadRequerida: new FormControl(this.articulo?.cantidadRequerida || null, [Validators.required, Validators.min(0.000001)]),
			img64: new FormControl(),
			comentarios: new FormControl(this.articulo?.comentarios || null, [Validators.maxLength(255)]),
			fechaRequerida: new FormControl(!!this.articulo?.fechaRequerida ? moment(this.articulo.fechaRequerida) : null, [Validators.required])
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

	private miscelaneoNuevo: ArticuloComboProjection = null;
	onNuevoMiscelaneo(registro: ArticuloComboProjection){
		this.miscelaneoNuevo = registro;
		this._articulosService.guardarMiscelaneo(registro);
	}

	precargarArticulo(articuloPrecargar: ArticuloPrecargarProjection){
		if(articuloPrecargar){
			this.unidadesMedida = [
				articuloPrecargar.unidadMedidaInventario
			];
			if(articuloPrecargar.unidadMedidaConversionCompras){
				this.unidadesMedida = [...this.unidadesMedida,articuloPrecargar.unidadMedidaConversionCompras]
			}
		}else{
			this.unidadesMedida = [];
		}
		if(this.unidadMedidaSelect){
			this.unidadMedidaSelect.setDatos(this.unidadesMedida);
		}
		if(!this.unidadMedidaControl.value && this.unidadesMedida.length == 1){
			this.unidadMedidaControl.setValue(this.unidadesMedida[0]);
		}else if(!this.unidadMedidaControl.value){
			this.unidadMedidaControl.setValue(null);
		}
	}

	imageCropped(event: ImageCroppedEvent) {
		this.croppedImage = event.base64;
	}

	fileChangeEvent(event: any): void {
		this.imageChangedEvent = event;
	}

}