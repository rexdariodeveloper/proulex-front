import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { HashidsService } from '@services/hashids.service';
import { Router, RoutesRecognized, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Validators, FormGroup, FormBuilder, AbstractControl, FormControl, FormControlName } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { MatTabGroup } from '@angular/material/tabs';
import { JsonResponse } from '@models/json-response';
import { environment } from '@environments/environment';
import { SolicitudPagoService } from './solicitud-pago.service';
import * as moment from 'moment';
import { CXPSolicitudPago } from '@app/main/modelos/cxpsolicitud';
import { CXPSolicitudPagoDetalle } from '@app/main/modelos/cxpsolicitud-detalle';
import { CXPFactura, CXPSolicitudFacturaEditarProjection } from '@app/main/modelos/cxpfactura';
import { CXPFacturaDetalle } from '@app/main/modelos/cxpfactura-detalle';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { CXPSolicitudPagoServicio, CXPSolicitudPagoServicioEditarProjection } from '@app/main/modelos/cxpsolicitud-pago-servicio';
import { CXPSolicitudPagoServicioDetalleEditarProjection } from '@app/main/modelos/cxpsolicitud-pago-servicio-detalle';

@Component({
	selector: 'solicitud-pago',
	templateUrl: './solicitud-pago.component.html',
	styleUrls: ['./solicitud-pago.component.scss']
})
export class SolicitudPagoComponent {

	private URL: string = '/api/v1/solicitud-pago';

	@ViewChild('tabs') tabs: MatTabGroup;

	localeEN = english;
	localeES = spanish;

	titulo: string;
	pageType: string = 'nuevo';
	currentId: number;
	apiUrl: string = environment.apiUrl;

	config: FichaCRUDConfig;

	form: FormGroup;

	@ViewChild('sucursal') sucursal: PixvsMatSelectComponent;
	sucursalControl: FormControl = new FormControl(null,[Validators.required]);
	sucursales: any = [];

	@ViewChild('tipoSolicitud') tipoSolicitud: PixvsMatSelectComponent;
	tipoSolicitudControl: FormControl = new FormControl();
	tipoSolicitudes: any = [];

	@ViewChild('tipoServicio') tipoServicio: PixvsMatSelectComponent;
	tipoServicioControl: FormControl = new FormControl(null,[Validators.required]);
	tipoServicios: any = [];

	@ViewChild('proveedor') proveedor: PixvsMatSelectComponent;
	proveedorControl: FormControl = new FormControl(null,[Validators.required]);
	proveedores: any = [];

	@ViewChild('terminoPago') terminoPago: PixvsMatSelectComponent;
	terminoPagoControl: FormControl = new FormControl();
	terminoPagos: any = [];

	@ViewChild('moneda') moneda: PixvsMatSelectComponent;
	monedaControl: FormControl = new FormControl(null, [Validators.required]);
	monedas: any = [];

	servicio: any;
	archivoPDF: any;
	archivoXML: any;

	fechaActual = moment(new Date()).format('YYYY-MM-DD');

	datosFactura: any = {};
	concepto: any = {};

	solicitud: CXPSolicitudPagoServicioEditarProjection = new CXPSolicitudPagoServicioEditarProjection();
	private historial: any;

	articulos: any[] = [];
    cancelable: boolean = false;

	permiteReemplazarDocumentos: boolean = false;

	// Private
	private _unsubscribeAll: Subject < any > ;

