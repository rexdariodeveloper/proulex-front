import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, ReplaySubject, BehaviorSubject, Observable } from 'rxjs';
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
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import * as moment from 'moment';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { MatTableDataSource } from '@angular/material/table';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { CXCFactura } from '@app/main/modelos/cxcfactura';
import { ClienteComboProjection, ClienteDatosFacturarProjection } from '@app/main/modelos/cliente';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { ClienteRemisionFacturarProjection } from '@app/main/modelos/cliente-remision';
import { ClienteRemisionDetalleFacturarProjection } from '@app/main/modelos/cliente-remision-detalle';
import { FacturaRemisionService } from './factura-remision.service';
import { CXCFacturaDetalle } from '@app/main/modelos/cxcfactura-detalle';
import { ClientesRemisionesDetallesDialogComponent, ClientesRemisionesDetallesDialogData } from './dialogs/clientes-remisiones-detalles/clientes-remisiones-detalles.dialog';

@Component({
	selector: 'factura-remision',
	templateUrl: './factura-remision.component.html',
	styleUrls: ['./factura-remision.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class FacturaRemisionComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

    // Propiedades de configuración de la ficha
	pageType: string = 'nuevo';
	localeEN = english;
	localeES = spanish;
	config: FichaCRUDConfig;
	titulo: String;
	subTitulo: String;
	apiUrl: string = environment.apiUrl;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;
    currentId: number;
    
    // Propiedades de edición de la ficha
	factura: CXCFactura;
    
    // Propiedades de formulario principal
	form: FormGroup;
	clienteControl: FormControl = new FormControl();
	monedaControl: FormControl = new FormControl();
	tipoCambioControl: FormControl = new FormControl();
	tipoPagoControl: FormControl = new FormControl();
	metodoPagoControl: FormControl = new FormControl();
	usoCFDIControl: FormControl = new FormControl();
    
	clientes: ClienteComboProjection[];
	monedas: MonedaComboProjection[];
	tiposPago: ControlMaestroMultipleComboProjection[];
	metodosPago: ControlMaestroMultipleComboProjection[];
	usosCFDI: ControlMaestroMultipleComboProjection[];

	dataSourceRemisiones: MatTableDataSource<ClienteRemisionFacturarProjection> = new MatTableDataSource([]);
	displayedColumnsRemisiones: string[] = [
		'fecha',
		'codigo',
		'monto',
		'montoRelacionar',
		'acciones'
	];

	mostrarModalRemisionesDetalles: boolean = false;
	remisionSeleccionada: ClienteRemisionFacturarProjection = null;
	dataSourceRemisionesDetalles: MatTableDataSource<ClienteRemisionDetalleFacturarProjection> = new MatTableDataSource([]);
	displayedColumnsRemisionesDetalles: string[] = [
		'codigoRemision',
		'codigoArticulo',
		'descripcion',
		'um',
		'cantidadRemision',
		'precioRemision',
		'cantidadRelacionada',
		'precioUnitario',
		'descuento',
		'iva',
		'ieps',
		'iepsCuotaFija',
		'totalPartida'
	];
	detallesMapRemisionId: {[remisionId:number]: ClienteRemisionDetalleFacturarProjection[]} = {};
	remisionesSeleccionadasIds: {[remisionId:number]:boolean} = {};
	mostrarModalDetallesBS: BehaviorSubject<ClienteRemisionFacturarProjection> = new BehaviorSubject(null);

	precioControls: {[detalleId: number]: FormControl} = {};
	descuentoControls: {[detalleId: number]: FormControl} = {};
	ivaControls: {[detalleId: number]: FormControl} = {};
	iepsControls: {[detalleId: number]: FormControl} = {};
	iepsCuotaFijaControls: {[detalleId: number]: FormControl} = {};

	updateFiltroDetalles: number = 0;

	actualizarTotalesCont: number = 0;

	clientesRemisionesRelacionar: ClienteRemisionFacturarProjection[] = [];
	clientesRemisionesDetallesRelacionar: ClienteRemisionDetalleFacturarProjection[] = [];

    cxcFacturaDetallesMapPorClienteRemisionDetalleId: {[clienteRemisionDetalleId:number]: CXCFacturaDetalle} = {};

	clienteDatosFacturar: ClienteDatosFacturarProjection = null;

	// Private
	private _unsubscribeAll: Subject < any > ;

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
		public _facturacionService: FacturaRemisionService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english,spanish);

		// Set the default
		this.factura = new CXCFactura();

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.pageType = params.get("handle");
			let id: string = params.get("id");

			this.currentId = this.hashid.decode(id);
			if (this.pageType == 'nuevo') {
				this.factura = new CXCFactura();
			}

			this.config = {
				rutaAtras: "/app/facturacion/factura-remision",
				rutaBorrar: "/api/v1/cxcfacturas-remisiones/delete/",
				icono: "assignment"
			}

		});

		this.dataSourceRemisionesDetalles.filterPredicate = ((detalle: ClienteRemisionDetalleFacturarProjection, filtro: string) => {
			return !!this.factura?.id || (this.remisionesSeleccionadasIds[detalle.clienteRemisionId] && ((detalle.cantidad || 0) > 0));
		}).bind(this);

		// Subscribe to update factura on changes
		this._facturacionService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

                if (datos && datos.CXCFactura) {
					this.factura = datos.CXCFactura;
					this.factura.detalles.forEach(detalle => {
						this.cxcFacturaDetallesMapPorClienteRemisionDetalleId[detalle.clienteRemisionDetalleId] = detalle;
					});
					this.clientesRemisionesRelacionar = datos.clientesRemisiones || [];
					this.clientesRemisionesDetallesRelacionar = (datos.clientesRemisionesDetalles || []);
					this.titulo = this.factura.folio;

					this.dataSourceRemisiones.data = [...datos.clientesRemisiones];
					datos.clientesRemisionesDetalles.forEach((detalle: ClienteRemisionDetalleFacturarProjection) => {
						detalle.iepsCuotaFijaChk = true;
						this.precioControls[detalle.id] = new FormControl(this.cxcFacturaDetallesMapPorClienteRemisionDetalleId[detalle.id].precioUnitario || null, [Validators.required, Validators.min(0)]);
						this.descuentoControls[detalle.id] = new FormControl(this.cxcFacturaDetallesMapPorClienteRemisionDetalleId[detalle.id].descuento || null, [Validators.required, Validators.min(0)]);
						this.ivaControls[detalle.id] = new FormControl(this.cxcFacturaDetallesMapPorClienteRemisionDetalleId[detalle.id].iva || null, [Validators.min(0), Validators.max(100)]);
						this.iepsControls[detalle.id] = new FormControl(this.cxcFacturaDetallesMapPorClienteRemisionDetalleId[detalle.id].ieps || null, [Validators.min(0),Validators.max(100)]);
						this.iepsCuotaFijaControls[detalle.id] = new FormControl(this.cxcFacturaDetallesMapPorClienteRemisionDetalleId[detalle.id].iepsCuotaFija || null, [Validators.min(0)]);
						
						this.precioControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
							this.actualizarTotales();
						});
						this.descuentoControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
							this.actualizarTotales();
						});
						this.ivaControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
							this.actualizarTotales();
						});
						this.iepsControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
							this.actualizarTotales();
						});
						this.iepsCuotaFijaControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
							this.actualizarTotales();
						});
					});
					let detallesIds: number[] = datos.clientesRemisionesDetalles.map(detalle => {
						return detalle.id;
					});
					this.dataSourceRemisionesDetalles.data = this.dataSourceRemisionesDetalles.data.filter(detalle => {
						return !detallesIds.includes(detalle.id);
					}).concat(datos.clientesRemisionesDetalles);
					datos.clientesRemisionesDetalles.forEach((detalle: ClienteRemisionDetalleFacturarProjection) => {
						detalle.cantidadRelacionar = this.cxcFacturaDetallesMapPorClienteRemisionDetalleId[detalle.id].cantidad;
					});
					this.actualizarDetalles();
				} else {
					this.factura = new CXCFactura();
				}

				this.clientes = datos.clientes;
				this.monedas = datos.monedas;
                this.tiposPago = datos.tiposPago;
                this.metodosPago = datos.metodosPago;
                this.usosCFDI = datos.usosCFDI;

				this.form = this.createFacturaForm();

				if (this.pageType == 'ver') {
					this.form.disable();
				} else {
					this.form.enable();
				}

				if(!!this.factura?.id){
					this.displayedColumnsRemisiones = [
						'fecha',
						'codigo',
						'monto',
						'montoRelacionar'
					];
				}

			});

		this._facturacionService.onDatosClienteChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datosCliente => {
				if (datosCliente) {
					this._facturacionService.onDatosClienteChanged.next(null);
					this.clienteDatosFacturar = datosCliente.cliente;
					if(!this.factura?.id){
						this.dataSourceRemisiones.data = [...datosCliente.clientesRemisiones];
					}
				}
			});

		this._facturacionService.onClientesRemisionesDetallesChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(json => {
				if (json) {
					this._facturacionService.onClientesRemisionesDetallesChanged.next(null);
					json.clientesRemisionesDetalles.forEach((detalle: ClienteRemisionDetalleFacturarProjection) => {
						detalle.iepsCuotaFijaChk = true;
						this.precioControls[detalle.id] = new FormControl(detalle.precioUnitario || null, [Validators.required, Validators.min(0)]);
						this.descuentoControls[detalle.id] = new FormControl(null, [Validators.required, Validators.min(0)]);
						this.ivaControls[detalle.id] = new FormControl(null, [Validators.min(0), Validators.max(100)]);
						this.iepsControls[detalle.id] = new FormControl(null, [Validators.min(0),Validators.max(100)]);
						this.iepsCuotaFijaControls[detalle.id] = new FormControl(null, [Validators.min(0)]);
						
						this.precioControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
							this.actualizarTotales();
						});
						this.descuentoControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
							this.actualizarTotales();
						});
						this.ivaControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
							this.actualizarTotales();
						});
						this.iepsControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
							this.actualizarTotales();
						});
						this.iepsCuotaFijaControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
							this.actualizarTotales();
						});
					});
					this.detallesMapRemisionId[this.remisionSeleccionada.id] = json.clientesRemisionesDetalles;
					let detallesIds: number[] = json.clientesRemisionesDetalles.map(detalle => {
						return detalle.id;
					});
					this.dataSourceRemisionesDetalles.data = this.dataSourceRemisionesDetalles.data.filter(detalle => {
						return !detallesIds.includes(detalle.id);
					}).concat(json.clientesRemisionesDetalles);
					if(this.mostrarModalRemisionesDetalles){
						this.abrirModalRemisionesDetalles(this.remisionSeleccionada);
					}else{
						json.clientesRemisionesDetalles.forEach((detalle: ClienteRemisionDetalleFacturarProjection) => {
							detalle.cantidadRelacionar = detalle.cantidad;
						});
						this.actualizarDetalles();
					}
					this.actualizarTotales();
				}
			});

		this._facturacionService.onTipoCambioChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(json => {
				if (json) {
					this.tipoCambioControl.setValue(json.tipoCambio);
				}
			});

		this.mostrarModalDetallesBS.pipe(takeUntil(this._unsubscribeAll)).subscribe(remision => {
			if(remision){
				this.mostrarModalDetallesBS.next(null);
				this.abrirModalRemisionesDetalles(remision);
			}
		});

	}

	createFacturaForm(): FormGroup {

		this.clienteControl = new FormControl(null, [Validators.required]);
		this.monedaControl = new FormControl(this.factura?.moneda, [Validators.required]);
		this.tipoPagoControl = new FormControl(this.factura?.tipoPago, [Validators.required]);
		this.metodoPagoControl = new FormControl(this.factura?.metodoPago, [Validators.required]);
		this.usoCFDIControl = new FormControl(this.factura?.receptorUsoCFDI, [Validators.required]);
		this.tipoCambioControl = new FormControl(null, []);

		this.clienteControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.clienteControl.value?.id){
				this._facturacionService.getDatosCliente(this.clienteControl.value?.id);
			}else{
				this.clienteDatosFacturar = null;
			}
		});
		this.monedaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.monedaControl.value?.id){
				this._facturacionService.getTipoCambio(this.monedaControl.value?.id);
			}else{
				this.tipoCambioControl.setValue(null);
			}
		});

		let form = this._formBuilder.group({
			id: [this.factura?.id],
			
            cliente: this.clienteControl,
			fechaRegistro: new FormControl(this.factura?.fechaRegistro ? moment(this.factura?.fechaRegistro) : moment(),[]),
            moneda: this.monedaControl,
            tipoCambio: this.tipoCambioControl,
			diasCredito: new FormControl(this.factura?.diasCredito || null,[Validators.required]),
            tipoPago: this.tipoPagoControl,
            metodoPago: this.metodoPagoControl,
            usoCFDI: this.usoCFDIControl,
			
			fechaCancelacion: this.factura?.fechaCancelacion,
			fechaModificacion: this.factura?.fechaModificacion
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

			this._facturacionService.cargando = true;
			this.form.disable();

			let body: CXCFactura = {...this.form.value};
			body.fechaRegistro = moment(body.fechaRegistro).format('YYYY-MM-DD HH:mm:ss.SSS')
			delete body['tipoCambio'];

			if(!this.factura?.id){

				body.detalles = [];
				let detallesIncorrecto: boolean = true;
				this.dataSourceRemisionesDetalles.data.forEach(detalle => {
					if(detalle.cantidadRelacionar > 0){
						let cxpFacturaDetalle: CXCFacturaDetalle = {
							clienteRemisionDetalleId: detalle.id,
							cantidad: detalle.cantidadRelacionar,
							precioUnitario: this.precioControls[detalle.id].value,
							iva: this.ivaControls[detalle.id].value,
							ivaExento: !this.ivaControls[detalle.id].value || this.ivaControls[detalle.id].value == '0',
							ieps: this.iepsControls[detalle.id].value,
							iepsCuotaFija: this.iepsCuotaFijaControls[detalle.id].value,
							descuento: this.descuentoControls[detalle.id].value,
							descripcion: detalle.articuloNombre
						};
						body.detalles.push(cxpFacturaDetalle);
						detallesIncorrecto = false;
					}
				});
	
				if(detallesIncorrecto){
					this._facturacionService.cargando = false;
					this.form.enable();
	
					this._matSnackBar.open(this.translate.instant('MENSAJE.DETALLES_REQUERIDOS'), 'OK', {
						duration: 5000,
					});
					return;
				}
			}

			this._facturacionService.guardar(JSON.stringify(body), `/api/v1/cxcfacturas-remisiones/save`).then(
				function(result: JsonResponse) {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.router.navigate([this.config.rutaAtras])
					} else {
						this._facturacionService.cargando = false;
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

			this._facturacionService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});

		}

	}

	getDetallesRemision(remision: ClienteRemisionFacturarProjection, mostrarModal: boolean){
		this.remisionSeleccionada = remision;
		if(this.remisionesSeleccionadasIds[this.remisionSeleccionada.id] && !mostrarModal){
			this.remisionesSeleccionadasIds[this.remisionSeleccionada.id] = false;
			this.actualizarDetalles();
		}else if((mostrarModal && !this.detallesMapRemisionId[remision.id]?.length) || (!this.remisionesSeleccionadasIds[this.remisionSeleccionada.id] && !mostrarModal)){
			this.mostrarModalRemisionesDetalles = mostrarModal;
			this.remisionesSeleccionadasIds[this.remisionSeleccionada.id] = true;
			this._facturacionService.getClientesRemisionesDetalles(remision.id);
		}else if(mostrarModal){
			this.mostrarModalRemisionesDetalles = mostrarModal;
			this.remisionesSeleccionadasIds[this.remisionSeleccionada.id] = true;
			this.mostrarModalDetallesBS.next(this.remisionSeleccionada);
		}
	}

	abrirModalRemisionesDetalles(remision: ClienteRemisionFacturarProjection): void {

		let dialogData: ClientesRemisionesDetallesDialogData = {
			codigoRemision: remision.codigo,
			detalles: this.detallesMapRemisionId[remision.id],
			onClosed: (() => {
				this.remisionSeleccionada = null;
				this.actualizarDetalles();
				this.actualizarTotales();
			}).bind(this)
		};

		const dialogRef = this.dialog.open(ClientesRemisionesDetallesDialogComponent, {
			width: '750px',
			data: dialogData
		});
	}

	actualizarDetalles(){
		this.updateFiltroDetalles++;
		this.dataSourceRemisionesDetalles.filter = String(this.updateFiltroDetalles);
		setTimeout(() => {
			this.actualizarTotalesCont = this.actualizarTotalesCont+1;
		});
	}

	// setOCsFactura(){
	// 	this.dataSourceOC.data = [...this.ordenesCompraRelacionar];
	// 	this.ordenesCompraDetallesRelacionar.forEach(detalle => {
	// 		if(!!this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]){
	// 			detalle.cantidadRelacionar = this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.cantidad;
	// 			if(detalle.iepsCuotaFija){
	// 				detalle.iepsCuotaFijaChk = true;
	// 			}
	// 			this.precioControls[detalle.id] = new FormControl(this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.precioUnitario || 0, [Validators.required, Validators.min(0)]);
	// 			this.descuentoControls[detalle.id] = new FormControl(this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.descuento || 0, [Validators.required, Validators.min(0)]);
	// 			this.ivaControls[detalle.id] = new FormControl((this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.ivaExento ? 0 : (this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.iva * 100)) || 0, [Validators.min(0), Validators.max(100)]);
	// 			this.iepsControls[detalle.id] = new FormControl((this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.ieps || 0) * 100, [Validators.min(0),Validators.max(100)]);
	// 			this.iepsCuotaFijaControls[detalle.id] = new FormControl(this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.iepsCuotaFija || 0, [Validators.min(0)]);
	// 		}else{
	// 			detalle.cantidadRelacionar = detalle.cantidadRelacionada;
	// 			if(detalle.iepsCuotaFija){
	// 				detalle.iepsCuotaFijaChk = true;
	// 			}
	// 			this.precioControls[detalle.id] = new FormControl(detalle.precio || null, [Validators.required, Validators.min(0)]);
	// 			this.descuentoControls[detalle.id] = new FormControl(detalle.descuento || null, [Validators.required, Validators.min(0)]);
	// 			this.ivaControls[detalle.id] = new FormControl(detalle.iva || null, [Validators.min(0), Validators.max(100)]);
	// 			this.iepsControls[detalle.id] = new FormControl(detalle.ieps || null, [Validators.min(0),Validators.max(100)]);
	// 			this.iepsCuotaFijaControls[detalle.id] = new FormControl(detalle.iepsCuotaFija || null, [Validators.min(0)]);
	// 		}

	// 		this.precioControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
	// 			this.actualizarTotales();
	// 		});
	// 		this.descuentoControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
	// 			this.actualizarTotales();
	// 		});
	// 		this.ivaControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
	// 			this.actualizarTotales();
	// 		});
	// 		this.iepsControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
	// 			this.actualizarTotales();
	// 		});
	// 		this.iepsCuotaFijaControls[detalle.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
	// 			this.actualizarTotales();
	// 		});
	// 	});
	// 	this._facturacionService.onOrdenesCompraDetallesChanged.next(null);
	// 	this.dataSourceOCDetalles.data = this.dataSourceOCDetalles.data.concat(this.ordenesCompraDetallesRelacionar);
	// 	this.remisionSeleccionada = null;
	// 	this.actualizarDetalles();
	// 	this.factura.retenciones.forEach(retencion => {
	// 		this.onNuevaRetencion(retencion);
	// 	});
	// 	this.actualizarTotales();
	// }

	actualizarTotales(){
		this.actualizarTotalesCont++;
	}

}