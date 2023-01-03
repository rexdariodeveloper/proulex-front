import { Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from '../../../i18n/en';
import { locale as spanish } from '../../../i18n/es';
import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { ControlesMaestrosMultiples } from '@models/mapeos/controles-maestros-multiples';
import { ValidatorService } from '@services/validators.service';
import { PedidoService } from '../../pedido.service';
import { ArticulosSubtipos } from '@app/main/modelos/mapeos/articulos-subtipos';
import { ArticuloArbolComponentesProjection } from '@app/main/modelos/articulo';

export interface ArticuloDialogData {
	esNuevo: boolean;
	articulo: any;
	articuloControl: FormControl;
	onAceptar: (registro: any) => void;
	localidadId: number;
	articulos: any[];
	existencias: any[];
	existenciasPaquetes: any[];
	temporada: any[];
}

@Component({
	selector: 'articulo-dialog',
	styleUrls: ['./articulo.dialog.scss'],
	templateUrl: 'articulo.dialog.html',
	encapsulation: ViewEncapsulation.None
})
export class ArticuloDialogComponent {

	ArticulosSubtipos = ArticulosSubtipos;

	esNuevo: boolean;
	articulo: any;
	camposListado: FieldConfig[];
	localidadId: number;
	_unsubscribeAll: Subject<any>;
	articulos: any[];
	existencias: any[];
	existenciasPaquetes: any[];
	temporadas: any[];

	articuloControl: FormControl;

	articuloArbolComponentes: ArticuloArbolComponentesProjection = null;

	form: FormGroup;

	cargandoComponentes: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<ArticuloDialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _formBuilder: FormBuilder,
		private translate: TranslateService,
		@Inject(MAT_DIALOG_DATA) public data: ArticuloDialogData,
		public validatorService: ValidatorService,
		private _pedidoService: PedidoService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		// Set the private defaults
		this._unsubscribeAll = new Subject();

		this.setData(data);
	}

	ngOnDestroy(){
		this._pedidoService.onArticuloArbolComponentesChanged.next(null);
		// Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
	}

	setData(data: ArticuloDialogData) {
		this.esNuevo = data.esNuevo;
		this.articulo = data.articulo;
		this.articuloControl = new FormControl(null, [Validators.required]);
		this.localidadId = data.localidadId;
		this.articulos = data.articulos;
		this.existencias = data.existencias;
		this.existenciasPaquetes = data.existenciasPaquetes;
		this.temporadas = data.temporada;

		this.articuloControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			if(this.articuloControl.value?.articuloSubtipoId == ArticulosSubtipos.PAQUETE_DE_LIBROS){
				this.cargandoComponentes = true;
				this._pedidoService.getArticuloArbolComponentes(this.articuloControl.value.id);
			}
		});

		this._pedidoService.onArticuloArbolComponentesChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(articulo => {
			this.cargandoComponentes = false;
			this.articuloArbolComponentes = articulo;
			if(this.articuloArbolComponentes){
				this.setExistenciaArbol(this.articuloArbolComponentes);
				this.form.controls.existencia.setValue(this.articuloArbolComponentes.existencia);
			}
		});

		setTimeout(() => {
			this.form = this.createForm();
			this.form.enable();
			if (this.articulo) {
				for (let campoRegistro in this.articulo) {
					if (!!this.form.controls[campoRegistro]) {
						this.form.controls[campoRegistro].setValue(this.articulo[campoRegistro]);
						// this.form.controls[campoRegistro].updateValueAndValidity();
					}
				}
			} else {
				for (let campoRegistro in this.form.controls) {
					this.form.controls[campoRegistro].setValue(null);
					this.form.controls[campoRegistro].markAsUntouched();
					this.form.controls[campoRegistro].updateValueAndValidity();
				}
			}

			this.form.controls.articulo.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {

				let id = this.form.controls.articulo.value? this.form.controls.articulo.value.id : null;
				if(!!id){
					let existencia: number = this.existencias.filter( exs => exs.articuloId == id)[0]?.existencia;
					let temporada: any = this.temporadas.filter( temporada => temporada.articuloId == id)[0];
					this.form.controls.existencia.setValue(existencia);
					if(temporada.minimo > existencia)
						this.form.controls.cantidadPedida.setValue(temporada.minimo - existencia);
				}
			});

			this.form.controls.cantidadPedida.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				if(data && data > 5)

				console.log(data);
			});
		});
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if (this.form.valid) {
			let registroActualizar = this.form.getRawValue();

			let id = registroActualizar.articulo.id;
			let existencia: number = this.existenciasPaquetes[this.articuloArbolComponentes?.id] || this.existencias.filter( exs => exs.articuloId == id)[0]?.existencia;
			let temporada: any = this.temporadas.filter( temporada => temporada.articuloId == id)[0];
			
			registroActualizar.articuloId = id;
			registroActualizar.unidadMedidaId = registroActualizar.articulo.unidadMedidaInventario.id;
			registroActualizar.unidadMedida = registroActualizar.articulo.unidadMedidaInventario.nombre;
			registroActualizar.minimo = Number(temporada?.minimo);
			registroActualizar.maximo = Number(temporada?.maximo);
			registroActualizar.existencia = Number(existencia);
			registroActualizar.cantidadPedida = Number(registroActualizar.cantidadPedida);
			
			if (this.articulo) {
				registroActualizar.id = this.articulo.id;
			} else {
				registroActualizar.estatusId = ControlesMaestrosMultiples.CMM_Estatus.ACTIVO;
			}
			this.data.onAceptar(registroActualizar);
			this.dialogRef.close();
		} else {
			Object.keys(this.form.controls).forEach(field => {
				const control = this.form.get(field);
				control.markAsTouched({ onlySelf: true });
			  });
		}
	}

	createForm(): FormGroup {

		let form = this._formBuilder.group({
			id: [this.articulo?.id || null],
			articulo: this.articuloControl,
			existencia: new FormControl(this.articulo?.existencia || null, []),
			cantidadPedida: new FormControl(this.articulo?.cantidadPedida || null, [Validators.required])
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

	setExistenciaArbol(arbol: ArticuloArbolComponentesProjection){
		arbol.existencia = (this.existenciasPaquetes[arbol.id]) || this.existencias.filter( exs => exs.articuloId == arbol.id)[0]?.existencia || 0;
		for(let componente of arbol.componentes){
			this.setExistenciaArbol(componente.componente);
		}
	}
}