import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, ReplaySubject, BehaviorSubject } from 'rxjs';
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
import { ProveedorPagoProveedoresProjection, ProveedorProgramacionPagoProjection, ProveedorRelacionarProjection } from '@app/main/modelos/proveedor';
import * as moment from 'moment';
import { CXPFacturaPagoProveedoresProjection } from '@app/main/modelos/cxpfactura';
import { MatTableDataSource } from '@angular/material/table';
import { PagoProveedoresService } from './pago-proveedores.service';
import { CXPSolicitudPagoListadoProjection } from '@app/main/modelos/cxpsolicitud';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { FormaPagoComboProjection } from '@app/main/modelos/FormaPago';
import { CXPPagoDetalle } from '@app/main/modelos/cxppago-detalle';
import { CXPPago } from '@app/main/modelos/cxppago';
import { ArchivoProjection } from '@models/archivo';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SolicitudPagoProveedoresHistorialComponent } from './solicitud-historial.component';
import { NumeroFormatoPipe } from '@pixvs/utils/pipes/numero-formato.pipe';
import { CXPSolicitudPagoDetalleListadoProjection } from '@app/main/modelos/cxpsolicitud-detalle';
import { IconSnackBarComponent } from '@pixvs/componentes/snackbars/icon-snack-bar.component';

