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
import { locale as english } from '../../i18n/en';
import { locale as spanish } from '../../i18n/es';
import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { ControlesMaestrosMultiples } from '@models/mapeos/controles-maestros-multiples';
import { RecibirPedidoService } from '../recibir-pedido.service';
import { ArticuloArbolComponentesProjection } from '@app/main/modelos/articulo';
import { ArticulosSubtipos } from '@app/main/modelos/mapeos/articulos-subtipos';
import { LocalidadComboProjection } from '@app/main/modelos/localidad';
import { PedidoReciboDetalleLocalidadProjection } from '@app/main/modelos/pedido-recibo-detalle-localidad';
import { ValidatorService } from '@services/validators.service';

export interface ArticuloDialogData {
	esNuevo: boolean;
	articulo: any;
	articuloControl: FormControl;
	localidadControl: FormControl;
	onAceptar: (registro: any) => void;
	articulos: any[];
	localidades: any[];
	existencias: any[];
	existenciasPaquetes: any[];
	temporada: any[];
	localidadesAlmacenOrigen: LocalidadComboProjection[];
	existenciaMapLocalidades: any;
	almacenNombre: string;
}

@Component({
	selector: 'articulo-dialog',
	templateUrl: 'articulo.dialog.html',
	styleUrls: ['./articulo.dialog.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ArticuloDialogComponent {

	ArticulosSubtipos = ArticulosSubtipos;

	esNuevo: boolean;
	articulo: any;
	articuloControl: FormControl;
	localidadControl: FormControl;
	_unsubscribeAll: Subject<any>;
	articulos: any[];
	localidades: any[];
	existencias: any[];
	existenciasPaquetes: any[];
	temporadas: any[];

	cargandoComponentes: boolean = false;
	articuloArbolComponentes: ArticuloArbolComponentesProjection = null;

	localidadesAlmacenOrigen: LocalidadComboProjection[] = [];
	cantidadAsignarControls: {[localidadId:string]: FormControl} = {};
	existenciaMapLocalidades: any = {};

	contActualizar: number = 0;

	form: FormGroup;

	cantidadPendienteAsignarControl: FormControl = new FormControl(null,[Validators.min(0),Validators.max(0)]);
	almacenNombre: string;

	constructor(
		public dialogRef: MatDialogRef<ArticuloDialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _recibirPedidoService: RecibirPedidoService,
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
		this._recibirPedidoService.onArticulosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
			if(data){
				this.existencias = data.existencia;
				this.temporadas = data.temporada;
				
				if(this.form?.controls?.existencia)
					this.form.controls.existencia.setValue(this.getExistencia(this.articulo.articuloId));
			}
		});
	}

	ngOnDestroy(){
		this._recibirPedidoService.onArticuloArbolComponentesChanged.next(null);
		// Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
	}

	setData(data: ArticuloDialogData) {
		this.esNuevo = data.esNuevo;
		this.articulo = data.articulo;
		this.articuloControl = data.articuloControl;
		this.localidadControl = data.localidadControl;
		this.articulos = data.articulos;
		this.localidades = data.localidades;
		this.existenciasPaquetes = data.existenciasPaquetes;
		this.localidadesAlmacenOrigen = data.localidadesAlmacenOrigen;
		this.existenciaMapLocalidades = data.existenciaMapLocalidades;
		this.almacenNombre = data.almacenNombre;

		this.articuloControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			if(this.articuloControl.value?.articuloSubtipoId == ArticulosSubtipos.PAQUETE_DE_LIBROS){
				this.cargandoComponentes = true;
				this._recibirPedidoService.getArticuloArbolComponentes(this.articuloControl.value.id);
			}
		});

		this._recibirPedidoService.onArticuloArbolComponentesChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(articulo => {
			this.cargandoComponentes = false;
			this.articuloArbolComponentes = articulo;
			if(this.articuloArbolComponentes){
				this.setExistenciaArbol(this.articuloArbolComponentes);
				this.form.controls.existencia.setValue(this.articuloArbolComponentes.existencia);
			}
		});

		let localidadesMapCantidades = {};
		if(this.articulo?.localidades?.length){
			this.articulo.localidades.forEach(localidad => {
				localidadesMapCantidades[localidad.localidadId] = localidad.cantidad;
			});
		}
		this.cantidadAsignarControls = {};
		this.localidadesAlmacenOrigen.forEach(localidad => {
			this.cantidadAsignarControls[localidad.id] = new FormControl(localidadesMapCantidades[localidad.id] || null,[Validators.min(0)]);
			this.cantidadAsignarControls[localidad.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
				this.contActualizar++;
				this.setPendientePorAsignar();
			});
		})
		
		setTimeout(() => {
			this.form = this.createForm();
			this.form.enable();
			if (this.articulo) {
				for (let campoRegistro in this.articulo) {
					if (!!this.form.controls[campoRegistro]) {
						this.form.controls[campoRegistro].setValue(this.articulo[campoRegistro]);
						this.form.controls[campoRegistro].updateValueAndValidity();
					}
				}
				this.form.controls['existencia'].setValue(this.getExistencia(this.articulo.id));
			} else {
				for (let campoRegistro in this.form.controls) {
					this.form.controls[campoRegistro].setValue(null);
					this.form.controls[campoRegistro].markAsUntouched();
					this.form.controls[campoRegistro].updateValueAndValidity();
				}
			}

			this.form.controls.articulo.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
				let id = this.form.controls.articulo.value? this.form.controls.articulo.value.id : null;
			});

			this.form.controls.localidad.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				if(data?.id)
					this._recibirPedidoService.getArticulos('/api/v1/pedidos/products/',data.id);
			});

			this.form.controls.spill.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				this.setPendientePorAsignar();
			});

			if(this.localidades.length == 1){
				this.cantidadAsignarControls[this.localidades[0].id].setValue(this.form.controls["cantidad"].value);
				this.setPendientePorAsignar();
			}
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
			
			//debugger;
			registroActualizar.articuloId = id;
			registroActualizar.localidad = registroActualizar.localidad;
			registroActualizar.unidadMedidaId = registroActualizar.articulo.unidadMedidaInventario.id;
			registroActualizar.unidadMedida = registroActualizar.articulo.unidadMedidaInventario.nombre;
			registroActualizar.existencia = Number(existencia);
			registroActualizar.cantidadPedida = Number(registroActualizar.cantidadPedida);
			registroActualizar.cantidad = Number(registroActualizar.cantidad);
			registroActualizar.spill = Number(registroActualizar.spill);
			registroActualizar['cantidadDevuelta'] = Number(0);

			let localidades: PedidoReciboDetalleLocalidadProjection[] = [];
			if(this.localidadesAlmacenOrigen.length > 1){
				this.localidadesAlmacenOrigen.forEach(localidad => {
					if((this.cantidadAsignarControls[localidad.id]?.value || '0') != '0'){
						localidades.push({
							localidadId: localidad.id,
							cantidad: Number(this.cantidadAsignarControls[localidad.id].value)
						});
					}
				});
			}
			registroActualizar.localidades = localidades;

			registroActualizar.comentario = registroActualizar.comentario;
			
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

	cantidadValida(): boolean {
		if(this.form)
			return this.form.controls.cantidadSurtida.value == this.form.controls.cantidad.value + this.form.controls.spill.value /*+ this.form.controls.cantidadDevuelta.value*/;
		else
			return false;
	}

	getExistencia(articuloId): Number {
		let existencia: number = this.existencias.filter( exs => exs.articuloId == articuloId)[0]?.existencia;
		return Number(existencia);
	}

	createForm(): FormGroup {

		let form = this._formBuilder.group({
			id: [this.articulo?.id || null],
			articulo: this.articuloControl,
			localidad: this.localidadControl,
			existencia: new FormControl(this.articulo?.existencia || null, []),
			cantidadSurtida: new FormControl(null, [Validators.required]),
			cantidad: new FormControl(null || null, [Validators.required]),
			spill: new FormControl(null || null, [Validators.required]),
			comentario: new FormControl(null, [Validators.maxLength(149)])
		});

		form.controls['cantidad'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			this.setPendientePorAsignar();
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

	setPendientePorAsignar(){
		let cantidad: number = Number(this.form?.get('cantidad')?.value || 0);
		let spill: number = Number(this.form?.get('spill').value || 0);

		let sumaAsignada: number = 0;
		for(let localidadId in this.cantidadAsignarControls){
			sumaAsignada += Number(this.cantidadAsignarControls[localidadId].value || 0);
		}
		this.cantidadPendienteAsignarControl.setValue((cantidad) - sumaAsignada);
		this.cantidadPendienteAsignarControl.markAsTouched();
		this.cantidadPendienteAsignarControl.updateValueAndValidity();
	}
}