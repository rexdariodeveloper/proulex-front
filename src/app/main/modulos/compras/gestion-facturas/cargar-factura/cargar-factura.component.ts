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
import { ProveedorRelacionarProjection } from '@app/main/modelos/proveedor';
import { AlmacenComboProjection } from '@app/main/modelos/almacen';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { DepartamentoComboProjection } from '@models/departamento';
import { OrdenCompraDetalleEditarProjection, OrdenCompraDetalleRelacionadoProjection, OrdenCompraDetalleRelacionarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import * as moment from 'moment';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { CargarFacturaService } from './cargar-factura.service';
import { CXPFactura, CXPFacturaEditarProjection } from '@app/main/modelos/cxpfactura';
import { ArchivoProjection } from '@models/archivo';
import { JsonFacturaXML } from '@app/main/modelos/json-factura-xml';
import { OrdenCompraRelacionarProjection } from '@app/main/modelos/orden-compra';
import { MatTableDataSource } from '@angular/material/table';
import { OrdenCompraDetallesDialogData, OrdenCompraDetallesDialogComponent } from './dialogs/orden-compra-detalles/orden-compra-detalles.dialog';
import { CXPFacturaDetalle, CXPFacturaDetalleEditarProjection } from '@app/main/modelos/cxpfactura-detalle';
import { OrdenCompraReciboCargarFacturaProjection } from '@app/main/modelos/orden-compra-recibo';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ComentariosDialogComponent, ComentariosDialogData } from '../../ordenes-compra/recibo/dialogs/comentarios/comentarios.dialog';