@Component({
	selector: 'pago-proveedores',
	templateUrl: './pago-proveedores.component.html',
	styleUrls: ['./pago-proveedores.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class PagoProveedoresComponent {

	CMM_CXPS_EstadoSolicitudPago = ControlesMaestrosMultiples.CMM_CXPS_EstadoSolicitudPago;

	pageType: string = 'editar';
	actualizarCont: number = 0;

	localeEN = english;
	localeES = spanish;

	config: FichaCRUDConfig;
	mostrarEditar: boolean = false;

	vista: 'S'|'P'|'F' = null;
	solicitudes: CXPSolicitudPagoListadoProjection[] = [];

	apiUrl: string = environment.apiUrl;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

	/** Select Controls */

	montoPagarControl: FormControl = new FormControl();

	dataSourceSolicitudes: MatTableDataSource<CXPSolicitudPagoListadoProjection> = new MatTableDataSource([]);
	displayedColumnsSolicitudes: string[] = [
		'folioSolicitud',
		'fechaSolicitud',
		'proveedores',
		'montoProgramado',
		'facturas',
		'enviadoPor',
		'estatus',
		'acciones'
	];
	dataSourceProveedores: MatTableDataSource<ProveedorPagoProveedoresProjection> = new MatTableDataSource([]);
	displayedColumnsProveedores: string[] = [
		'proveedor',
		'montoProgramado',
		'facturas',
		'enviadoPor',
		'saldo',
		'acciones'
	];
	dataSourceFacturas: MatTableDataSource<CXPFacturaPagoProveedoresProjection> = new MatTableDataSource([]);
	displayedColumnsFacturas: string[] = [
		'pagar',
		'folioFactura',
		'monto',
		'saldo',
		'montoProgramado',
		'fechaFactura',
		'fechaVencimiento',
		'ordenCompra',
		'montoPagar',
		'acciones'
	];
	facturasSeleccionadas: {[facturaId:number]: CXPFacturaPagoProveedoresProjection} = {};
	solicitudSeleccionada: CXPSolicitudPagoListadoProjection = null;
	proveedorSeleccionado: ProveedorPagoProveedoresProjection = null;

	montoPagarControls: {[facturaId: number]: FormControl} = {};
	
	form: FormGroup;
	formaPagoControl: FormControl = new FormControl(null,[]);
	formasPago: FormaPagoComboProjection[] = [];
	cuentas: any[] = [];
    beneficiarios: any[] = [];

	// Private
	private _unsubscribeAll: Subject < any > ;
	currentId: number;
	private _numeroFormatoPipe: NumeroFormatoPipe = new NumeroFormatoPipe();


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
		public _pagoProveedoresService: PagoProveedoresService,
		private el: ElementRef,
		public validatorService: ValidatorService,
		private _historial: MatBottomSheet
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {

			this.config = {
				icono: "calendar_today"
			}

		});

		// Subscribe to update factura on changes
		this._pagoProveedoresService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				let cxpFacturasMap = {};
				let saldosProveedoresMap = {};
				for(let cxpFactura of datos.cxpFacturas){
					cxpFacturasMap[cxpFactura.id] = cxpFactura;
				}
				for(let solicitud of datos.solicitudes){
					for(let detalle of solicitud.detalles){
						if(detalle.estatus.id != ControlesMaestrosMultiples.CMM_CXPS_EstadoSolicitudPago.CANCELADA){
							detalle.cxpFactura = cxpFacturasMap[detalle.cxpFacturaId];
							saldosProveedoresMap[detalle.proveedor.id] = (saldosProveedoresMap[detalle.proveedor.id] || 0) + detalle.cxpFactura.saldo;
						}
					}
				}

                if(!!datos.beneficiarios){
                    this.beneficiarios = datos.beneficiarios;
                }

				this.solicitudes = datos.solicitudes;
				let proveedoresMap: any = {};
				for(let solicitud of this.solicitudes){
					proveedoresMap = {};
					for(let detalle of solicitud.detalles){
						if(detalle.estatus.id == ControlesMaestrosMultiples.CMM_CXPS_EstadoSolicitudPago.ACEPTADA){
							if(!proveedoresMap[detalle.proveedor.id]){
								proveedoresMap[detalle.proveedor.id] = detalle.proveedor;
								solicitud.proveedores = (solicitud.proveedores || []).concat(detalle.proveedor);
							}
							let proveedor: ProveedorPagoProveedoresProjection = proveedoresMap[detalle.proveedor.id];
							proveedor.facturas = (proveedor.facturas || []).concat(detalle.cxpFactura);
							proveedor.detalles = (proveedor.detalles || []).concat(detalle);
							proveedor.montoProgramado = (proveedor.montoProgramado || 0) + detalle.montoProgramado;
							proveedor.saldo = saldosProveedoresMap[detalle.proveedor.id];
							solicitud.montoProgramado = (solicitud.montoProgramado || 0) + detalle.montoProgramado;
							solicitud.totalFacturas ++;
						}
						if(detalle.estatus.id != ControlesMaestrosMultiples.CMM_CXPS_EstadoSolicitudPago.CANCELADA){
							solicitud.facturaPDFId = detalle.cxpFactura?.facturaPDFId;
							solicitud.facturaXMLId = detalle.cxpFactura?.facturaXMLId;
						}
					}
				}
				this.formasPago = datos.formasPago;

				this.dataSourceSolicitudes.data = this.solicitudes;

				this.cuentas = datos.cuentas;

				this.setVista('S');

			});

		this._pagoProveedoresService.onPagarChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				this.comprobante = null;
				if(datos){
					this._pagoProveedoresService.getDatos();
				}

			});

		this._pagoProveedoresService.onCancelarChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if(datos){
					this._pagoProveedoresService.getDatos();
				}

			});
		this._pagoProveedoresService.onComprobanteChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(archivoId => {
			if(archivoId){
				this._pagoProveedoresService.onComprobanteChanged.next(null);
				this.comprobante.id = archivoId;
			}
		});
		this._pagoProveedoresService.onHistorialChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(body => {
			if(body){
				this._pagoProveedoresService.onHistorialChanged.next(null);
				if(body.historial?.length){
					this._historial.open(SolicitudPagoProveedoresHistorialComponent, {
						data: body.historial,
					});
				}else{
					this._matSnackBar.open('No se encontró historial', 'OK', {
						duration: 5000,
					});
				}
			}
		})

	}


	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	guardar() {

		if(!this.form.valid){
			for (const key of Object.keys(this.form.controls)) {
				if (this.form.controls[key].invalid) {
					const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

					if (invalidControl) {
						invalidControl.focus();
						break;
					}

				}
			}

			this._pagoProveedoresService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});
			return;
		}

		for(let facturaId in this.facturasSeleccionadas){
			if(this.facturasSeleccionadas[facturaId] && this.montoPagarControls[facturaId].invalid){
				this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
					duration: 5000,
				});
				return;
			}
		}

		let facturasIds: number[] = Object.keys(this.facturasSeleccionadas).filter(facturaId => {
			return !!this.facturasSeleccionadas[facturaId] && this.montoPagarControls[facturaId].value && Number(this.montoPagarControls[facturaId].value);
		}).map(facturaId => {
			return Number(facturaId);
		});

		if(!facturasIds.length){
			this._pagoProveedoresService.cargando = false;

			this._matSnackBar.open('Selecciona al menos una factura a pagar', 'OK', {
				duration: 5000,
			});
			return;
		}

		if(!this.comprobante?.id){
			this._pagoProveedoresService.cargando = false;

			this._matSnackBar.open('Es necesario adjuntar un comprobante', 'OK', {
				duration: 5000,
			});
			return;
		}

		this._pagoProveedoresService.cargando = true;

		let montoPago: number = 0;
		let detalles: CXPPagoDetalle[] = facturasIds.map((facturaId): CXPPagoDetalle => {
			montoPago += Number(this.montoPagarControls[facturaId].value);
			return {
				cxpFacturaId: facturaId,
				montoAplicado: this.montoPagarControls[facturaId].value
			};
		});
		
		let body: CXPPago = this.form.getRawValue();
		body.proveedorId = this.proveedorSeleccionado.id;
		body.montoPago = montoPago;
		body.detalles = detalles;
		body.solicitudId = this.solicitudSeleccionada.id;
		body.comprobante = this.comprobante;
		body.comprobanteId = this.comprobante?.id || null;

		this._pagoProveedoresService.pagar(body);

	}

	solicitudCancelar: CXPSolicitudPagoListadoProjection = null;
	cancelarSolicitud(solicitud: CXPSolicitudPagoListadoProjection) {
		this.solicitudCancelar = solicitud;

		const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
			width: '500px',
			data: {
				mensaje: '¿Deseas rechazar la solicitud ' + solicitud.codigoSolicitud + '?'
			}
		});

		dialogRef.afterClosed().subscribe(confirm => {
			if (confirm) {
				this.onAceptarCancelarFactura();
			}
		});
	}

	onAceptarCancelarFactura(){
		this._pagoProveedoresService.cargando = true;
		this._pagoProveedoresService.cancelar(this.solicitudCancelar.id);
	}

	marcarFactura(factura: CXPFacturaPagoProveedoresProjection){
		if(!!this.facturasSeleccionadas[factura.id]){
			this.facturasSeleccionadas[factura.id] = null;
			this.montoPagarControls[factura.id].setValue(0);
		}else{
			this.facturasSeleccionadas[factura.id] = factura;
			this.montoPagarControls[factura.id].setValue(factura.montoProgramado);
		}
	}

	onMostrarEvidencia(archivosDescargar: ArchivoProjection | ArchivoProjection[], factura?: CXPFacturaPagoProveedoresProjection){
		if(Array.isArray(archivosDescargar)){
			let evidenciaIds: number[] = archivosDescargar.map(ev => {
				return Number(ev.id);
			});
			this._pagoProveedoresService.descargarEvidencia(factura?.id);
		}else{
			this._pagoProveedoresService.verArchivo(archivosDescargar);
		}
	}

	onMostrarFactura(archivosDescargar: ArchivoProjection | ArchivoProjection[], factura?: CXPFacturaPagoProveedoresProjection){
		if(Array.isArray(archivosDescargar)){
			let evidenciaIds: number[] = archivosDescargar.map(ev => {
				return Number(ev.id);
			});
			this._pagoProveedoresService.descargarFactura(factura?.id);
		}else{
			this._pagoProveedoresService.verArchivo(archivosDescargar);
		}
	}

	subTextoExtra: string = null;
	mostrarImprimir: boolean = false;

	setVista(vista: 'S'|'P'|'F'){
		this.vista = vista;
		this.subTextoExtra = null;
		this.mostrarImprimir = false;
		switch(this.vista){
			case 'S':
				this.solicitudSeleccionada = null;
				this.dataSourceProveedores.data = [];
			case 'P':
				this.proveedorSeleccionado = null;
				this.dataSourceFacturas.data = [];
				this.montoPagarControls = {};
				this.facturasSeleccionadas = {};
				if(!!this.solicitudSeleccionada){
					this.subTextoExtra = this._numeroFormatoPipe.transform(this.solicitudSeleccionada.montoProgramado);
					this.mostrarImprimir = true;
				}
			case 'F':
				this.form = this.createForm();
		}
	}

	verSolicitud(solicitud: CXPSolicitudPagoListadoProjection){
		this.solicitudSeleccionada = solicitud;
		let programados = solicitud.proveedores.filter(proveedor => {return proveedor.montoProgramado > 0; });
		this.dataSourceProveedores.data = programados.sort((i,j) => i.nombre == j.nombre? 0 : (i.nombre > j.nombre? 1 : -1))
		this.setVista('P');
	}

	verProveedor(proveedor: ProveedorPagoProveedoresProjection){
		this.proveedorSeleccionado = proveedor;
		this.comprobante = null;
		for(let detalle of proveedor.detalles){
			this.montoPagarControls[detalle.cxpFactura.id] = new FormControl(detalle.montoProgramado,[Validators.max(detalle.montoProgramado)]);
			this.montoPagarControls[detalle.cxpFactura.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
				this.actualizarCont = this.actualizarCont+1;
			});
			//this.facturasSeleccionadas[detalle.cxpFactura.id] = detalle.cxpFactura;
		}
		this.dataSourceFacturas.data = proveedor.detalles.filter(detalle => {
			return detalle.estatus.id == ControlesMaestrosMultiples.CMM_CXPS_EstadoSolicitudPago.ACEPTADA;
		}).map(detalle => {
			detalle.cxpFactura.montoProgramado = detalle.montoProgramado;
			return detalle.cxpFactura
		});
		this.setVista('F');
	}

	createForm(): FormGroup {

		this.formaPagoControl = new FormControl(null, [Validators.required]);

		let form = this._formBuilder.group({
			id: [null],
			formaPago: this.formaPagoControl,

			cuentaBancaria: new FormControl(null,[Validators.required]),
			fechaPago: new FormControl(null,[Validators.required]),
			identificacionPago: new FormControl(null,[Validators.required]),
		});

		return form;
	}

	onVolverVista(){
		switch(this.vista){
			case 'P':
				this.setVista('S');
				break;
			case 'F':
				this.setVista('P');
				break;
		}
	}


	comprobante: ArchivoProjection = null;
	comprobanteChangeEvent(event: any){
		let archivo: File = null;
		if(event?.target?.files?.length){
			for(let file of event.target.files){
				archivo = file;
			}
		}
		if(!!archivo){
			this.comprobante = {
				nombreOriginal: archivo.name
			};
			this._pagoProveedoresService.subirArchivo(archivo);
		}
	}

	deleteComprobante(){
		this.comprobante = null;
	}

	descargarPdf(id: number){
		this._pagoProveedoresService.getArchivo('/api/v1/pago-proveedores/pdf/' + id);
		this._matSnackBar.open('Descargando...', '', {
				data :{
					icon: 'cloud_download'
				},
				duration: 5000,
		});

	}

	onHistorial(solicitudId: number){
		this._pagoProveedoresService.getHistorial(solicitudId);
	}

    getBeneficiario(id: Number): String{
        let beneficiario = this.beneficiarios.find(beneficiario => beneficiario.id == id);
        return beneficiario.beneficiario;
    }

	getXML(id){
		this.getFileById(id, 'xml');
	}

	private getFileById(id: number, ext: string){
		this._matSnackBar.openFromComponent(IconSnackBarComponent, {
			data: {
				message: 'Descargando...',
				icon: 'cloud_download',
			},
			duration: 9000, horizontalPosition: 'right'
		});
		this._pagoProveedoresService.descargarArchivo(id, ext);
	}
}