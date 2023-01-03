import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { FormGroup, FormBuilder, AbstractControl, FormControl, Validators } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { OrdenCompraDetalleEditarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ArticuloComboListaPreciosProjection, ArticuloPrecargarProjection, ArticuloUltimasComprasProjection } from '@app/main/modelos/articulo';
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
import { MatTableDataSource } from '@angular/material/table';
import { ClienteRemisionDetalleEditarProjection } from '@app/main/modelos/cliente-remision-detalle';
import { RemisionService } from '../../remision.service';

const MAX_28: number = 9999999999999999999999999999.99;

export interface ClienteRemisionDetalleDialogData {
	esNuevo: boolean;
	detalle: ClienteRemisionDetalleEditarProjection;
	articulos: ArticuloComboListaPreciosProjection[];
	articulosOmitirIds: number[];
	almacenOrigenId: number;
	onAceptar: (registro: any) => void;
}

@Component({
	selector: 'detalle-dialog',
	templateUrl: 'detalle.dialog.html',
})
export class ClienteRemisionDetalleDialogComponent {

	esNuevo: boolean;
	detalle: ClienteRemisionDetalleEditarProjection;

	form: FormGroup;
	
	articuloControl: FormControl = new FormControl();
	articulos: ArticuloComboListaPreciosProjection[];
	existenciaControl: FormControl = new FormControl();

	articulosOmitirIds: number[] = [];

	almacenOrigenId: number;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ClienteRemisionDetalleDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ClienteRemisionDetalleDialogData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private el: ElementRef,
		private _remisionService: RemisionService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this.form = this.createForm();
		this.form.enable();

		this._remisionService.onExistenciaChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(existencia => {
			if(existencia != null){
				this.existenciaControl.setValue(existencia || 0);
			}
			this.articuloControl.setValidators([Validators.required,Validators.max(existencia || 0)]);
		})
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: ClienteRemisionDetalleDialogData) {
		this.articulosOmitirIds = data.articulosOmitirIds;
		this.esNuevo = data.esNuevo;
		this.detalle = data.detalle;
		this.articulos = data.articulos.filter(articulo => {
			return !this.articulosOmitirIds.includes(articulo.id) || articulo.id == this.detalle?.articulo?.id;
		});
		this.almacenOrigenId = data.almacenOrigenId;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();
			if(this.detalle){
				registroActualizar.id = this.detalle.id;
			}
			this.data.onAceptar(registroActualizar);
			this.dialogRef.close();
		} else {
			this.form.markAllAsTouched();
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
		
		
		this.articuloControl = new FormControl(this.detalle?.articulo || null, [Validators.required]);
		this.existenciaControl = new FormControl(0, []);

		this.articuloControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			if(!!value?.id && !!this.almacenOrigenId){
				this._remisionService.getExistenciasArticulo(value.id,this.almacenOrigenId);
			}
		});

		let form = this._formBuilder.group({
			id: [this.detalle?.id || null],
			articulo: this.articuloControl,
			cantidad: new FormControl(this.detalle?.cantidad || null, [Validators.required, Validators.min(0.000001)])
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