@Component({
	selector: 'cargar-factura',
	templateUrl: './cargar-factura.component.html',
	styleUrls: ['./cargar-factura.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class CargarFacturaComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	pageType: string = 'nuevo';

	localeEN = english;
	localeES = spanish;

	config: FichaCRUDConfig;
	titulo: String;
	subTitulo: String;
	mostrarEditar: boolean = false;

	factura: CXPFacturaEditarProjection;
	reciboCargar: OrdenCompraReciboCargarFacturaProjection;
	jsonFacturaXMLCargar: JsonFacturaXML = null;
	form: FormGroup;

	apiUrl: string = environment.apiUrl;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

	/** Select Controls */

	proveedorControl: FormControl = new FormControl();
	proveedores: ProveedorRelacionarProjection[];
	proveedorRelacionar: ProveedorRelacionarProjection = null;

	tipoPagoControl: FormControl = new FormControl();
	tiposPago: ControlMaestroMultipleComboProjection[];
	
	codigoRegistroControl: FormControl = new FormControl();
	fechaRegistroControl: FormControl = new FormControl();
	montoRegistroControl: FormControl = new FormControl();
	monedaCodigoControl: FormControl = new FormControl();
	fechaVencimientoControl: FormControl = new FormControl();
	fechaReciboRegistroControl: FormControl = new FormControl();
	diasCreditoControl: FormControl = new FormControl();

	archivoPDF: ArchivoProjection = null;
	archivoXML: ArchivoProjection = null;
	jsonFacturaXML: JsonFacturaXML = null;

	dataSourceOC: MatTableDataSource<OrdenCompraRelacionarProjection> = new MatTableDataSource([]);
	displayedColumnsOC: string[] = [
		'fecha',
		'codigoOC',
		'montoOC',
		'montoRelacionar',
		'acciones'
	];

	mostrarModalDetallesOC: boolean = false;
	ocRelacionarSeleccionada: OrdenCompraRelacionarProjection = null;
	dataSourceOCDetalles: MatTableDataSource<OrdenCompraDetalleRelacionarProjection> = new MatTableDataSource([]);
	displayedColumnsOCDetalles: string[] = [
		'codigoOC',
		'codigoArticulo',
		'descripcion',
		'um',
		'cantidadOC',
		'precioOC',
		'descuentoOC',
		'cantidadRelacionada',
		'precioUnitario',
		'descuento',
		'iva',
		'ieps',
		'iepsCuotaFija',
		'totalPartida',
		'acciones'
	];
	detallesMapOC: {[ocId:number]: OrdenCompraDetalleRelacionarProjection[]} = {};
	ocsSeleccionadasIds: {[ocId:number]:boolean} = {};
	mostrarModalDetallesBS: BehaviorSubject<OrdenCompraRelacionarProjection> = new BehaviorSubject(null);

	precioControls: {[detalleId: number]: FormControl} = {};
	descuentoControls: {[detalleId: number]: FormControl} = {};
	ivaControls: {[detalleId: number]: FormControl} = {};
	iepsControls: {[detalleId: number]: FormControl} = {};
	iepsCuotaFijaControls: {[detalleId: number]: FormControl} = {};

	dataSourceRetenciones: MatTableDataSource<number> = new MatTableDataSource([]);
	displayedColumnsRetenciones: string[] = [
		'concepto',
		'monto',
		'tipo',
		'acciones'
	];
	retencionIdTmpCont: number = 0;

	retencionConceptoControls: {[retencionIdTmp: number]: FormControl} = {};
	retencionMontoControls: {[retencionIdTmp: number]: FormControl} = {};
	retencionTipoControls: {[retencionIdTmp: number]: FormControl} = {};
	tiposRetencion: ControlMaestroMultipleComboProjection[];

	updateFiltroDetalles: number = 0;

	cargarArchivosRecibo: boolean = false;

	actualizarTotalesCont: number = 0;

	ordenesCompraRelacionar: OrdenCompraRelacionarProjection[] = [];
	ordenesCompraDetallesRelacionar: OrdenCompraDetalleRelacionarProjection[] = [];

	reciboOCsCargadas: boolean = true;
	reciboOCsDetallesCargados: boolean = true;

	// Private
	private _unsubscribeAll: Subject < any > ;
	currentId: number;
    editarProveedor: boolean = true;
    mantenerInformacionArchivos: Boolean = false;


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
		public _cargarFacturaService: CargarFacturaService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english,spanish);

		// Set the default
		this.factura = new CXPFacturaEditarProjection();

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	cxpFacturaDetallesMapPorOCDetalleId: {[id:number]: CXPFacturaDetalleEditarProjection} = {};

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.pageType = params.get("handle");
			let id: string = params.get("id");

			this.currentId = this.hashid.decode(id);
			if (this.pageType == 'nuevo') {
				this.factura = new CXPFacturaEditarProjection();
			}

			this.config = {
				rutaAtras: "/app/compras/gestion-facturas",
				rutaBorrar: "/api/v1/gestion-facturas/delete/",
				icono: "assignment"
			}

		});

		this.dataSourceOCDetalles.filterPredicate = ((detalle: OrdenCompraDetalleRelacionarProjection, filtro: string) => {
			return !!this.factura?.id || (this.ocsSeleccionadasIds[detalle.ordenCompraId] && ((detalle.cantidadRelacionar || 0) > 0));
		}).bind(this);

		// Subscribe to update factura on changes
		this._cargarFacturaService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

                this.editarProveedor = ( (!datos.factura && !datos.recibo ) || ( !!datos.factura && !datos.recibo));
				if (datos && datos.factura) {
					this.factura = datos.factura;
					this.factura.detalles.forEach(detalle => {
						this.cxpFacturaDetallesMapPorOCDetalleId[detalle.ordenCompraDetalleId] = detalle;
					});
					this.ordenesCompraRelacionar = datos.ordenesCompra || [];
					this.ordenesCompraDetallesRelacionar = (datos.ordenesCompraDetalles || []).map((detalle: OrdenCompraDetalleRelacionadoProjection) => {
						return OrdenCompraDetalleRelacionarProjection.parseFromRelacionadoProjection(detalle);
					});
					this.reciboCargar = datos.recibo;
					this.jsonFacturaXMLCargar = datos.jsonFacturaXML;
					this.titulo = this.factura.codigoRegistro
					if(this.factura.estatus.id == ControlesMaestrosMultiples.CMM_CXPF_EstatusFactura.ABIERTA){
						this.mostrarEditar = true;
					}
				} else if (datos && datos.recibo) {
					this.factura = new CXPFacturaEditarProjection();
					this.reciboCargar = datos.recibo;
					this.jsonFacturaXMLCargar = datos.jsonFacturaXML;
					this.titulo = this.factura.codigoRegistro;
					this.reciboOCsCargadas = false;
					this.reciboOCsDetallesCargados = false;
				} else {
					this.factura = new CXPFacturaEditarProjection();
					this.mostrarEditar = true;
				}

				this.proveedores = datos.proveedores;
				this.tiposPago = datos.tiposPago;
				this.tiposRetencion = datos.tiposRetencion;

				this.form = this.createFacturaForm();

				if (this.pageType == 'ver') {
					this.form.disable();
				} else {
					this.form.enable();
				}

				if(!!this.factura?.id){
					this.displayedColumnsOC = [
						'fecha',
						'codigoOC',
						'montoOC',
						'montoRelacionar'
					];
					this.displayedColumnsRetenciones = [
						'concepto',
						'monto',
						'tipo'
					];
				}else if(!!this.reciboCargar?.id){
					this.cargarRecibo(this.reciboCargar);
				}

			});

		this._cargarFacturaService.onPDFChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(archivoId => {
				if (archivoId) {
					this._cargarFacturaService.onPDFChanged.next(null);
					this.archivoPDF.id = archivoId;
				}
			});

		this._cargarFacturaService.onXMLChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(jsonFacturaXML => {
				if (jsonFacturaXML) {
					this._cargarFacturaService.onXMLChanged.next(null);
					if(jsonFacturaXML.proveedor.rfc == this.proveedorControl?.value?.rfc){
						this.archivoXML.id = jsonFacturaXML.id;
						this.setDatosFactura(jsonFacturaXML);
					}else{
						this._matSnackBar.open('No se puede cargar XML debido a que no son iguales los RFC', 'OK', {
							duration: 5000,
						});
					}
				}
			});

		this._cargarFacturaService.onOrdenesCompraChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(ordenesCompra => {
				if (ordenesCompra) {
					this._cargarFacturaService.onOrdenesCompraChanged.next(null);
					if(!!this.factura?.id){
						this.setOCsFactura();
					}else{
						this.dataSourceOC.data = [...ordenesCompra];
						if(!!this.reciboCargar && !this.reciboOCsCargadas){
							this.reciboOCsCargadas = true;
							let ocCargar: OrdenCompraRelacionarProjection = ordenesCompra.find(oc => {
								return oc.id == this.reciboCargar.ordenCompra.id;
							})
							// this.ocsSeleccionadasIds[ocCargar.id] = true;
							// this.getDetallesOC(ocCargar,false);
							this.ocRelacionarSeleccionada = ocCargar;
							this.mostrarModalDetallesOC = false;
							this.ocsSeleccionadasIds[this.ocRelacionarSeleccionada.id] = true;
							this._cargarFacturaService.getOrdenesCompraDetalles(ocCargar.id);
						}
					}
				}
			});

		this._cargarFacturaService.onOrdenesCompraDetallesChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(ordenCompraDetalles => {
				if (ordenCompraDetalles) {
					ordenCompraDetalles.forEach(detalle => {
						if(detalle.iepsCuotaFija){
							detalle.iepsCuotaFijaChk = true;
						}
						this.precioControls[detalle.id] = new FormControl(detalle.precio || null, [Validators.required, Validators.min(0)]);
						this.descuentoControls[detalle.id] = new FormControl(detalle.descuento || null, [Validators.required, Validators.min(0)]);
						this.ivaControls[detalle.id] = new FormControl(detalle.iva || null, [Validators.min(0), Validators.max(100)]);
						this.iepsControls[detalle.id] = new FormControl(detalle.ieps || null, [Validators.min(0),Validators.max(100)]);
						this.iepsCuotaFijaControls[detalle.id] = new FormControl(detalle.iepsCuotaFija || null, [Validators.min(0)]);
						
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
					this._cargarFacturaService.onOrdenesCompraDetallesChanged.next(null);
					this.detallesMapOC[this.ocRelacionarSeleccionada.id] = ordenCompraDetalles;
					let detallesIds: number[] = ordenCompraDetalles.map(detalle => {
						return detalle.id;
					});
					this.dataSourceOCDetalles.data = this.dataSourceOCDetalles.data.filter(detalle => {
						return !detallesIds.includes(detalle.id);
					}).concat(ordenCompraDetalles);
					if(this.mostrarModalDetallesOC){
						this.abrirModalDetallesOC(this.ocRelacionarSeleccionada);
					}else{
						ordenCompraDetalles.forEach(detalle => {
							if(this.reciboCargar && !this.reciboOCsDetallesCargados){
								if(this.reciboCargar.ordenCompraDetalleId == detalle.id){
									detalle.cantidadRelacionar = this.reciboCargar.cantidadRecibo - this.reciboCargar.cantidadDevuelta;
								}
							}else{
								detalle.cantidadRelacionar = detalle.cantidadRecibida - detalle.cantidadRelacionada;
							}
						});
						this.reciboOCsDetallesCargados = true;
						this.ocRelacionarSeleccionada = null;
						this.actualizarDetalles();
					}
					this.actualizarTotales();
				}
			});

		this.mostrarModalDetallesBS.pipe(takeUntil(this._unsubscribeAll)).subscribe(oc => {
			if(oc){
				this.mostrarModalDetallesBS.next(null);
				this.abrirModalDetallesOC(oc);
			}
		});

	}

	createFacturaForm(): FormGroup {

		this.proveedorControl = new FormControl(this.factura?.proveedor, [Validators.required]);
		this.tipoPagoControl = new FormControl(this.factura?.tipoPago, [Validators.required]);
		this.codigoRegistroControl = new FormControl(this.factura?.codigoRegistro, []);
		this.fechaRegistroControl = new FormControl(this.factura?.fechaRegistro, []);
		this.montoRegistroControl = new FormControl(this.factura?.montoRegistro, []);
		this.monedaCodigoControl = new FormControl(this.factura?.monedaCodigo, []);
		this.fechaVencimientoControl = new FormControl(this.factura?.fechaVencimiento, []);
		this.fechaReciboRegistroControl = new FormControl(this.factura?.fechaReciboRegistro, []);
		this.diasCreditoControl = new FormControl(this.factura?.diasCredito, [Validators.required]);

		this.diasCreditoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			if(this.jsonFacturaXML?.datosFactura?.fecha){
				let fechaVencimiento: moment.Moment = moment(this.jsonFacturaXML.datosFactura.fecha);
				fechaVencimiento.add(Number(this.diasCreditoControl.value) || 0,'d');
				this.fechaVencimientoControl.setValue(fechaVencimiento);
			}
		})

		this.proveedorControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.setDatosProveedor(this.proveedorControl.value);
		});

		let form = this._formBuilder.group({
			id: [this.factura?.id],
			proveedor: this.proveedorControl,

			codigoRegistro: this.codigoRegistroControl,
			fechaRegistro: this.fechaRegistroControl,
			montoRegistro: this.montoRegistroControl,
			monedaCodigo: this.monedaCodigoControl,
			
			diasCredito: this.diasCreditoControl,
			tipoPago: this.tipoPagoControl,
			fechaReciboRegistro: this.fechaReciboRegistroControl,

			comentarios: new FormControl(this.factura?.comentarios || ''),
			
			fechaCancelacion: this.factura?.fechaCancelacion,
			fechaModificacion: this.factura?.fechaModificacion
		});

		if (!!this.factura?.id) {
			this.diasCreditoControl.disable();
		}

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

			if(!this.archivoPDF?.id || ! this.archivoXML?.id){
				this._cargarFacturaService.cargando = false;
				this.form.enable();

				this._matSnackBar.open(this.translate.instant('MENSAJE.FACTURA_REQUERIDA'), 'OK', {
					duration: 5000,
				});
				return;
			}

			this._cargarFacturaService.cargando = true;
			this.form.disable();

			let body = {...this.form.getRawValue()};

			if(!this.factura?.id){

				let total: number = 0;

				body.uuid = this.jsonFacturaXML.datosFactura.uuid;
				body.facturaXMLId = this.archivoXML.id;
				body.facturaPDFId = this.archivoPDF.id;
				body.detalles = [];
				let detallesIncorrecto: boolean = true;
				this.dataSourceOCDetalles.data.forEach(detalle => {
					if(detalle.cantidadRelacionar > 0){
						let cxpFacturaDetalle: CXPFacturaDetalle = {
							ordenCompraDetalleId: detalle.id,
							cantidadRelacionar: detalle.cantidadRelacionar,
							precioUnitario: this.precioControls[detalle.id].value,
							iva: this.ivaControls[detalle.id].value,
							ivaExento: !this.ivaControls[detalle.id].value || this.ivaControls[detalle.id].value == '0',
							ieps: this.iepsControls[detalle.id].value,
							iepsCuotaFija: this.iepsCuotaFijaControls[detalle.id].value,
							descuento: this.descuentoControls[detalle.id].value,
							descripcion: detalle.articulo.nombreArticulo
						};
						body.detalles.push(cxpFacturaDetalle);
						detallesIncorrecto = false;
						total += this._cargarFacturaService.getTotal(Number(cxpFacturaDetalle.cantidadRelacionar),Number(cxpFacturaDetalle.precioUnitario),Number(cxpFacturaDetalle.descuento),cxpFacturaDetalle.ivaExento ? 0 : Number(cxpFacturaDetalle.iva),!cxpFacturaDetalle.iepsCuotaFija ? Number(cxpFacturaDetalle.ieps) : null,!!cxpFacturaDetalle.iepsCuotaFija ? Number(cxpFacturaDetalle.iepsCuotaFija) : null);
					}
				});
	
				if(detallesIncorrecto){
					this._cargarFacturaService.cargando = false;
					this.form.enable();
	
					this._matSnackBar.open(this.translate.instant('MENSAJE.DETALLES_REQUERIDOS'), 'OK', {
						duration: 5000,
					});
					return;
				}
	
				this.dataSourceRetenciones.data.forEach(retencionidTmp => {
					let cxpFacturaDetalle: CXPFacturaDetalle = {
						cantidadRelacionar: 1,
						precioUnitario: this.retencionMontoControls[retencionidTmp].value,
						iva: 0,
						ivaExento: true,
						ieps: 0,
						iepsCuotaFija: null,
						descuento: 0,
						tipoRetencionId: this.retencionTipoControls[retencionidTmp].value.id,
						descripcion: this.retencionConceptoControls[retencionidTmp].value
					};
					body.detalles.push(cxpFacturaDetalle);
					total -= Number(cxpFacturaDetalle.precioUnitario);
				});

				if(this.jsonFacturaXML.datosFactura.total.toFixed(2) != total.toFixed(2)){
					this._cargarFacturaService.cargando = false;
					this.form.enable();

					this._matSnackBar.open(this.translate.instant('MENSAJE.TOTALES'), 'OK', {
						duration: 5000,
					});
					return;
				}
			}

			if (body.fechaReciboRegistro) {
				body.fechaReciboRegistro = moment(body.fechaReciboRegistro).format('YYYY-MM-DD HH:mm:ss.SSS');
			}
			if (body.fechaPago) {
				body.fechaPago = moment(body.fechaPago).format('YYYY-MM-DD HH:mm:ss.SSS');
			}
			if (body.fechaRegistro) {
				body.fechaRegistro = moment(body.fechaRegistro).format('YYYY-MM-DD HH:mm:ss.SSS');
			}

			this._cargarFacturaService.guardar(JSON.stringify(body), `/api/v1/gestion-facturas/save`).then(
				function(result: JsonResponse) {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.router.navigate([this.config.rutaAtras])
					} else {
						this._cargarFacturaService.cargando = false;
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

			this._cargarFacturaService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});

		}

	}

	setDatosProveedor(proveedor: ProveedorRelacionarProjection){
		if(this.proveedorRelacionar?.id != proveedor?.id){
			this.proveedorRelacionar = proveedor;
			if(!!proveedor){
				this._cargarFacturaService.getOrdenesCompra(this.proveedorRelacionar.id);
			}
            if(!this.mantenerInformacionArchivos){
                this.archivoPDF = null;
                this.archivoXML = null;
            }
			this.diasCreditoControl.setValue(proveedor?.diasVencimiento == 0 ? 0 : (proveedor?.diasVencimiento || null));
			this.setDatosFactura(null);
            this.mantenerInformacionArchivos = false
		}
	}

	setDatosFactura(jsonFacturaXML: JsonFacturaXML){
		if(!!this.factura?.id){
			this.archivoPDF = this.factura.facturaPDF;
			this.archivoXML = this.factura.facturaXML;
			jsonFacturaXML = this.jsonFacturaXMLCargar;
		}else if(this.cargarArchivosRecibo){
			this.cargarArchivosRecibo = false;
			this.archivoPDF = this.reciboCargar.facturaPDF;
			this.archivoXML = this.reciboCargar.facturaXML;
			jsonFacturaXML = this.jsonFacturaXMLCargar;
		}
		this.jsonFacturaXML = jsonFacturaXML;
		if(!!jsonFacturaXML){
						
			let fechaFactura: moment.Moment = moment(this.jsonFacturaXML.datosFactura.fecha);
			let fechaVencimiento: moment.Moment = fechaFactura.add(this.diasCreditoControl.value, 'days');
			this.fechaVencimientoControl.setValue(fechaVencimiento);
			
			// TODO - inicializar término de pago con aquel que tenga el proveedor

			if(!this.jsonFacturaXML.datosFactura.folio){
				this.codigoRegistroControl.setValue('');
			}else{
				let folio =
					this.jsonFacturaXML.datosFactura.serie ?
					(this.jsonFacturaXML.datosFactura.serie + ' ') :
					'';
				folio += this.jsonFacturaXML.datosFactura.folio;
				this.codigoRegistroControl.setValue(folio);
			}

			this.fechaRegistroControl.setValue(moment(this.jsonFacturaXML.datosFactura.fecha));
			this.fechaReciboRegistroControl.setValue(moment(this.factura?.fechaReciboRegistro || this.jsonFacturaXML.datosFactura.fecha));
			this.montoRegistroControl.setValue(this.jsonFacturaXML.datosFactura.total);
			this.monedaCodigoControl.setValue(this.jsonFacturaXML.datosFactura.monedaCodigo);
		}
	}

	pdfChangeEvent(event: any){
		let archivo: File = null;
		if(event?.target?.files?.length){
			for(let file of event.target.files){
				archivo = file;
			}
		}
		if(!!archivo){
			this.archivoPDF = {
				nombreOriginal: archivo.name
			};
			this._cargarFacturaService.subirArchivo(archivo,this.proveedorRelacionar.rfc,false);
		}
	}

	xmlChangeEvent(event: any){
		let archivo: File = null;
		if(event?.target?.files?.length){
			for(let file of event.target.files){
				archivo = file;
			}
		}
		if(!!archivo){
			this.archivoXML = {
				nombreOriginal: archivo.name
			};
			this._cargarFacturaService.subirArchivo(archivo,this.proveedorRelacionar.rfc,true).then((data)=>{});
		}
	}

	getDetallesOC(oc: OrdenCompraRelacionarProjection, mostrarModal: boolean){
		this.ocRelacionarSeleccionada = oc;
		if(this.ocsSeleccionadasIds[this.ocRelacionarSeleccionada.id] && !mostrarModal){
			this.ocsSeleccionadasIds[this.ocRelacionarSeleccionada.id] = false;
			this.actualizarDetalles();
		}else if((mostrarModal && !this.detallesMapOC[oc.id]?.length) || (!this.ocsSeleccionadasIds[this.ocRelacionarSeleccionada.id] && !mostrarModal)){
			this.mostrarModalDetallesOC = mostrarModal;
			this.ocsSeleccionadasIds[this.ocRelacionarSeleccionada.id] = true;
			this._cargarFacturaService.getOrdenesCompraDetalles(oc.id);
		}else if(mostrarModal){
			this.mostrarModalDetallesOC = mostrarModal;
			this.ocsSeleccionadasIds[this.ocRelacionarSeleccionada.id] = true;
			this.mostrarModalDetallesBS.next(this.ocRelacionarSeleccionada);
		}
	}

	abrirModalDetallesOC(oc: OrdenCompraRelacionarProjection): void {

		let dialogData: OrdenCompraDetallesDialogData = {
			codigoOC: oc.codigo,
			detalles: this.detallesMapOC[oc.id],
			onClosed: (() => {
				this.ocRelacionarSeleccionada = null;
				this.actualizarDetalles();
				this.actualizarTotales();
			}).bind(this)
		};

		const dialogRef = this.dialog.open(OrdenCompraDetallesDialogComponent, {
			width: '750px',
			data: dialogData
		});
	}

	onNuevaRetencion(retencion?: CXPFacturaDetalleEditarProjection){
		this.retencionIdTmpCont++;
		this.retencionConceptoControls[this.retencionIdTmpCont] = new FormControl(retencion?.descripcion || '',[Validators.required]);
		this.retencionMontoControls[this.retencionIdTmpCont] = new FormControl(retencion?.precioUnitario || null,[Validators.required]);
		this.retencionTipoControls[this.retencionIdTmpCont] = new FormControl(retencion?.tipoRetencion || null,[Validators.required]);
		this.dataSourceRetenciones.data = [...this.dataSourceRetenciones.data,this.retencionIdTmpCont];

		this.retencionMontoControls[this.retencionIdTmpCont].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.actualizarTotales();
		});
	}

	onBorrarRetencion(retencionIdTmp: number){
		this.retencionConceptoControls[this.retencionIdTmpCont].setValidators([]);
		this.retencionConceptoControls[this.retencionIdTmpCont].updateValueAndValidity();
		this.retencionMontoControls[this.retencionIdTmpCont].setValidators([]);
		this.retencionMontoControls[this.retencionIdTmpCont].updateValueAndValidity();
		this.retencionTipoControls[this.retencionIdTmpCont].setValidators([]);
		this.retencionTipoControls[this.retencionIdTmpCont].updateValueAndValidity();
		this.dataSourceRetenciones.data = this.dataSourceRetenciones.data.filter(id => {
			return id != retencionIdTmp;
		});
	}

	actualizarDetalles(){
		this.updateFiltroDetalles++;
		this.dataSourceOCDetalles.filter = String(this.updateFiltroDetalles);
		setTimeout(() => {
			this.actualizarTotalesCont = this.actualizarTotalesCont+1;
		});
	}

	cargarRecibo(recibo: OrdenCompraReciboCargarFacturaProjection){
		this.cargarArchivosRecibo = true;
		this.proveedorControl.setValue(recibo.ordenCompra.proveedor);
		this.diasCreditoControl.setValue(recibo.ordenCompra.proveedor['diasPlazoCredito']);
	}

	setOCsFactura(){
		this.dataSourceOC.data = [...this.ordenesCompraRelacionar];
		this.ordenesCompraDetallesRelacionar.forEach(detalle => {
			if(!!this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]){
				detalle.cantidadRelacionar = this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.cantidad;
				if(detalle.iepsCuotaFija){
					detalle.iepsCuotaFijaChk = true;
				}
				this.precioControls[detalle.id] = new FormControl(this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.precioUnitario || 0, [Validators.required, Validators.min(0)]);
				this.descuentoControls[detalle.id] = new FormControl(this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.descuento || 0, [Validators.required, Validators.min(0)]);
				this.ivaControls[detalle.id] = new FormControl((this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.ivaExento ? 0 : (this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.iva * 100)) || 0, [Validators.min(0), Validators.max(100)]);
				this.iepsControls[detalle.id] = new FormControl((this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.ieps || 0) * 100, [Validators.min(0),Validators.max(100)]);
				this.iepsCuotaFijaControls[detalle.id] = new FormControl(this.cxpFacturaDetallesMapPorOCDetalleId[detalle.id]?.iepsCuotaFija || 0, [Validators.min(0)]);
			}else{
				detalle.cantidadRelacionar = detalle.cantidadRelacionada;
				if(detalle.iepsCuotaFija){
					detalle.iepsCuotaFijaChk = true;
				}
				this.precioControls[detalle.id] = new FormControl(detalle.precio || null, [Validators.required, Validators.min(0)]);
				this.descuentoControls[detalle.id] = new FormControl(detalle.descuento || null, [Validators.required, Validators.min(0)]);
				this.ivaControls[detalle.id] = new FormControl(detalle.iva || null, [Validators.min(0), Validators.max(100)]);
				this.iepsControls[detalle.id] = new FormControl(detalle.ieps || null, [Validators.min(0),Validators.max(100)]);
				this.iepsCuotaFijaControls[detalle.id] = new FormControl(detalle.iepsCuotaFija || null, [Validators.min(0)]);
			}

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
		this._cargarFacturaService.onOrdenesCompraDetallesChanged.next(null);
		this.dataSourceOCDetalles.data = this.dataSourceOCDetalles.data.concat(this.ordenesCompraDetallesRelacionar);
		this.ocRelacionarSeleccionada = null;
		this.actualizarDetalles();
		this.factura.retenciones.forEach(retencion => {
			this.onNuevaRetencion(retencion);
		});
		this.actualizarTotales();
	}

	actualizarTotales(){
		this.actualizarTotalesCont++;
	}

	onModalComentarios(detalle: OrdenCompraDetalleRelacionarProjection){
		let dialogData: ComentariosDialogData = {
			comentariosRequisicion: detalle.comentariosPartida || 'Sin comentarios',
			comentariosCompras: detalle?.comentarios || 'Sin comentarios'
		};

		const dialogRef = this.dialog.open(ComentariosDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onMostrarImagen(detalle){
		
		let imagen: ArchivoProjection = new ArchivoProjection();
		imagen = detalle?.imagenArticulo;
		this._cargarFacturaService.verArchivo(imagen);
	}

}