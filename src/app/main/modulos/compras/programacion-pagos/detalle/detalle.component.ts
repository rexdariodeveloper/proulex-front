import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import * as moment from 'moment';
import { ListadoMenuOpciones } from '@models/ficha-listado-config';
import { CXPSolicitudPagoAlertaProjection } from '@app/main/modelos/cxpsolicitud';
import { CXPSolicitudPagoService } from './detalle.service';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { CXPFacturaAlertaCXPSPProjection, CXPFacturaPagoProveedoresProjection } from '@app/main/modelos/cxpfactura';
import { ProveedorComboProjection } from '@app/main/modelos/proveedor';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { CXPSolicitudPagoDetalleAlertaProjection } from '@app/main/modelos/cxpsolicitud-detalle';
import { ArchivoProjection } from '@models/archivo';

@Component({
    selector: 'programacion-pagos-detalle',
    templateUrl: './detalle.component.html',
    styleUrls: ['./detalle.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class CXPSolicitudPagoDetalleComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return true;
	}

	historial;
	acciones: ListadoMenuOpciones[] = [];

	localeEN = english;
	localeES = spanish;

	pageType: string = 'ver';

    config: FichaCRUDConfig;
    titulo: string;
	subTitulo: string = 'Tipo: Programación de pago';
	puedeEditar: boolean = false;

    cxpSolicitudPago: CXPSolicitudPagoAlertaProjection;
	form: FormGroup;

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;
	
	currentId: number;
	currentFechaModificacion: any = null;

	montoProgramado: number = 0;
	totalProveedores: number = 0;
	totalFacturas: number = 0;
	proveedores: ProveedorComboProjection[] = [];
	montosProveedoresMap: {[proveedorId:number]: number} = {};
	// cxpFacturasMapProveedorId: {[proveedorId:number]: CXPFacturaAlertaCXPSPProjection[]} = {};
	detallesMapProveedorId: {[proveedorId:number]: CXPSolicitudPagoDetalleAlertaProjection[]} = {};
	foliosMap: {[proveedorId:number]: string} = {};
	montoAutorizar: number = 0;
    beneficiarios = [];

	cxpFacturasSeleccionadas: {[cxpFacturaId:number]: boolean} = {};
	/**
	 * valor<0 => ninguna factura relacionada al proveedor seleccionada
	 * valor==0 => por lo menos una factura relacionada al proveedor seleccionada
	 * valor>0 => todas las facturas relacionadas al proveedor seleccionadas
	 */
	proveedoresSeleccionados: {[proveedorId:number]: number} = {};

	montosProgramadosMapFactura: {[cxpFacturaId:number]: number} = {};

	private cxpFacturasDocumentosMap: {[cxpFacturaId:number]: CXPFacturaPagoProveedoresProjection} = {};

	alertaEnProceso: boolean = false;

    // Private
    private _unsubscribeAll: Subject<any>;
	private apiURL: string = '/api/v1/programacion-pagos';

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
        public _cxpSolicitudPagoService: CXPSolicitudPagoService,
        private el: ElementRef,
        public validatorService : ValidatorService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.cxpSolicitudPago = new CXPSolicitudPagoAlertaProjection();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
			let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);

            this.config = {
                rutaAtras: "/app/compras/listado-alertas",
                rutaBorrar: this.apiURL + "/delete/",
				rutaAprobar: this.apiURL + "/alerta/aprobar/",
                rutaRechazar: this.apiURL + "/alerta/rechazar/",
                icono: "credit_card"
            }

        });

        // Subscribe to update requisicion on changes
        this._cxpSolicitudPagoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
				this.cxpSolicitudPago = datos.cxpSolicitudPago;
				this.currentFechaModificacion = this.cxpSolicitudPago.fechaModificacion;
				this.historial = datos.historial;
				this.foliosMap = datos.foliosMap || {};
				if(datos.cxpFacturasDocumentos){
					datos.cxpFacturasDocumentos.forEach(cxpFactura => {
						this.cxpFacturasDocumentosMap[cxpFactura.id] = cxpFactura;
					});
				}

                if(!!datos?.beneficiarios){
                    this.beneficiarios = datos.beneficiarios;
                }

				this.titulo = this.cxpSolicitudPago.codigoSolicitud;
				
				this.alertaEnProceso = datos.alertaEnProceso;
				if(!this.alertaEnProceso){
					this.titulo += ' (' + datos.leyendaAlerta + ')';
				}

				this.setDatos();
				
				this.form = this.createForm();
				if (this.pageType == 'ver') {
                    this.form.disable();
                } else {
                    this.form.enable();
				}
            });

    }


    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }

	createForm(): FormGroup {

		let form = this._formBuilder.group({
            id: [this.cxpSolicitudPago.id],
          	fechaModificacion : this.cxpSolicitudPago.fechaModificacion,
        });

        return form;
    }

	setDatos(){
		let detallesFiltrados: CXPSolicitudPagoDetalleAlertaProjection[] = this.cxpSolicitudPago.detalles.filter(detalle => {
			return detalle.estatusId != ControlesMaestrosMultiples.CMM_CXPS_EstadoSolicitudPago.CANCELADA;
		});
		this.montoProgramado = 0;
		this.totalProveedores = 0;
		this.totalFacturas = detallesFiltrados.length;
		this.detallesMapProveedorId = {};
		this.montosProveedoresMap = {};
		this.montosProgramadosMapFactura = {};
		this.cxpFacturasSeleccionadas = {};
		this.proveedores = [];
        let proveedoresData = [];
		let proveedoresGuardadosIds: number[] = [];
		this.cxpSolicitudPago.detalles.sort((a,b) => {
			return new Date(b.cxpFactura.fechaRegistro).valueOf() - new Date(a.cxpFactura.fechaRegistro).valueOf();
		}).forEach(detalle => {
			if(detalle.estatusId != ControlesMaestrosMultiples.CMM_CXPS_EstadoSolicitudPago.CANCELADA){
				let proveedorId: number = detalle.cxpFactura.proveedor.id;
				if(!proveedoresGuardadosIds.includes(proveedorId)){
					proveedoresGuardadosIds.push(proveedorId);
					proveedoresData.push(detalle.cxpFactura.proveedor);
					this.totalProveedores++;
					this.proveedoresSeleccionados[proveedorId] = 1;
				}
				this.montosProveedoresMap[proveedorId] = (this.montosProveedoresMap[proveedorId] || 0) + detalle.montoProgramado;
				this.detallesMapProveedorId[proveedorId] = (this.detallesMapProveedorId[proveedorId] || []).concat(detalle);
				this.montosProgramadosMapFactura[detalle.cxpFactura.id] = detalle.montoProgramado;
				this.cxpFacturasSeleccionadas[detalle.cxpFactura.id] = true;
			}
			this.montoProgramado += detalle.montoProgramado;
		});
        this.proveedores = proveedoresData.sort((i,j) => i.nombre == j.nombre? 0 : (i.nombre > j.nombre? 1 : -1));
		this.proveedores.map(proveedor => {
			this.detallesMapProveedorId[proveedor.id].sort((a,b) => {
				return a.cxpFactura.fechaRegistro - b.cxpFactura.fechaRegistro;
			});
			
		});
		this.calcularMontoAutorizar();
	}

	marcarFactura(cxpFactura: CXPFacturaAlertaCXPSPProjection){
		this.cxpFacturasSeleccionadas[cxpFactura.id] = !this.cxpFacturasSeleccionadas[cxpFactura.id];
		this.validarProveedorSeleccionado(cxpFactura.proveedor.id);
	}

	validarProveedorSeleccionado(proveedorId: number){
		let tieneFacturasSeleccionadas: boolean = false;
		let tieneFacturasNoSeleccionadas: boolean = false;
		this.montosProveedoresMap[proveedorId] = 0;
		for(let detalle of this.detallesMapProveedorId[proveedorId]){
			if(!tieneFacturasSeleccionadas && this.cxpFacturasSeleccionadas[detalle.cxpFactura.id]){
				tieneFacturasSeleccionadas = true;
			}else if(!tieneFacturasNoSeleccionadas && !this.cxpFacturasSeleccionadas[detalle.cxpFactura.id]){
				tieneFacturasNoSeleccionadas = true;
			}

			if(this.cxpFacturasSeleccionadas[detalle.cxpFactura.id]){
				this.montosProveedoresMap[proveedorId] = this.montosProveedoresMap[proveedorId] + detalle.montoProgramado
			}
		}
		if(tieneFacturasSeleccionadas && tieneFacturasNoSeleccionadas){
			this.proveedoresSeleccionados[proveedorId] = 0;
		}else if(tieneFacturasSeleccionadas){
			this.proveedoresSeleccionados[proveedorId] = 1;
		}else{
			this.proveedoresSeleccionados[proveedorId] = -1;
		}
		this.calcularMontoAutorizar();
	}

	marcarProveedor(proveedor: ProveedorComboProjection){
		// por default se asume que el proveedor se marcó como seleccionado (antes de dar clic estaba intermedio o deseleccionado)
		let valorCXPFacturasSeleccionadas: boolean = true;
		let valorProveedorSeleccionado: number = 1;
		this.montosProveedoresMap[proveedor.id] = 0;
		// en caso contrario, se invierten los nuevos valores para facturas y el proveedor
		if(this.proveedoresSeleccionados[proveedor.id] > 0){
			valorCXPFacturasSeleccionadas = false;
			valorProveedorSeleccionado = -1;
		}
		// se asignan valores
		this.detallesMapProveedorId[proveedor.id].forEach(detalle => {
			this.cxpFacturasSeleccionadas[detalle.cxpFactura.id] = valorCXPFacturasSeleccionadas;
			if(valorCXPFacturasSeleccionadas){
				this.montosProveedoresMap[proveedor.id] += detalle.montoProgramado;
			}
		});
		this.proveedoresSeleccionados[proveedor.id] = valorProveedorSeleccionado;
		this.calcularMontoAutorizar();
	}

	onAprobar(){
		this._cxpSolicitudPagoService.cargando = true;
		let facturasSeleccionadas = false;
		for(let cxpFacturaId in this.cxpFacturasSeleccionadas){
			if(this.cxpFacturasSeleccionadas[cxpFacturaId]){
				facturasSeleccionadas = true;
				break;
			}
		}
		
		if(!facturasSeleccionadas){
			this._matSnackBar.open('Selecciona al menos una factura antes de aprobar', 'OK', {
				duration: 5000,
			});
			this._cxpSolicitudPagoService.cargando = false;
			return;
		}

		this._cxpSolicitudPagoService.aprobarPersonalizado(this.cxpSolicitudPago.id,this.cxpFacturasSeleccionadas,this.cxpSolicitudPago.fechaModificacion);
	}

	calcularMontoAutorizar(){
		this.montoAutorizar = 0;
		for(let proveedorId in this.montosProveedoresMap){
			this.montoAutorizar += this.montosProveedoresMap[proveedorId];
		}
	}

	onMostrarEvidencia(archivosDescargar: ArchivoProjection | ArchivoProjection[], factura?: CXPFacturaPagoProveedoresProjection){
		if(Array.isArray(archivosDescargar)){
			this._cxpSolicitudPagoService.descargarEvidencia(factura?.id);
		}else{
			this._cxpSolicitudPagoService.verArchivo(archivosDescargar);
		}
	}

	onMostrarFactura(archivosDescargar: ArchivoProjection | ArchivoProjection[], factura?: CXPFacturaPagoProveedoresProjection){
		if(Array.isArray(archivosDescargar)){
			this._cxpSolicitudPagoService.descargarFactura(factura?.id);
		}else{
			this._cxpSolicitudPagoService.verArchivo(archivosDescargar);
		}
	}

    getBeneficiario(id: Number): String{
        let data = this.beneficiarios.find(beneficiario => beneficiario.id == id);
        return data.beneficiario;
    }

}