	valorImporteXml: number;
	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _snackBar: MatSnackBar,
		private _fuseSidebarService: FuseSidebarService,
		private _fuseNavigationService: FuseNavigationService,
		private _solicitudService: SolicitudPagoService,
		private hashid: HashidsService,
		private router: Router,
		private translate: TranslateService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private _formBuilder: FormBuilder,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit() {
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		this.route.paramMap.subscribe(params => {
			this.pageType = params.get("handle");
			let id: string = params.get("id");

			this.currentId = this.hashid.decode(id);

			this.config = {
				rutaAtras: "/app/compras/solicitud-pago",
				rutaAprobar: this.URL + "/alerta/aprobar/",
                rutaRechazar: this.URL + "/alerta/rechazar/",
                rutaBorrar: this.URL + "/cancelar/",
				icono: "input"
			}

			// this._solicitudService.getDatos();

		});

		this.serviceSubscriptions();
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	serviceSubscriptions() {
		this._solicitudService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
			if (datos) {
				this._solicitudService.onDatosChanged.next(null);

                this.cancelable = datos.cancelable;

				this.createForms();

				this.articulos = datos.articulos;
				this.sucursales = datos.sucursales;
				if(this.sucursal){ this.sucursal.setDatos(this.sucursales);}
				if(this.sucursales.length == 1){ this.sucursalControl.setValue(this.sucursales[0]); };
				this.tipoSolicitudes = datos.tipoSolicitudes;
				if(this.tipoSolicitud){ this.tipoSolicitud.setDatos(this.tipoSolicitudes);}
				this.tipoServicios = datos.servicios;
				if(this.tipoServicio){ this.tipoServicio.setDatos(this.tipoServicios);}
				this.proveedores = datos?.proveedores;
				if(this.proveedor){ this.proveedor.setDatos(this.proveedores);}
				this.terminoPagos = datos.terminosPago;
				if(this.terminoPago){ this.terminoPago.setDatos(this.terminoPagos);}
				this.monedas = datos.monedas;
				if(this.moneda){ this.moneda.setDatos(this.monedas);}

				if(datos.historial)
					this.historial = datos.historial;

				if(datos.solicitud){
					this.solicitud = datos.solicitud;
					this.titulo = datos.solicitud.codigoSolicitudPagoServicio;
					this.sucursalControl.setValue(datos.solicitud.sucursal);

					let factura = datos.solicitud.detalles[0].cxpFactura;
					let partida = factura.detalles[0];

					let servicio = datos.servicios.find(srv => srv.articuloId == partida.articuloId);
					let tServicio = datos.tipoSolicitudes.find(tsrv => tsrv.id == servicio.tipoServicioId);
					console.log(factura);

					this.tipoSolicitudControl.setValue(tServicio);
					this.tipoServicioControl.setValue(servicio);
					this.proveedorControl.setValue(factura.proveedor);
					this.terminoPagoControl.setValue(factura.terminoPago);
					this.monedaControl.setValue(factura.moneda);

					this.form.controls['fechaFactura'].setValue(moment(factura.fechaRegistro).format('YYYY-MM-DD'));
					this.form.controls['fechaRecibo'].setValue(moment(factura.fechaReciboRegistro).format('YYYY-MM-DD'));
					//this.form.controls['fechaVencimiento'].setValue(moment(factura.fechaPago).format('YYYY-MM-DD'));
					this.form.controls['folio'].setValue(factura.codigoRegistro);
					this.form.controls['importe'].setValue(factura.montoRegistro);

					// this.archivoPDF = datos.solicitud.facturaPDF;
					// this.archivoXML = datos.solicitud.facturaXML;
					this.archivoPDF = datos.facturaPDF;
					this.archivoXML = datos.facturaXML;

					let diasPago = factura.proveedor?.diasVencimiento;
					let fechaVencimiento = moment(factura.fechaRegistro).add(diasPago,'day').format('YYYY-MM-DD');

					this.form.controls['fechaVencimiento'].setValue(fechaVencimiento);
					this.form.controls['comentarios'].setValue(datos.solicitud.comentarios || '');
				}

				this.permiteReemplazarDocumentos = datos.permiteReemplazarDocumentos;

			}
		});

		this._solicitudService.onPDFChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(archivoId => {
				if (archivoId) {
					this._solicitudService.onPDFChanged.next(null);
					this.archivoPDF.id = archivoId;
				}
			});

