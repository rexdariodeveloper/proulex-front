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
import { OrdenCompraService } from '../../orden-compra.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { MatTableDataSource } from '@angular/material/table';

const MAX_28: number = 9999999999999999999999999999.99;

export interface ArticuloDialogData {
	esNuevo: boolean;
	articulo: OrdenCompraDetalleEditarProjection;
	articulos: ArticuloComboProjection[];
	articulosMiscelaneos: ArticuloComboProjection[];
	unidadesMedida: UnidadMedidaComboProjection[];
	articulosOmitirIds: number[];
	onAceptar: (registro: any) => void;
}

@Component({
	selector: 'articulo-dialog',
	templateUrl: 'articulo.dialog.html',
})
export class ArticuloDialogComponent {

	@ViewChild('camposDinamicos') camposDinamicos: PixvsDynamicComponent;

	esNuevo: boolean;
	articulo: OrdenCompraDetalleEditarProjection;

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

	ivaControl: FormControl = new FormControl();
	ivaExentoControl: FormControl = new FormControl();
	
	iepsControl: FormControl = new FormControl();
	iepsCuotaFijaControl: FormControl = new FormControl();
	iepsCuotaFijaCheckControl: FormControl = new FormControl();

	camposNuevoRegistro: FieldConfig[] = [];

	bsNuevoArticulo: BehaviorSubject<ArticuloComboProjection> = new BehaviorSubject(null);
	bsMiscelaneoGuardado: BehaviorSubject<ArticuloComboProjection> = new BehaviorSubject(null);

	articulosOmitirIds: number[] = [];

	umDefault: UnidadMedidaComboProjection = null;

