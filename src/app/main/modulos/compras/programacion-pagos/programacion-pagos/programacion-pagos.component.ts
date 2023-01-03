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
import { ProveedorComboProjection, ProveedorProgramacionPagoProjection, ProveedorRelacionarProjection } from '@app/main/modelos/proveedor';
import * as moment from 'moment';
import { CXPFactura, CXPFacturaEditarProjection, CXPFacturaProgramacionPagoBeneficiarioProjection } from '@app/main/modelos/cxpfactura';
import { MatTableDataSource } from '@angular/material/table';
import { ProgramacionPagosService } from './programacion-pagos.service';
import { CancelarFacturaDialogComponent, CancelarFacturaDialogData } from './dialogs/cancelar-factura/cancelar-factura.dialog';
import { ResumenDialogData, ResumenDialogComponent } from './dialogs/resumen/resumen.dialog';
import { ArchivoProjection } from '@models/archivo';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

@Component({
	selector: 'programacion-pagos',
	templateUrl: './programacion-pagos.component.html',
	styleUrls: ['./programacion-pagos.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class ProgramacionPagosComponent {

	pageType: string = 'editar';

	actualizarCont: number = 0;

	localeEN = english;
	localeES = spanish;

	config: FichaCRUDConfig;
	mostrarEditar: boolean = false;

	proveedores: ProveedorProgramacionPagoProjection[] = [];
	proveedoresListado: ProveedorComboProjection[] = [];

	apiUrl: string = environment.apiUrl;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

	/** Select Controls */

	montoPagarControl: FormControl = new FormControl();

	dataSourceFacturasMapProveedor: {[proveedorId:number]: MatTableDataSource<CXPFacturaProgramacionPagoBeneficiarioProjection>} = {};
	displayedColumnsFacturas: string[] = [
		'sucursal',
		'folioFactura',
		'moneda',
		'monto',
		'saldo',
		'montoProgramado',
		'fechaFactura',
		'fechaVencimiento',
		'ordenCompra',
		'acciones',
		'programar',
		'montoPagar'
	];
	facturasSeleccionadas: {[facturaId:number]: CXPFacturaProgramacionPagoBeneficiarioProjection} = {};
	proveedoresSeleccionados: {[proveedorId:number]: boolean} = {};

	currentId: number;
	filtros: FieldConfig[];

	montosPagarControlMap: {[facturaId: number]: FormControl} = {};

	// Private
	private _unsubscribeAll: Subject < any > ;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _fuseSidebarService: FuseSidebarService,
		private translate: TranslateService,
		private _formBuilder: FormBuilder,
		private _location: Location,
		private router: Router,
		private _matSnackBar: MatSnackBar,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private hashid: HashidsService,
		public _programacionPagosService: ProgramacionPagosService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.config = {icono: ""}
		});

		// Subscribe to update factura on changes
		this._programacionPagosService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				this.proveedoresSeleccionados = {};
				this.facturasSeleccionadas = {};
				this.actualizarCont = this.actualizarCont+1;

				if(datos?.proveedores){
					this.proveedoresListado = datos.proveedores.map( p => {return {id: p.id, nombre: p.nombre};});
					this.filtros = this.getFiltros(this.proveedoresListado);
					this.proveedores = datos.proveedores.sort((a,b) => { return (a.nombre == b.nombre? 0 : (a.nombre > b.nombre? 1 : -1))});
				}

				let proveedoresMap: any = {};
				for(let proveedor of this.proveedores){
					proveedor.facturasProgramacion = [];
					proveedoresMap[proveedor.id] = proveedor;
				}
				for(let factura of datos.cxpFacturas){
					let proveedor = proveedoresMap[factura.proveedorId];
					if(!!proveedor){
						if(!proveedor.facturasProgramacion?.length){
							proveedor.facturasProgramacion = [];
						}
						proveedor.facturasProgramacion.push(factura);
					}
				}

				for(let proveedor of this.proveedores){
					this.dataSourceFacturasMapProveedor[proveedor.id] = new MatTableDataSource(proveedor.facturasProgramacion);
				}
			});

		this._programacionPagosService.onProgramarChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if(datos){
					this._programacionPagosService.getDatos();
				}

			});

		this._programacionPagosService.onCancelarChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if(datos){
					this._programacionPagosService.getDatos();
				}

			});
	}


	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	guardar() {

		let montosValid: boolean = true;
		let facturas: CXPFactura[] = Object.keys(this.facturasSeleccionadas).filter(facturaId => {
			return !!this.facturasSeleccionadas[facturaId];
		}).map(facturaId => {
			this.montosPagarControlMap[facturaId]?.updateValueAndValidity();
			this.montosPagarControlMap[facturaId]?.markAsTouched();
			if(this.montosPagarControlMap[facturaId].invalid){
				montosValid = false;
			}
			let monto: number = Number(this.montosPagarControlMap[facturaId]?.value || 0);
			return {
				id: Number(facturaId),
				fechaModificacion: this.facturasSeleccionadas[facturaId].fechaModificacion,
				montoRegistro: monto
			};
		});

		if(!facturas.length){
			this._programacionPagosService.cargando = false;

			this._matSnackBar.open(this.translate.instant('MENSAJE.FACTURA_REQUERIDA'), 'OK', {
				duration: 5000,
			});
			return;
		}

		if(!montosValid){
			this._programacionPagosService.cargando = false;

			this._matSnackBar.open('Montos a programar incorrectos', 'OK', {
				duration: 5000,
			});
			return;
		}

		this._programacionPagosService.cargando = true;

		this._programacionPagosService.programar(facturas);

	}

	facturaCancelar: CXPFacturaProgramacionPagoBeneficiarioProjection = null;
	cancelarFactura(factura: CXPFacturaProgramacionPagoBeneficiarioProjection, proveedor: string) {
		this.facturaCancelar = factura;
		let dialogData: CancelarFacturaDialogData = {
			folioFactura: factura.codigoRegistro,
			nombreProvedor: proveedor,
			monto: factura.montoRegistro,
			codigoMoneda: factura.codigoMoneda,
			onAceptar: this.onAceptarCancelarFactura.bind(this)
		};

		this.dialog.open(CancelarFacturaDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onAceptarCancelarFactura(fechaCancelacion: moment.Moment, motivoCancelacion: string){
		this._programacionPagosService.cargando = true;
		this._programacionPagosService.cancelarFactura(this.facturaCancelar.id,fechaCancelacion.format('YYYY-MM-DD HH:mm:ss.SSSSSSS'),this.facturaCancelar.cxpSolicitudesPagosServicios, motivoCancelacion);
	}

	mostrarResumen(){
		let proveedores: ProveedorProgramacionPagoProjection[] = this.proveedores.filter(proveedor => {
			return this.proveedoresSeleccionados[proveedor.id];
		});
		if(!proveedores.length){
			this._matSnackBar.open('Selecciona al menos una factura', 'OK', {
				duration: 5000,
			});
			return;
		}
		let dialogData: ResumenDialogData = {
			proveedores: proveedores,
			facturasSeleccionadas: this.facturasSeleccionadas,
			montosPagarControlMap: this.montosPagarControlMap
		};

		this.dialog.open(ResumenDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	marcarFactura(factura: CXPFacturaProgramacionPagoBeneficiarioProjection, proveedor: ProveedorProgramacionPagoProjection){
		if(!!this.facturasSeleccionadas[factura.id]){
			this.facturasSeleccionadas[factura.id] = null;
		}else{
			this.facturasSeleccionadas[factura.id] = factura;
			this.montosPagarControlMap[factura.id] = new FormControl(factura.saldo,[Validators.required,Validators.min(0.01),Validators.max(factura.saldo)]);
			this.montosPagarControlMap[factura.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
				this.actualizarCont++;
			});
		}
		this.proveedoresSeleccionados[proveedor.id] = false;
		for(let facturaP of proveedor.facturasProgramacion){
			if(this.facturasSeleccionadas[facturaP.id]){
				this.proveedoresSeleccionados[proveedor.id] = true;
			}
		}
		this.actualizarCont = this.actualizarCont+1;
	}

	editarFactura(factura: CXPFacturaProgramacionPagoBeneficiarioProjection){
		this.router.navigate([`/app/compras/gestion-facturas/editar/${this.hashid.encode(factura.id)}`]);
	}

	onMostrarEvidencia(archivosDescargar: ArchivoProjection | ArchivoProjection[], factura?: CXPFacturaProgramacionPagoBeneficiarioProjection){
		if(Array.isArray(archivosDescargar)){
			let evidenciaIds: number[] = archivosDescargar.map(ev => {
				return Number(ev.id);
			});
			this._programacionPagosService.descargarEvidencia(factura?.id);
		}else{
			this._programacionPagosService.verArchivo(archivosDescargar);
		}
	}

	descargarFactura(factura: CXPFacturaProgramacionPagoBeneficiarioProjection){
		this._programacionPagosService.descargarFactura(factura.id);
	}

	onMostrarFacturas(archivosDescargar: ArchivoProjection | ArchivoProjection[], factura?: CXPFacturaProgramacionPagoBeneficiarioProjection){
		if(Array.isArray(archivosDescargar)){
			let evidenciaIds: number[] = archivosDescargar.map(ev => {
				return Number(ev.id);
			});
			this._programacionPagosService.descargarFactura(factura?.id);
		}else{
			this._programacionPagosService.verArchivo(archivosDescargar);
		}
	}

	setExpansionPanelProveedorOpened(proveedor){
		proveedor.panelOpened = true;
	}

	setExpansionPanelProveedorClosed(proveedor){
		proveedor.panelOpened = false;
	}

	getFiltros(proveedores): FieldConfig[] {
		return [
			{
				type: "pixvsMatSelect",
				label: 'Proveedor',
				name: "proveedores",
				formControl: new FormControl(null),
				validations: [],
				multiple: true,
				selectAll: false,
				list: proveedores,
				campoValor: 'id',
				values: ['nombre']
			},
			{
				type: "input",
				label: 'Número de documento',
				inputType: "text",
				name: "documento",
				validations: []
			},
			{
				type: "button",
				label: "Save",
				hidden: true
			}
		];
	}

	toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

}