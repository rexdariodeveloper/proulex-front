import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, FormArray } from '@angular/forms';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take } from 'rxjs/operators';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { OrdenCompra, OrdenCompraDevolverProjection, OrdenCompraEditarProjection, OrdenCompraRecibirProjection } from '@app/main/modelos/orden-compra';
import { ProveedorComboProjection } from '@app/main/modelos/proveedor';
import { AlmacenComboProjection } from '@app/main/modelos/almacen';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { DepartamentoComboProjection } from '@models/departamento';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { OrdenCompraDetalleDevolverProjection, OrdenCompraDetalleEditarProjection, OrdenCompraDetalleRecibirProjection } from '@app/main/modelos/orden-compra-detalle';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { LocalidadComboProjection } from '@app/main/modelos/localidad';
import { MatTableDataSource } from '@angular/material/table';
import { OrdenCompraReciboCompletoProjection, OrdenCompraReciboDevolucionProjection } from '@app/main/modelos/orden-compra-recibo';
import { DevolverOrdenCompraService } from './devolucion.service';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';

class OrdenCompraReciboDevolucionDatasource extends OrdenCompraReciboCompletoProjection {
	cantidadDevolver: number;
	cantidadDevolverControl: FormControl;
}

@Component({
	selector: 'devolucion-orden-compra',
	templateUrl: './devolucion.component.html',
	styleUrls: ['./devolucion.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class DevolucionOrdenCompraComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || (this.form.pristine && this.formCantidades.pristine);
	}

	pageType: string = 'editar';

	localeEN = english;
	localeES = spanish;

	config: FichaCRUDConfig;
	titulo: String;
	subTitulo: String;

	ordenCompra: OrdenCompraDevolverProjection;
	fechaActual: Date = new Date();
	form: FormGroup;
	formCantidades: FormGroup;
	cantidadesControls: FormArray;

	apiUrl: string = environment.apiUrl;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

	/** Select Controls */

	dataSourceRecibos: MatTableDataSource<OrdenCompraReciboDevolucionDatasource> = new MatTableDataSource([]);
	displayedColumnsRecibos: string[] = [
		'codigoArticulo',
		'nombre',
		'um',
		'cantidad',
		'cantidadRecibida',
		'almacen',
		'fechaRecibo',
		'usuarioRecibo',
		'cantidadDevolver'
	];

	// Private
	private _unsubscribeAll: Subject < any > ;
	currentId: number;


	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _formBuilder: FormBuilder,
		private _location: Location,
		private router: Router,
		private _matSnackBar: MatSnackBar,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private hashid: HashidsService,
		public _devolverOrdenCompraService: DevolverOrdenCompraService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		// Set the default
		this.ordenCompra = new OrdenCompraRecibirProjection();

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			let id: string = params.get("id");

			this.currentId = this.hashid.decode(id);

			this.config = {
				rutaAtras: "/app/compras/devolucion-oc",
				icono: "assignment_return"
			}

		});

		// Subscribe to update ordenCompra on changes
		this._devolverOrdenCompraService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if (datos && datos.ordenCompra) {
					this.ordenCompra = datos.ordenCompra;
					this.titulo = this.ordenCompra.codigo
				} else {
					this.ordenCompra = new OrdenCompraRecibirProjection();
					this._matSnackBar.open('Esta OC ha sido relacionada a una factura.', 'OK', {
						duration: 5000,
					});
				}

				this.cantidadesControls = new FormArray([]);
				this.formCantidades = this._formBuilder.group({
					cantidades: this.cantidadesControls
				});
				
				this.form = this.createReciboOrdenCompraForm();
				
				this.setDatasourceRecibos();

			});

	}

	setDatasourceRecibos(){
		let dataSourceRecibos: OrdenCompraReciboDevolucionDatasource[] = [];
		this.ordenCompra.detalles.forEach(detalle => {
			detalle.recibosPendientes.forEach(recibo => {
				let cantidadControl: FormControl = new FormControl(null,[Validators.min(0),Validators.max(recibo.cantidadPendienteDevolver)]);
				this.cantidadesControls.push(cantidadControl);
				dataSourceRecibos.push({...recibo,cantidadDevolver: 0, cantidadDevolverControl: cantidadControl});
				this.form.addControl('cantidad' + recibo.id,cantidadControl);
			});
		});
		this.dataSourceRecibos.data = [...dataSourceRecibos];
	}

	createReciboOrdenCompraForm(): FormGroup {

		let form = this._formBuilder.group({
			id: [this.ordenCompra.id],
			fechaModificacion: this.ordenCompra.fechaModificacion
		});

		return form;
	}


	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	isRequired(campo: string) {

		let form_field = this.form.get(campo);
		if (!form_field.validator) {
			return false;
		}

		let validator = form_field.validator({} as AbstractControl);
		return !!(validator && validator.required);

	}

	recargar() {
		this.pageType = this.fichaCrudComponent.recargar();
	}

	guardar() {

		if (this.form.valid) {

			this._devolverOrdenCompraService.cargando = true;
			this.form.disable();

			let body = {...this.form.value};
			let devolverValid: boolean = false;
			let recibirCantidadValid: boolean = true;
			let detalles = [];
			let detallesMap = {};
			this.dataSourceRecibos.data.forEach(recibo => {
				if(!detallesMap[recibo.ordenCompraDetalleId]){
					detallesMap[recibo.ordenCompraDetalleId] = {
						id: recibo.ordenCompraDetalleId,
						recibos: []
					};
					detalles.push(detallesMap[recibo.ordenCompraDetalleId]);
				}
				let reciboDevolver = {...recibo};
				reciboDevolver.cantidadDevolver = reciboDevolver.cantidadDevolverControl.value || 0;
				if(!devolverValid && reciboDevolver.cantidadDevolver > 0){
					devolverValid = true;
				}
				if(reciboDevolver.cantidadDevolver > recibo.cantidadPendienteDevolver){
					recibirCantidadValid = true;
				}
				delete reciboDevolver.cantidadDevolverControl;
				detallesMap[recibo.ordenCompraDetalleId].recibos.push(reciboDevolver);
			});
			body.detalles = detalles;
			if(!devolverValid){
				this._devolverOrdenCompraService.cargando = false;
				this.form.enable();

				this._matSnackBar.open(this.translate.instant('MENSAJE.DEVOLVER_1'), 'OK', {
					duration: 5000,
				});
				return;
			}
			if(!recibirCantidadValid){
				this._devolverOrdenCompraService.cargando = false;
				this.form.enable();

				this._matSnackBar.open(this.translate.instant('MENSAJE.DEVOLVER_2'), 'OK', {
					duration: 5000,
				});
				return;
			}

			this._devolverOrdenCompraService.guardar(JSON.stringify(body), '/api/v1/devolucion-ordenes-compra/save').then(
				function(result: JsonResponse) {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.router.navigate([this.config.rutaAtras])
					} else {
						this._devolverOrdenCompraService.cargando = false;
						this.form.enable();
					}
				}.bind(this)
			);




		} else {

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

			this._devolverOrdenCompraService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});

		}

	}

}