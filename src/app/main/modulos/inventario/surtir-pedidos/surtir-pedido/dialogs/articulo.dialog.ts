import { Component, Inject, ViewChild } from '@angular/core';
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
import { locale as english } from '../../i18n/en';
import { locale as spanish } from '../../i18n/es';
import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { ControlesMaestrosMultiples } from '@models/mapeos/controles-maestros-multiples';
import { SurtirPedidoService } from '../surtir-pedido.service';
import { ArticulosSubtipos } from '@app/main/modelos/mapeos/articulos-subtipos';
import { ArticuloArbolComponentesProjection } from '@app/main/modelos/articulo';
import { ValidatorService } from '@services/validators.service';

export interface ArticuloDialogData {
	esNuevo: boolean;
	articulo: any;
	articuloControl: FormControl;
	localidadControl: FormControl;
	onAceptar: (registro: any) => void;
	localidadId: number;
	origen: any;
	articulos: any[];
	localidades: any[];
	existencias: any[];
	existenciasPaquetes: any[];
	temporada: any[];
}

@Component({
	selector: 'articulo-dialog',
	templateUrl: 'articulo.dialog.html',
})
export class ArticuloDialogComponent {

	ArticulosSubtipos = ArticulosSubtipos;

	esNuevo: boolean;
	articulo: any;
	articuloControl: FormControl;
	localidadControl: FormControl;
	localidadId: number;
	_unsubscribeAll: Subject<any>;
	articulos: any[];
	existencias: any[];
	existenciasPaquetes: any[];
	temporadas: any[];
	localidades: any[];
	origen: any;

	cargandoComponentes: boolean = false;
	articuloArbolComponentes: ArticuloArbolComponentesProjection = null;

	form: FormGroup;

	constructor(
		public dialogRef: MatDialogRef<ArticuloDialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _surtirPedidoService: SurtirPedidoService,
		@Inject(MAT_DIALOG_DATA) public data: ArticuloDialogData,
		private _formBuilder: FormBuilder,
		public validatorService: ValidatorService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		// Set the private defaults
		this._unsubscribeAll = new Subject();

		this.setData(data);
	}

	ngOnInit(){
		this._surtirPedidoService.onArticulosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
			if(data){
				this.existencias = data.existencia;
				this.temporadas = data.temporada;
				
				if(this.form?.controls?.existencia){
					this.form.controls.existencia.setValue(this.getExistencia(this.articulo.articuloId));
					let surtir = this.form.controls.requerida.value > this.form.controls.existencia.value ? this.form.controls.existencia.value : this.form.controls.requerida.value;
					this.form.controls.surtir.setValue(surtir);
				}
					
			}
		});
	}

	ngOnDestroy(){
		this._surtirPedidoService.onArticuloArbolComponentesChanged.next(null);
		// Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
	}

	setData(data: ArticuloDialogData) {
		this.esNuevo = data.esNuevo;
		this.articulo = data.articulo;
		this.articuloControl = new FormControl(null, [Validators.required]);
		this.localidadControl = data.localidadControl;
		this.localidadId = data.localidadId;
		this.articulos = data.articulos;
		this.existencias = data.existencias;
		this.existenciasPaquetes = data.existenciasPaquetes;
		this.temporadas = data.temporada;
		this.localidades = data.localidades;
		this.origen = data.origen;

		this.articuloControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			if(this.articuloControl.value?.articuloSubtipoId == ArticulosSubtipos.PAQUETE_DE_LIBROS){
				this.cargandoComponentes = true;
				this._surtirPedidoService.getArticuloArbolComponentes(this.articuloControl.value.id);
			}
		});

		this._surtirPedidoService.onArticuloArbolComponentesChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(articulo => {
			this.cargandoComponentes = false;
			this.articuloArbolComponentes = articulo;
			if(this.articuloArbolComponentes){
				this.setExistenciaArbol(this.articuloArbolComponentes);
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

			this.form.controls.localidad.setValue(this.origen);

			this.form.controls.articulo.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {

				let id = this.form.controls.articulo.value? this.form.controls.articulo.value.id : null;

			});

			this.form.controls.localidad.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				if(data?.id)
					this._surtirPedidoService.getArticulos('/api/v1/pedidos/products/',data.id+'/localidad');
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
			let existencia: number = this.existenciasPaquetes[id] || this.existencias.filter( exs => exs.articuloId == id)[0]?.existencia;
			let temporada: any = this.temporadas.filter( temporada => temporada.articuloId == id)[0];
			
			registroActualizar.articuloId = id;
			registroActualizar.unidadMedidaId = registroActualizar.articulo.unidadMedidaInventario.id;
			registroActualizar.unidadMedida = registroActualizar.articulo.unidadMedidaInventario.nombre;
			registroActualizar.minimo = Number(temporada?.minimo);
			registroActualizar.maximo = Number(temporada?.maximo);
			registroActualizar.existencia = Number(existencia);
			registroActualizar.cantidad = Number(registroActualizar.cantidad);
			registroActualizar.surtir = registroActualizar.surtir > registroActualizar.requerida? registroActualizar.requerida : registroActualizar.surtir;
			
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

	getExistencia(articuloId): Number {
		let existencia: number = this.existencias.filter( exs => exs.articuloId == articuloId)[0]?.existencia;
		return Number(existencia);
	}

	createForm(): FormGroup {
		let maxSurtir: number = this.articulo.requerida - this.articulo.enviada;
		if(this.articulo.existencia < maxSurtir){
			maxSurtir = this.articulo.existencia;
		}

		let form = this._formBuilder.group({
			id: [this.articulo?.id || null],
			articulo: this.articuloControl,
			localidad: this.localidadControl,
			existencia: new FormControl(this.articulo?.existencia || null, []),
			requerida: new FormControl(null, [Validators.required]),
			surtir: new FormControl(this.articulo?.surtir || null, [Validators.required, Validators.max(maxSurtir)]),
			comentario: new FormControl(null, [Validators.maxLength(149)])
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