	cargandoUltimasCompras: boolean = true;
	dataSourceHistorialCompras: MatTableDataSource<ArticuloUltimasComprasProjection> = new MatTableDataSource([]);
	displayedColumnsHistorialCompras: string[] = [
		'fecha',
		'ordenCompra',
		'precioUnitario'
	];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ArticuloDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ArticuloDialogData,
		public validatorService: ValidatorService,
		public _articulosService: ArticulosService,
		private _ordenCompraService: OrdenCompraService,
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
				let umMap = {};
				this.unidadesMedidaArticulo = unidadesMedida.filter(um => {
					if(umMap[um.id]){
						return false;
					}
					umMap[um.id] = true;
					return true;
				})
				this.unidadMedidaSelect.setDatos(this.unidadesMedidaArticulo);
			}
		});
		this._articulosService.onArticuloPrecargarChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(articuloPrecargar => {
			this.precargarArticulo(articuloPrecargar);
		});
		this._articulosService.onUltimasComprasEditarChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(ultimasCompras => {
				this.cargandoUltimasCompras = false;
				if(ultimasCompras){
					this._articulosService.onUltimasComprasEditarChanged.next(null);
					this.dataSourceHistorialCompras.data = ultimasCompras;
				}
			});
	}

	ngOnDestroy(): void {
		this._articulosService.onArticuloPrecargarChanged.next(null);
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: ArticuloDialogData) {
		this.articulosOmitirIds = data.articulosOmitirIds;
		this.esNuevo = data.esNuevo;
		this.articulo = data.articulo;
		this.articulos = data.articulos.filter(articulo => {
			return !this.articulosOmitirIds.includes(articulo.id) || articulo.id == this.articulo?.articulo?.id;
		});
		this.articulosMiscelaneos = data.articulosMiscelaneos.filter(articulo => {
			return !this.articulosOmitirIds.includes(articulo.id) || articulo.id == this.articulo?.articulo?.id;
		});;
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
		},{
			type: 'input',
			label: 'Precio',
			inputType: 'number',
			name: 'costoUltimo',
			validations: [
				{name: 'required', validator: Validators.required, message: 'Precio requerido'}
			]
		}];
		if(!!this.articulo?.articulo?.id){
			this._articulosService.getUltimasCompras(this.articulo.articulo.id,false);
		}
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();
			registroActualizar.ieps = this.iepsControl?.value || null;
			registroActualizar.iepsCuotaFija = this.iepsCuotaFijaControl?.value || null;
			if(this.articulo){
				registroActualizar.id = this.articulo.id;
			}
			registroActualizar.subtotal = this.getSubtotal(registroActualizar.cantidad,registroActualizar.precio);
			registroActualizar.impuesto = this.getImpuesto(registroActualizar.cantidad,registroActualizar.precio,registroActualizar.descuento,registroActualizar.ivaExento ? 0 : registroActualizar.iva,!!registroActualizar.iepsCuotaFija ? 0 : registroActualizar.ieps,registroActualizar.iepsCuotaFija);
			registroActualizar.ivaTotal = this.getIva(registroActualizar.cantidad,registroActualizar.precio,registroActualizar.descuento,registroActualizar.ivaExento ? 0 : registroActualizar.iva,!!registroActualizar.iepsCuotaFija ? 0 : registroActualizar.ieps,registroActualizar.iepsCuotaFija);
			registroActualizar.iepsTotal = this.getIeps(registroActualizar.cantidad,registroActualizar.precio,registroActualizar.descuento,registroActualizar.ivaExento ? 0 : registroActualizar.iva,!!registroActualizar.iepsCuotaFija ? 0 : registroActualizar.ieps,registroActualizar.iepsCuotaFija);
			registroActualizar.total = this.getTotal(registroActualizar.cantidad,registroActualizar.precio,registroActualizar.descuento,registroActualizar.ivaExento ? 0 : registroActualizar.iva,!!registroActualizar.iepsCuotaFija ? 0 : registroActualizar.ieps,registroActualizar.iepsCuotaFija);
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
		this.umDefault = this.articulo?.unidadMedida || null;
		// if(!!this.articulo?.articulo?.id){
		// 	this._articulosService.getArticuloPrecargar(this.articulo.articulo.id);
		// }

		this.ivaControl = new FormControl(this.articulo?.iva || null, [Validators.max(100),Validators.min(0)]);
		this.ivaExentoControl = new FormControl(this.articulo?.ivaExento || false, []);
		this.iepsCuotaFijaCheckControl = new FormControl(!!this.articulo?.iepsCuotaFija || null, []);
		if(!!this.articulo?.iepsCuotaFija){
			this.iepsControl = new FormControl(this.articulo?.ieps || null, []);
			this.iepsCuotaFijaControl = new FormControl(this.articulo?.iepsCuotaFija || null, [Validators.max(MAX_28), Validators.min(0)]);
		}else{
			this.iepsControl = new FormControl(this.articulo?.ieps || null, [Validators.max(100), Validators.min(0)]);
			this.iepsCuotaFijaControl = new FormControl(this.articulo?.iepsCuotaFija || null, []);
		}

		this.articuloControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.articuloControl.value){
				this.cargandoUltimasCompras = true;
				this._articulosService.getArticuloPrecargar(this.articuloControl.value.id);
				this._articulosService.getUltimasCompras(this.articuloControl.value.id,false);
			}else{
				this.precargarArticulo(null);
			}
		});
		this.articuloMiscControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.articuloMiscControl.value){
				this.cargandoUltimasCompras = true;
				this._articulosService.getArticuloPrecargar(this.articuloMiscControl.value.id);
				this._articulosService.getUltimasCompras(this.articuloControl.value.id,false);
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

		this.ivaExentoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.ivaExentoControl.value){
				this.ivaControl.setValue('0');
			}
		});
		this.iepsCuotaFijaCheckControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.iepsCuotaFijaCheckControl.value){
				this.iepsControl = new FormControl(this.articulo?.ieps || null, []);
				this.iepsCuotaFijaControl = new FormControl(this.articulo?.iepsCuotaFija || null, [Validators.max(MAX_28), Validators.min(0)]);
			}else{
				this.iepsControl = new FormControl(this.articulo?.ieps || null, [Validators.max(100), Validators.min(0)]);
				this.iepsCuotaFijaControl = new FormControl(this.articulo?.iepsCuotaFija || null, []);
			}
		});

		let validatorsDescuento: any[] = [Validators.required, Validators.min(0),Validators.max((this.articulo?.precio || 0) * (this.articulo?.cantidad || 0))];

		let form = this._formBuilder.group({
			id: [this.articulo?.id || null],
			articulo: this.miscCheckControl?.value ? this.articuloMiscControl : this.articuloControl,
			unidadMedida: this.unidadMedidaControl,
			cantidad: new FormControl(this.articulo?.cantidad || null, [Validators.required, Validators.min(0.000001)]),
			precio: new FormControl(this.articulo?.precio || null, [Validators.required, Validators.min(0)]),
			descuento: new FormControl(this.articulo?.descuento || 0, validatorsDescuento),
			iva: this.ivaControl,
			ivaExento: this.ivaExentoControl,
			ieps: this.iepsControl,
			iepsCuotaFija: this.iepsCuotaFijaControl,
			cuentaCompras: new FormControl(this.articulo?.cuentaCompras,[Validators.maxLength(18)]),
			comentarios: new FormControl(this.articulo?.comentarios,[Validators.maxLength(255)])
		});

		form.controls['precio'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			let validatorsDescuento: any[] = [Validators.required, Validators.min(0)];
			validatorsDescuento.push(Validators.max((form.controls['precio']?.value || 0) * (form.controls['cantidad']?.value || 0)));
			form.controls['descuento'].setValidators(validatorsDescuento);
			form.controls['descuento'].updateValueAndValidity();
		});
		form.controls['cantidad'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			let validatorsDescuento: any[] = [Validators.required, Validators.min(0)];
			validatorsDescuento.push(Validators.max((form.controls['precio']?.value || 0) * (form.controls['cantidad']?.value || 0)));
			form.controls['descuento'].setValidators(validatorsDescuento);
			form.controls['descuento'].updateValueAndValidity();
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

	getSubtotal(cantidad: number, precioUnitario: number): number{
		return this._ordenCompraService._impuestosArticuloService.getMontos(cantidad,precioUnitario,null,null,null,null).subtotal;
	}

	getImpuesto(cantidad: number, precioUnitario: number, descuento: number, iva: number, ieps: number, iepsCuotaFija: number): number{
		return this.getIva(cantidad,precioUnitario,descuento,iva,ieps,iepsCuotaFija) + this.getIeps(cantidad,precioUnitario,descuento,iva,ieps,iepsCuotaFija);
	}

	getIva(cantidad: number, precioUnitario: number, descuento: number, iva: number, ieps: number, iepsCuotaFija: number): number{
		return this._ordenCompraService._impuestosArticuloService.getMontos(cantidad,precioUnitario,descuento,iva,ieps,iepsCuotaFija).iva || 0;
	}

	getIeps(cantidad: number, precioUnitario: number, descuento: number, iva: number, ieps: number, iepsCuotaFija: number): number{
		return this._ordenCompraService._impuestosArticuloService.getMontos(cantidad,precioUnitario,descuento,iva,ieps,iepsCuotaFija).ieps || 0;
	}

	getTotal(cantidad: number, precioUnitario: number, descuento: number, iva: number, ieps: number, iepsCuotaFija: number): number{
		return this._ordenCompraService._impuestosArticuloService.getMontos(cantidad,precioUnitario,descuento,iva,ieps,iepsCuotaFija).total || 0;
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
			if(articuloPrecargar.unidadMedidaConversionCompras && articuloPrecargar.unidadMedidaConversionCompras.id != articuloPrecargar.unidadMedidaInventario.id){
				this.unidadesMedida = [...this.unidadesMedida,articuloPrecargar.unidadMedidaConversionCompras]
			}
			if(!this.umDefault){
				switch(articuloPrecargar.tipoCosto?.id){
					case ControlesMaestrosMultiples.CMM_ART_TipoCosto.COSTO_ESTANDAR:
						this.form.controls['precio'].setValue(articuloPrecargar.costoEstandar || 0);
					case ControlesMaestrosMultiples.CMM_ART_TipoCosto.COSTO_PROMEDIO:
						this.form.controls['precio'].setValue(articuloPrecargar.costoPromedio || 0);
					case ControlesMaestrosMultiples.CMM_ART_TipoCosto.ULTIMO_COSTO:
						this.form.controls['precio'].setValue(articuloPrecargar.costoUltimo || 0);
				}
				this.ivaExentoControl.setValue(!!articuloPrecargar.ivaExento);
				if(articuloPrecargar.ivaExento){
					this.ivaControl.setValue(0);
				}else{
					this.ivaControl.setValue(articuloPrecargar.iva || 0);
				}
				this.iepsCuotaFijaCheckControl.setValue(!!articuloPrecargar.iepsCuotaFija);
				if(!!articuloPrecargar.iepsCuotaFija){
					this.iepsControl.setValue(null);
					this.iepsCuotaFijaControl.setValue(articuloPrecargar.iepsCuotaFija || 0);
				}else{
					this.iepsControl.setValue(articuloPrecargar.ieps || 0);
					this.iepsCuotaFijaControl.setValue(null);
				}
			}
		}else{
			this.unidadesMedida = [];
		}
		if(this.unidadMedidaSelect){
			this.unidadMedidaSelect.setDatos(this.unidadesMedida);
		}
		if(!!articuloPrecargar && !!this.umDefault){
			this.unidadMedidaControl.setValue(this.umDefault);
			this.umDefault = null;
		}else if(this.unidadesMedida.length == 1){
			this.unidadMedidaControl.setValue(this.unidadesMedida[0]);
		}else{
			this.unidadMedidaControl.setValue(null);
		}
		let validatorsDescuento: any[] = [Validators.required, Validators.min(0)];
		validatorsDescuento.push(Validators.max((this.form.controls['precio']?.value || 0) * (this.form.controls['cantidad']?.value || 0)));
		this.form.controls['descuento'].setValidators(validatorsDescuento);
		this.form.controls['descuento'].updateValueAndValidity();
	}

}