		this._solicitudService.onXMLChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(jsonFacturaXML => {
				if (jsonFacturaXML) {
					this._solicitudService.onXMLChanged.next(null)
					this.archivoXML.id = jsonFacturaXML.id;

					this.datosFactura = jsonFacturaXML?.datosFactura;
					this.concepto = jsonFacturaXML?.conceptos[0];
					
					let moneda = this.monedas.find( m => m.codigo == jsonFacturaXML.datosFactura.monedaCodigo);
					let fecha = moment(jsonFacturaXML.datosFactura.fecha).format('YYYY-MM-DD');
					this.form.controls['fechaFactura'].setValue(fecha);
					if(!jsonFacturaXML?.datosFactura?.folio){
						this.form.controls['folio'].setValue('');
					}else{
						this.form.controls['folio'].setValue((jsonFacturaXML.datosFactura.serie ? (jsonFacturaXML.datosFactura.serie + ' ') : '') + jsonFacturaXML.datosFactura.folio);
					}
					this.form.controls['moneda'].setValue(moneda);
					this.form.controls['importe'].setValue(jsonFacturaXML.datosFactura.total);

					let diasPago = this.form.controls['proveedor'].value?.diasPlazoCredito || null;
					let fechaVencimiento = moment(fecha).add(diasPago,'day').format('YYYY-MM-DD');

					this.form.controls['fechaVencimiento'].setValue(fechaVencimiento);

					this.form.controls['fechaFactura'].disable();
					this.form.controls['folio'].disable();
					this.form.controls['moneda'].disable();
					//this.form.controls['importe'].disable();
					this.form.controls['fechaVencimiento'].disable();
					this.valorImporteXml = this.form.controls['importe'].value;
					var inputImporte = document.getElementById('importe');
					inputImporte.setAttribute('max',String(this.form.controls['importe'].value+2));
					inputImporte.setAttribute('min',String(this.form.controls['importe'].value-2));
				}
			});
	}

	onChangedImporte(){
		var valorImporteChange = parseInt((document.getElementById("importe") as HTMLInputElement).value);
		if(this.valorImporteXml && (valorImporteChange > this.valorImporteXml+2)){
			this.form.controls['importe'].setValue(this.valorImporteXml+2);
		}
		if(this.valorImporteXml && (valorImporteChange < this.valorImporteXml-2)){
			this.form.controls['importe'].setValue(this.valorImporteXml-2);
		}

	}

	createForms() {
		this.form = this.createForm();

		if (this.pageType == 'ver' || this.pageType == 'alerta') {
			this.form.disable({
				emitEvent: false
			});
		} else {
			this.form.enable({
				emitEvent: false
			});
		}

		//this.form.controls['terminoPago'].disable();
		//this.form.controls['folio'].disable();
		//this.form.controls['fechaFactura'].disable();
		this.form.controls['fechaVencimiento'].disable();
	}

	createForm(): FormGroup {

		let form = this._formBuilder.group({

			sucursal: this.sucursalControl,
			tipoSolicitud: this.tipoSolicitudControl,
			tipoServicio: this.tipoServicioControl,
			proveedor: this.proveedorControl,
			terminoPago: this.terminoPagoControl,
			moneda: this.monedaControl,
			pdf: new FormControl(null,[]),
			xml: new FormControl(null,[]),
			fechaInicio: new FormControl(null,[]),
			fechaFin: new FormControl(null,[]),
			fechaFactura: new FormControl(null,[Validators.required]),
			fechaRecibo: new FormControl(this.fechaActual,[]),
			fechaVencimiento: new FormControl(null,[]),
			folio: new FormControl(null,[Validators.required]),
			importe: new FormControl(null,[Validators.required]),
			comentarios: new FormControl(null,[])
		});

		/*
		form.controls['tipoSolicitud'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
			if(data?.id && this.tipoServicio)
				this.tipoServicio.setDatos(this.tipoServicios.filter(servicio => servicio.tipoServicioId == data.id));
		});
		*/

		form.controls['tipoServicio'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
			if(data?.id){

				let tipoSolicitud = this.tipoSolicitudes.find(tipoSolicitud => tipoSolicitud.id == data.tipoServicioId);
				if(tipoSolicitud)
					form.controls['tipoSolicitud'].setValue(tipoSolicitud);

				this.servicio = data;
				form.controls['pdf'].reset();
				form.controls['xml'].reset();

				form.controls['pdf'].setValidators([]);
				form.controls['xml'].setValidators([]);

				/*
				if(this.servicio?.requierePDF)
					form.controls['pdf'].setValidators([Validators.required]);
				
				if(this.servicio?.requiereXML)
					form.controls['xml'].setValidators([Validators.required]);
				*/
			}
		});

		form.controls['proveedor'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
			if(data && form.controls['fechaFactura'].value){
				let fecha = moment(form.controls['fechaFactura'].value).format('YYYY-MM-DD');
				let diasPago = form.controls['proveedor'].value?.diasPlazoCredito || 0;
				let fechaVencimiento = moment(fecha).add(diasPago,'day').format('YYYY-MM-DD');

				form.controls['fechaVencimiento'].setValue(fechaVencimiento);
			}
		});

		form.controls['fechaFactura'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
			if(data){
				let fecha = moment(data).format('YYYY-MM-DD');
				let diasPago = form.controls['proveedor'].value?.diasPlazoCredito || 0;
				let fechaVencimiento = moment(fecha).add(diasPago,'day').format('YYYY-MM-DD');

				form.controls['fechaVencimiento'].setValue(fechaVencimiento);
			}
		});
		return form;
	}

	setDatos(formData){
		if(!this.solicitud?.id){
			this.solicitud.estatusId = ControlesMaestrosMultiples.CMM_CXPSPS_EstadoSolicitudPago.ACEPTADA;
			this.solicitud.codigoSolicitudPagoServicio = ''; //Autonumerico
			this.solicitud.sucursalId = formData.sucursal?.id;
			this.solicitud.comentarios = formData.comentarios;
	
			//Crear detalle de solicitud
			let detalle: CXPSolicitudPagoServicioDetalleEditarProjection = new CXPSolicitudPagoServicioDetalleEditarProjection();
			detalle.id = null;
			detalle.estatusId = ControlesMaestrosMultiples.CMM_CXPSPS_EstadoSolicitudPago.ACEPTADA;
			
			//Crear factura
			let factura: CXPSolicitudFacturaEditarProjection = new CXPSolicitudFacturaEditarProjection();
			factura.id = null;
			factura.codigoRegistro = [(this.datosFactura?.serie || ''), (this.datosFactura?.folio || '')].join(' ').trim() || formData?.folio || '';
			factura.tipoRegistroId = ControlesMaestrosMultiples.CMM_CXPF_TipoRegistro.FACTURA_SERVICIO_CXP;
			factura.proveedorId = formData.proveedor.id;
			factura.fechaRegistro = formData.fechaFactura + ' 00:00:00.000';
			factura.fechaReciboRegistro = formData.fechaRecibo + ' 00:00:00.000';
			factura.monedaId = formData.moneda.id;
			factura.paridadUsuario = null;
			factura.diasCredito = formData.proveedor.diasPlazoCredito;
			factura.montoRegistro = formData.importe;
			factura.fechaPago = null;
			factura.comentarios = 'Pago de servicios'
			factura.tipoPagoId = ControlesMaestrosMultiples.CMM_CCXP_TipoPago.PAGO_PROGRAMADO;
			factura.uuid = this.datosFactura?.uuid || null;
			factura.estatusId = 2000116;
			factura.facturaXMLId = this.archivoXML?.id;
			factura.facturaPDFId = this.archivoPDF?.id;
			factura.monedaCodigo = this.datosFactura?.monedaCodigo || formData?.moneda?.codigo || null;
	
			let articulo = this.articulos.find(art => art.id == formData.tipoServicio.articuloId);
	
			//Crear detalle de factura
			let facturaDetalle: CXPFacturaDetalle = new CXPFacturaDetalle();
			facturaDetalle.id = null;
			facturaDetalle.reciboId = null;
			facturaDetalle.numeroLinea = 1;
			facturaDetalle.descripcion = this.concepto?.concepto || articulo?.nombreArticulo;
			facturaDetalle.cantidad = this.concepto?.cantidad || 1;
			facturaDetalle.precioUnitario = this.concepto?.precioUnitario || Number(formData.importe);
			facturaDetalle.iva = 0;
			facturaDetalle.ivaExento = false;
			facturaDetalle.ieps = 0;
			facturaDetalle.iepsCuotaFija = null;
			facturaDetalle.tipoRegistroId = ControlesMaestrosMultiples.CMM_CXPF_TipoRegistro.FACTURA_SERVICIO_CXP;
			facturaDetalle.descuento = 0.00;
			facturaDetalle.tipoRetencionId = null;
			
			facturaDetalle.ordenCompraDetalleId = null;
			facturaDetalle.cantidadRelacionar = null
	
			facturaDetalle.articuloId = articulo?.id;
	
			factura.detalles = [facturaDetalle];
			detalle.cxpFactura = factura;
			this.solicitud.detalles = [detalle];
		}else{
			this.solicitud.detalles[0].cxpFactura.facturaXMLId = this.archivoXML?.id;
			this.solicitud.detalles[0].cxpFactura.facturaPDFId = this.archivoPDF?.id;
			this.solicitud.detalles[0].cxpFactura.uuid = this.datosFactura?.uuid || null;
		}
	}

	guardar(event) {

		this._solicitudService.cargando = true;

		if (!this.form.valid) {
			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

			this._solicitudService.cargando = false;

			this.form.markAllAsTouched();

			return;
		}

		if(this.servicio.requiereXML && !this.archivoXML){
			this._matSnackBar.open(this.translate.instant('ERROR.XML'), 'OK', {
				duration: 5000,
			});
			this._solicitudService.cargando = false;
			return;
		}

		if(this.servicio.requierePDF && !this.archivoPDF){
			this._matSnackBar.open(this.translate.instant('ERROR.PDF'), 'OK', {
				duration: 5000,
			});
			this._solicitudService.cargando = false;
			return;
		}

		if (this.form.valid) {
			this.form.disable({
				emitEvent: false
			});

			this.setDatos(this.form.value);

			this._solicitudService.guardar(this.solicitud, '/api/v1/solicitud-pago/save').then(
				(result: JsonResponse) => {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.router.navigate([this.config.rutaAtras])
					} else {
						this._solicitudService.cargando = false;
						this.form.enable({
							emitEvent: false
						});
					}
				}
			);
		} else {
			this._solicitudService.cargando = false;
			this.form.enable({
				emitEvent: false
			});

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});
		}
	}

	isRequired(form: FormGroup, campo: string) {

		let form_field = form.get(campo);
		if (!form_field.validator) {
			return false;
		}

		let validator = form_field.validator({} as AbstractControl);
		return !!(validator && validator.required);

	}

	pdfChangeEvent(event: any){
		let archivo: File = null;
		if(event?.target?.files?.length){
			for(let file of event.target.files){ archivo = file; }
		}
		if(!!archivo){
			this.archivoPDF = { nombreOriginal: archivo.name };
			this._solicitudService.subirArchivo(archivo,"",false);
		}
	}

	xmlChangeEvent(event: any){		
		let archivo: File = null;
		if(event?.target?.files?.length){
			for(let file of event.target.files){ archivo = file; }
		}
		if(!!archivo){
			this.archivoXML = { nombreOriginal: archivo.name };
			this._solicitudService.subirArchivo(archivo,"",true);
		}
	}

	descargarPDF(){
		if(this.archivoPDF){
			this._solicitudService.verArchivo(this.archivoPDF);
		}
	}
	descargarXML(){
		if(this.archivoXML){
			this._solicitudService.verArchivo(this.archivoXML);
		}
	}

}