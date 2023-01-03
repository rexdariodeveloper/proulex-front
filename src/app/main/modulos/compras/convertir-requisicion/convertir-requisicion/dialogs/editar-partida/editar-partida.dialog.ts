import { Component, ElementRef, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { RequisicionPartidaConvertirListadoProjection } from '@app/main/modelos/requisicion-partida';
import { ProveedorComboProjection } from '@app/main/modelos/proveedor';
import { ConvertirRequisicionService } from '../../convertir-requisicion.service';
import { MatTableDataSource } from '@angular/material/table';

const MAX_28: number = 9999999999999999999999999999.99;

export interface EditarPartidaConvertirDialogData {
	partida: RequisicionPartidaConvertirListadoProjection;
	unidadesMedida: UnidadMedidaComboProjection[];
	proveedores: ProveedorComboProjection[];
	onAceptar: (partida: RequisicionPartidaConvertirListadoProjection) => void;
}

@Component({
	selector: 'editar-partida-dialog',
	templateUrl: 'editar-partida.dialog.html',
	styleUrls: ['editar-partida.dialog.scss'],
	host: {
		class: 'header-bg'
	},
	encapsulation: ViewEncapsulation.None
})
export class EditarPartidaConvertirDialogComponent {

	partida: RequisicionPartidaConvertirListadoProjection;
	unidadesMedida: UnidadMedidaComboProjection[];
	proveedores: ProveedorComboProjection[];

	form: FormGroup;

	ivaControl: FormControl = new FormControl();
	ivaExentoControl: FormControl = new FormControl();
	
	iepsControl: FormControl = new FormControl();
	iepsCuotaFijaControl: FormControl = new FormControl();
	iepsCuotaFijaCheckControl: FormControl = new FormControl();

	cargandoUltimasCompras: boolean = true;
	dataSourceHistorialCompras: MatTableDataSource<ArticuloUltimasComprasProjection> = new MatTableDataSource([]);
	displayedColumnsHistorialCompras: string[] = [
		'fecha',
		'ordenCompra',
		'precioUnitario'
	];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < EditarPartidaConvertirDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: EditarPartidaConvertirDialogData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private el: ElementRef,
		private _convertirRequisicionService: ConvertirRequisicionService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this.form = this.createForm();
		this.form.enable();

		this._convertirRequisicionService.onUltimasComprasEditarChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(ultimasCompras => {
				this.cargandoUltimasCompras = false;
				if(ultimasCompras){
					this._convertirRequisicionService.onUltimasComprasEditarChanged.next(null);
					this.dataSourceHistorialCompras.data = ultimasCompras;
				}
			});
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: EditarPartidaConvertirDialogData) {
		this.partida = data.partida;
		this.unidadesMedida = data.unidadesMedida;
		this.proveedores = data.proveedores;
		this._convertirRequisicionService.getUltimasCompras(this.partida.articulo.id,false);
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();
			registroActualizar.ieps = this.iepsControl?.value || null;
			registroActualizar.iepsCuotaFija = this.iepsCuotaFijaControl?.value || null;

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

		// Inicializar FormControls
		let iva: number = this.partida.iva || this.partida.articulo.iva || null;
		let ivaExento: boolean = this.partida.ivaExento || this.partida.articulo.ivaExento || false;
		let ieps: number = this.partida.ieps || this.partida.articulo.ieps || null;
		let iepsCuotaFija: number = this.partida.iepsCuotaFija || this.partida.articulo.iepsCuotaFija || null;

		this.ivaControl = new FormControl(iva, [Validators.max(100),Validators.min(0)]);
		this.ivaExentoControl = new FormControl(ivaExento, []);
		this.iepsCuotaFijaCheckControl = new FormControl(!!iepsCuotaFija, []);
		if(!!iepsCuotaFija){
			this.iepsControl = new FormControl(ieps, []);
			this.iepsCuotaFijaControl = new FormControl(iepsCuotaFija, [Validators.max(MAX_28), Validators.min(0)]);
		}else{
			this.iepsControl = new FormControl(ieps, [Validators.max(100), Validators.min(0)]);
			this.iepsCuotaFijaControl = new FormControl(iepsCuotaFija, []);
		}

		// FormControls => valueChanges
		this.ivaExentoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.ivaExentoControl.value){
				this.ivaControl.setValue('0');
			}
		});
		this.iepsCuotaFijaCheckControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.iepsCuotaFijaCheckControl.value){
				this.iepsControl = new FormControl(ieps, []);
				this.iepsCuotaFijaControl = new FormControl(iepsCuotaFija, [Validators.max(MAX_28), Validators.min(0)]);
			}else{
				this.iepsControl = new FormControl(ieps, [Validators.max(100), Validators.min(0)]);
				this.iepsCuotaFijaControl = new FormControl(iepsCuotaFija, []);
			}
		});

		let validatorsDescuento: any[] = [Validators.required, Validators.min(0),Validators.max((this.partida?.precio || 0) * (this.partida?.cantidadRequerida || 0))];

		let form = this._formBuilder.group({
			id: [this.partida?.id || null],
			unidadMedida: new FormControl(this.partida.unidadMedida,[Validators.required]),
			cantidadRequerida: new FormControl(this.partida?.cantidadRequerida || null, [Validators.required, Validators.min(0.000001), Validators.max(this.partida.cantidadRequerida)]),
			precio: new FormControl(this.partida.precio || null, [Validators.required, Validators.min(0)]),
			iva: this.ivaControl,
			ivaExento: this.ivaExentoControl,
			ieps: this.iepsControl,
			iepsCuotaFija: this.iepsCuotaFijaControl,
			descuento: new FormControl(this.partida?.descuento || 0, validatorsDescuento),
			proveedor: new FormControl(this.partida.proveedor,[Validators.required]),
			cuentaCompras: new FormControl(this.partida.cuentaCompras,[Validators.maxLength(18)]),
			comentariosCompras: new FormControl(this.partida.comentariosCompras,[Validators.maxLength(255)])
		});

		if(!form.controls['precio'].value){
			form.controls['precio'].setValue(this.partida.articulo.costoUltimo);
		}

		form.controls['precio'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			let validatorsDescuento: any[] = [Validators.required, Validators.min(0)];
			validatorsDescuento.push(Validators.max((form.controls['precio']?.value || 0) * (form.controls['cantidadRequerida']?.value || 0)));
			form.controls['descuento'].setValidators(validatorsDescuento);
			form.controls['descuento'].updateValueAndValidity();
		});
		form.controls['cantidadRequerida'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			let validatorsDescuento: any[] = [Validators.required, Validators.min(0)];
			validatorsDescuento.push(Validators.max((form.controls['precio']?.value || 0) * (form.controls['cantidadRequerida']?.value || 0)));
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

}