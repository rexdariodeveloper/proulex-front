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
import { Validators, FormGroup, FormBuilder, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { MatTabGroup } from '@angular/material/tabs';
import { JsonResponse } from '@models/json-response';
import { environment } from '@environments/environment';
import { SolicitudPagoRHService } from './solicitud-pago-rh.service';
import * as moment from 'moment';
import { CXPSolicitudPago } from '@app/main/modelos/cxpsolicitud';
import { CXPSolicitudPagoDetalle } from '@app/main/modelos/cxpsolicitud-detalle';
import { CXPFactura, CXPSolicitudFacturaEditarProjection } from '@app/main/modelos/cxpfactura';
import { CXPFacturaDetalle } from '@app/main/modelos/cxpfactura-detalle';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { CXPSolicitudPagoRH, CXPSolicitudPagoRHEditarProjection } from '@app/main/modelos/cxpsolicitud-pago-rh';
import { CXPSolicitudPagoRHRetiroCajaAhorro,CXPSolicitudPagoRHRetiroCajaAhorroEditarProjection } from '@app/main/modelos/cxpsolicitud-pago-rh-retiro-caja-ahorro';
import { CXPSolicitudPagoRHPensionAlimenticia } from '@app/main/modelos/cxpsolicitud-pago-rh-pension-alimenticia';
import { CXPSolicitudPagoRHIncapacidad,CXPSolicitudPagoRHIncapacidadEditarProjection } from '@app/main/modelos/cxpsolicitud-pago-rh-incapacidad';
import { CXPSolicitudPagoRHIncapacidadDetalle,CXPSolicitudPagoRHIncapacidadDetalleEditarProjection } from '@app/main/modelos/cxpsolicitud-pago-rh-incapacidad-detalle';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { EmpleadoComboProjection } from '@app/main/modelos/empleado';
import { ControlMaestroMultipleComboProjection } from '@pixvs/models/control-maestro-multiple';

@Component({
	selector: 'solicitud-pago-rh',
	templateUrl: './solicitud-pago-rh.component.html',
	styleUrls: ['./solicitud-pago-rh.component.scss']
})
export class SolicitudPagoRHComponent {
	ControlesMaestrosMultiples = ControlesMaestrosMultiples;

	private URL: string = '/api/v1/solicitud-pago-rh';

	@ViewChild('tabs') tabs: MatTabGroup;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

	localeEN = english;
	localeES = spanish;

	titulo: string;
	pageType: string = 'nuevo';
	currentId: number;
	apiUrl: string = environment.apiUrl;

	config: FichaCRUDConfig;

	form: FormGroup;


	sucursales: SucursalComboProjection[];
	sucursalControl: FormControl = new FormControl();
	empleados: EmpleadoComboProjection[];
	empleadoControl: FormControl = new FormControl();
	tipoSolicitudes: ControlMaestroMultipleComboProjection[];
	tipoSolicitudControl: FormControl = new FormControl();
	tipoRetiros: ControlMaestroMultipleComboProjection[];
	tipoRetiroControl: FormControl = new FormControl();
	incapacidadMovimientos: ControlMaestroMultipleComboProjection[];
	incapacidadTipo: ControlMaestroMultipleComboProjection[];

	retiroCajaAhorro: CXPSolicitudPagoRHRetiroCajaAhorro;
	pensionAlimenticia: CXPSolicitudPagoRHPensionAlimenticia;
	incapacidad: CXPSolicitudPagoRHIncapacidadEditarProjection;

	servicio: any;
	archivoPDF: any;

	fechaActual = moment(new Date()).format('YYYY-MM-DD');

	datosFactura: any = {};
	concepto: any = {};

	solicitud: CXPSolicitudPagoRHEditarProjection = new CXPSolicitudPagoRHEditarProjection();
	private historial: any;

	becarioDocumentoGroup: FormGroup;
	incapacidadGroup: FormGroup;
	incapacidadDetalleTipo: CXPSolicitudPagoRHIncapacidadDetalleEditarProjection[];
	incapacidadDetalleMovimiento: CXPSolicitudPagoRHIncapacidadDetalleEditarProjection[];
	retiroCajaAhorroGroup: FormGroup;
	pensionAlimenticiaGroup: FormGroup;
	documentoBecarioGroup: FormGroup;
	facturaGroup: FormGroup;
	facturaDetalle: FormGroup;
    documentoBecarioGroupIndex: number = null;
    documentoBecarioEnEdicion: boolean = false;
    documentoBecarios: FormArray;


	// Private
	private _unsubscribeAll: Subject < any > ;

	valorImporteXml: number;

	solicitudSelected: number;

	displayedColumnsTipo: string[] = ['tipo.valor', 'salarioDiario','porcentaje', 'dias', 'importeTotal'];
	displayedColumnsMovimiento: string[] = ['tipoMovimiento.valor', 'salarioDiario'];

	archivos = [];
	archivosFormArray: FormArray = new FormArray([]);

	esCopia: boolean = false;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _snackBar: MatSnackBar,
		private _fuseSidebarService: FuseSidebarService,
		private _fuseNavigationService: FuseNavigationService,
		private _solicitudRHService: SolicitudPagoRHService,
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

			// if(this.pageType == 'copia'){
			// 	this.pageType = 'editar';
			// 	this.esCopia = true;
			// }

			this.currentId = this.hashid.decode(id);

			this.config = {
				rutaAtras: "/app/compras/solicitud-pago-rh",
				rutaAprobar: this.URL + "/alerta/aprobar/",
				rutaBorrar: "/api/v1/solicitud-pago-rh/delete/",
                rutaRechazar: this.URL + "/alerta/rechazar/",
				icono: "how_to_reg"
			}

			// this._solicitudService.getDatos();

		});

		this.route.queryParamMap.subscribe(qParams => {
			if(qParams.get('esCopia') == 'true'){
				this.esCopia = true;
				// if(!!this.form?.controls){
				// 	this.form.enable();
				// 	this.form.controls['id'].setValue(null);
				// 	this.form.controls['fechaCreacion'].setValue(moment().format('YYYY-MM-DD'));
				// }
			}
		});

		// Subscribe to update proveedor on changes
        this._solicitudRHService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos && datos.solicitud) {
                    this.solicitud = datos.solicitud;
                    this.titulo = this.solicitud.codigo;
                } else {
                    this.solicitud = new CXPSolicitudPagoRHEditarProjection();
                }

				this.sucursales = datos.sucursales;
				this.tipoSolicitudes = datos.tipoSolicitudes;
				this.tipoRetiros = datos.tipoRetiros;
				this.empleados = datos.empleados;
				this.incapacidadMovimientos = datos.incapacidadMovimientos;
				this.incapacidadTipo = datos.incapacidadTipo;

                this.form = this.createForm();

                if (this.pageType == 'ver' || this.pageType == 'alerta') {
                    this.form.disable();
                    this.retiroCajaAhorroGroup.disable();
                    this.pensionAlimenticiaGroup.disable();
                    this.incapacidadGroup.disable();
                } else {
                    this.form.enable();
                    //this.usuarioGroup.enable();
                }
                this.form.get('fechaCreacion').disable();
                this.form.get('sucursal').disable();
                /*this._solicitudRHService.onPDFChanged
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe(archivoId => {
					if (archivoId) {
						this._solicitudRHService.onPDFChanged.next(null);
						//this.archivoPDF.id = archivoId;
						
					}
				});*/
                
				if(this.esCopia){
					this.form.enable();
					this.retiroCajaAhorroGroup.enable();
                    this.pensionAlimenticiaGroup.enable();
                    this.incapacidadGroup.enable();
					this.form.controls['fechaCreacion'].disable();
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

		this.sucursalControl = new FormControl(this.solicitud.sucursal, [Validators.required]);
		this.empleadoControl = new FormControl(this.solicitud.empleado, [Validators.required]);
        this.tipoSolicitudControl = new FormControl(this.solicitud.tipoPago, [Validators.required]);
		

        if(this.solicitud.cajaAhorro && this.solicitud.cajaAhorro.length >0){
        	this.retiroCajaAhorroGroup =  this.createFormRetiroCajaAhorro(this.solicitud.cajaAhorro[0],this.solicitud);
        }
        else{
        	this.retiroCajaAhorroGroup = this.createFormRetiroCajaAhorro(null,this.solicitud)
        }

        if(this.solicitud.pensionAlimenticia){
        	this.pensionAlimenticiaGroup =  this.createFormPensionAlimenticia(this.solicitud.pensionAlimenticia[0],this.solicitud);
        }
        else{
        	this.pensionAlimenticiaGroup = this.createFormPensionAlimenticia(null,this.solicitud)
        }
        if(this.solicitud.incapacidad){
        	this.incapacidadGroup = this.createFormIncapacidad(this.solicitud.incapacidad[0],this.solicitud);
        }
        else{
        	this.incapacidadGroup = this.createFormIncapacidad(null,this.solicitud);
        }
        if(this.solicitud.becarioDocumentos){
        	this.solicitud.becarioDocumentos.forEach(documento =>{
        		this.archivos.push({
        			id: documento.archivo.id,
        			nombreOriginal: documento.archivo.nombreOriginal
        		})
        	})
        }
        let form = this._formBuilder.group({
            id: [this.esCopia ? null : this.solicitud.id],
            empleado: this.empleadoControl,
            sucursal: this.sucursalControl,
            tipoPago: this.tipoSolicitudControl,
            monto: new FormControl(this.solicitud.monto),
            comentarios: new FormControl(this.solicitud.comentarios),
            fechaCreacion: new FormControl(this.esCopia ? moment().format('YYYY-MM-DD') : (this.solicitud.fechaCreacion? moment(this.solicitud.fechaCreacion).format('YYYY-MM-DD'): this.fechaActual)),
        });


        this.empleadoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.empleadoControl.value){
            	this.sucursalControl.setValue(this.empleadoControl.value.sucursal);
            }
		});

		this.tipoSolicitudControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.tipoSolicitudControl.value){
            	this.solicitudSelected = this.tipoSolicitudControl.value.id;
            	if(this.pageType != 'editar' && this.pageType != 'ver' && this.pageType != 'alerta' && this.retiroCajaAhorroGroup && this.solicitudSelected == ControlesMaestrosMultiples.CMM_CPXSPRH_TipoPago.RETIRO_CAJA_AHORRO){
            		this.retiroCajaAhorroGroup.get('tipoRetiro').reset();
            		this.retiroCajaAhorroGroup.get('ahorroAcumulado').reset();
            		this.retiroCajaAhorroGroup.get('cantidadRetirar').reset();
            		this.retiroCajaAhorroGroup.get('motivoRetiro').reset();
            	}
            	if(this.pageType != 'editar' && this.pageType != 'ver' && this.pageType != 'alerta' && this.pensionAlimenticiaGroup && this.solicitudSelected == ControlesMaestrosMultiples.CMM_CPXSPRH_TipoPago.PENSION_ALIMENTICIA){
            		this.pensionAlimenticiaGroup.get('nombreBeneficiario').reset();
            		this.pensionAlimenticiaGroup.get('numeroResolucion').reset();
            		this.pensionAlimenticiaGroup.get('monto').reset();
            	}
            	if(this.pageType != 'editar' && this.pageType != 'ver' && this.pageType != 'alerta' && this.solicitudSelected == ControlesMaestrosMultiples.CMM_CPXSPRH_TipoPago.PAGO_BECARIO){
            		this.form.get('monto').reset();
            	}
            	if(this.pageType != 'editar' && this.pageType != 'ver' && this.pageType != 'alerta' && this.incapacidadGroup && this.solicitudSelected == ControlesMaestrosMultiples.CMM_CPXSPRH_TipoPago.INCAPACIDAD_PERSONAL){
            		this.incapacidadGroup.get('folioIncapacidad').reset();
            		this.incapacidadGroup.get('fechaInicio').reset();
            		this.incapacidadGroup.get('fechaFin').reset();
            		this.incapacidadDetalleTipo.forEach(detalle =>{
            			detalle.dias = 0;
            			detalle.salarioDiario = 0;
            			//detalle.porcentaje = null;
            		});

            		this.incapacidadDetalleMovimiento.forEach(detalle =>{
            			detalle.salarioDiario = 0;
            		});
            	}
            }
		});

		this.pensionAlimenticiaGroup.get('monto').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            this.form.get('monto').setValue(this.pensionAlimenticiaGroup.get('monto').value);
        });

		return form;
	}

	createFormRetiroCajaAhorro(retiroCajaAhorro: CXPSolicitudPagoRHRetiroCajaAhorro, solicitud: CXPSolicitudPagoRHEditarProjection){
		this.retiroCajaAhorro = retiroCajaAhorro ? retiroCajaAhorro: new CXPSolicitudPagoRHRetiroCajaAhorro();
		this.tipoRetiroControl = new FormControl(this.retiroCajaAhorro.tipoRetiro, [Validators.required]);
		let form: FormGroup = this._formBuilder.group({
			id:[this.esCopia ? null : this.retiroCajaAhorro.id],
			cpxSolicitudPagoRhId: new FormControl(solicitud.id, []),
			tipoRetiro: this.tipoRetiroControl,
			ahorroAcumulado: new FormControl(this.retiroCajaAhorro.ahorroAcumulado, [Validators.required]),
			cantidadRetirar: new FormControl(this.retiroCajaAhorro.cantidadRetirar, [Validators.required]),
			motivoRetiro: new FormControl(this.retiroCajaAhorro.motivoRetiro, [Validators.required, Validators.maxLength(100)])
		});
		return form;
	}

	createFormPensionAlimenticia(pensionAlimenticia: CXPSolicitudPagoRHPensionAlimenticia, solicitud: CXPSolicitudPagoRHEditarProjection){
		this.pensionAlimenticia = pensionAlimenticia ? pensionAlimenticia: new CXPSolicitudPagoRHPensionAlimenticia();

		let form = this._formBuilder.group({
			id:[this.esCopia ? null : this.pensionAlimenticia.id],
			cpxSolicitudPagoRhId: new FormControl(solicitud.id),
			nombreBeneficiario: new FormControl(this.pensionAlimenticia.nombreBeneficiario, [Validators.required]),
			numeroResolucion: new FormControl(this.pensionAlimenticia.numeroResolucion, [Validators.required]),
			monto: new FormControl(solicitud.monto, [Validators.required])
		});


		return form;
	}

	createFormIncapacidad(incapacidad: CXPSolicitudPagoRHIncapacidadEditarProjection, solicitud: CXPSolicitudPagoRHEditarProjection){
		this.incapacidad = incapacidad ? incapacidad: new CXPSolicitudPagoRHIncapacidadEditarProjection();
		this.incapacidadDetalleTipo = [];
		this.incapacidadDetalleMovimiento = [];
		if(this.incapacidad.detalles){
			this.incapacidad.detalles.forEach(detalle => {
				if(detalle.tipo){
					this.incapacidadDetalleTipo.push(detalle);
				}
				else{
					this.incapacidadDetalleMovimiento.push(detalle);
				}
                
            });
		}
		else{
			this.createIncapacidadesDetalles();
		}

		let form = this._formBuilder.group({
			id:[this.esCopia ? null : this.incapacidad.id],
			cpxSolicitudPagoRhId: new FormControl(solicitud.id),
			folioIncapacidad: new FormControl(this.incapacidad.folioIncapacidad, [Validators.required]),
			fechaInicio: new FormControl(this.incapacidad.fechaInicio  ? moment(this.incapacidad.fechaInicio).format('YYYY-MM-DD'): null, [Validators.required]),
			fechaFin: new FormControl(this.incapacidad.fechaFin ? moment(this.incapacidad.fechaFin).format('YYYY-MM-DD'): null, [Validators.required]),
			//detalles: this.incapacidadDetalleTipo.concat(this.inc)
		});


		return form;
	}

	createIncapacidadesDetalles(){
		this.incapacidadTipo.forEach(tipo =>{
			this.incapacidadDetalleTipo.push({
				id: null,
				incapacidadId: this.incapacidad.id,
				tipo: tipo,
				tipoMovimiento: null,
				salarioDiario: 0,
				porcentaje: 0,
				dias: 0
			})
		});

		this.incapacidadMovimientos.forEach(movimiento =>{
			this.incapacidadDetalleMovimiento.push({
				id: null,
				incapacidadId: this.incapacidad.id,
				tipo: null,
				tipoMovimiento: movimiento,
				salarioDiario: 0,
				porcentaje: null,
				dias: null
			})
		});
	}

	setDatosFactura(){
		//this.solicitud.id = null;

		//Crear detalle de factura
		let formDetalle = this._formBuilder.group({
			id:[null],
			reciboId: new FormControl(null),
			numeroLinea: new FormControl(1),
			descripcion: new FormControl('Pago servicios rh'),
			cantidad: new FormControl(1),
			precioUnitario: new FormControl(1),
			iva: new FormControl(0),
			ivaExento: new FormControl(false),
			ieps: new FormControl(0),
			iepsCuotaFija: new FormControl(0),
			tipoRegistroId: new FormControl(ControlesMaestrosMultiples.CMM_CXPF_TipoRegistro.FACTURA_SERVICIO_CXP),
			descuento: new FormControl(0.00),
			tipoRetencionId: new FormControl(null),
			ordenCompraDetalleId: new FormControl(null) ,
			cantidadRelacionar: new FormControl(null) ,
			articuloId: new FormControl(null)

		});
		
		//Crear factura
		let form = this._formBuilder.group({
			id:[null],
			codigoRegistro: new FormControl(''),
			tipoRegistroId: new FormControl(ControlesMaestrosMultiples.CMM_CXPF_TipoRegistro.FACTURA_SERVICIO_CXP),
			//proveedorId: new FormControl(null),
			fechaRegistro: new FormControl(this.fechaActual),
			fechaReciboRegistro:new FormControl(this.fechaActual),
			//monedaId:new FormControl(null),
			//paridadUsuario: new FormControl(null),
			//diasCredito:new FormControl(null),
			//montoRegistro: new FormControl(this.form.get('monto').value),
			fechaPago:new FormControl(this.fechaActual),
			comentarios: new FormControl('Pago solicitud'),
			tipoPagoId: new FormControl(ControlesMaestrosMultiples.CMM_CCXP_TipoPago.PAGO_PROGRAMADO),
			//uuid: new FormControl(null),
			estatusId: new FormControl(2000116),
			//facturaXMLId:new FormControl(null),
			//facturaPDFId:new FormControl(null),
			//monedaCodigo:new FormControl(null),
			detalle:formDetalle
		});

		
		this.form.addControl('factura',form);
	}

	guardar(event) {
		//Revisar que solicitud se va a guardar
		let noMontoNecesario = true;

		if(this.solicitudSelected == ControlesMaestrosMultiples.CMM_CPXSPRH_TipoPago.RETIRO_CAJA_AHORRO){
			if(!this.retiroCajaAhorroGroup.valid){
				this.retiroCajaAhorroGroup.markAllAsTouched();
			}
			let formCajaTemp : FormArray = new FormArray([]);
			formCajaTemp.insert(0,this.retiroCajaAhorroGroup);
			this.form.addControl('cajaAhorro',formCajaTemp);
		}
		if(this.solicitudSelected == ControlesMaestrosMultiples.CMM_CPXSPRH_TipoPago.PENSION_ALIMENTICIA){
			if(!this.pensionAlimenticiaGroup.valid){
				this.pensionAlimenticiaGroup.markAllAsTouched();
			}
			let formPensionTemp : FormArray = new FormArray([]);
			formPensionTemp.insert(0,this.pensionAlimenticiaGroup);
			this.form.addControl('pensionAlimenticia',formPensionTemp);
		}
		if(this.solicitudSelected == ControlesMaestrosMultiples.CMM_CPXSPRH_TipoPago.INCAPACIDAD_PERSONAL){
			if(!this.incapacidadGroup.valid){
				this.incapacidadGroup.markAllAsTouched();
			}
			let detallesIncapacidades = this.incapacidadDetalleMovimiento.concat(this.incapacidadDetalleTipo);
			this.incapacidadGroup.addControl('detalles',this.setIncapacidadesDetalles(detallesIncapacidades));
			let formIncapacidadTemp : FormArray = new FormArray([]);
			formIncapacidadTemp.insert(0,this.incapacidadGroup);
			this.form.addControl('incapacidad',formIncapacidadTemp);
		}
		if(this.solicitudSelected == ControlesMaestrosMultiples.CMM_CPXSPRH_TipoPago.PAGO_BECARIO){
			if(!this.form.get('monto').value && this.form.get('monto').value>=0){
				noMontoNecesario = false;
			}
		}
		if(this.archivos && this.archivos.length>0){
			this.setArchivosRH(this.archivos);
			this.form.addControl('becarioDocumentos',this.archivosFormArray);
		}

		this._solicitudRHService.cargando = true;

		if (!this.form.valid) {
			this.form.markAllAsTouched();
		}

		/*if(this.servicio.requierePDF && !this.archivoPDF){
			this._matSnackBar.open(this.translate.instant('ERROR.PDF'), 'OK', {
				duration: 5000,
			});
			this._solicitudRHService.cargando = false;
			return;
		}*/
		if(noMontoNecesario){
			if (this.form.valid) {
				this.form.disable({
					emitEvent: false
				});

				//this.setDatosFactura();
				let formRaw = this.form.getRawValue();
				if(this.esCopia){
					if(!!formRaw.cajaAhorro?.length){
						formRaw.cajaAhorro.forEach(cajaAhorro => {
							cajaAhorro.id = null;
						});
					}
					if(!!formRaw.pensionAlimenticia?.length){
						formRaw.pensionAlimenticia.forEach(pensionAlimenticia => {
							pensionAlimenticia.id = null;
						});
					}
				}

				this._solicitudRHService.guardar(JSON.stringify(formRaw), '/api/v1/solicitud-pago-rh/save').then(
					(result: JsonResponse) => {
						if (result.status == 200) {
							this._matSnackBar.open('Solicitud con el código '+result.data+' guardado con éxito', 'OK', {
								duration: 5000,
							});
							this.router.navigate([this.config.rutaAtras])
						} else {
							this._solicitudRHService.cargando = false;
							this.form.enable({
								emitEvent: false
							});
						}
					}
				);
			} else {
				this._solicitudRHService.cargando = false;
				this.form.enable({
					emitEvent: false
				});

				this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
					duration: 5000,
				});
			}
		}
		else{
			this._matSnackBar.open('Favor de agregar un monto', 'OK', {
				duration: 5000,
			});
		}

		
	}

	isRequired(campo: string, form: FormGroup) {

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
			this._solicitudRHService.subirArchivo(archivo,"").then(archivoResponse =>{
				this.archivos.push({
					nombreOriginal: archivo.name,
					id:archivoResponse.data
				});
			});
		}
	}

	descargarPDF(archivo: any){
		if(archivo){
			this._solicitudRHService.verArchivo(archivo);
		}
	}

	getTotalCostTipo() {
		let totalTipo = 0;
		this.incapacidadDetalleTipo.forEach(detalle =>{
			totalTipo = totalTipo + (detalle.dias * (detalle.porcentaje / 100) * detalle.salarioDiario);
		});
		return totalTipo;
	    //return this.incapacidadDetalleTipo.map(t => t.salarioDiario).reduce((acc, value) => acc + value, 0);
	}

	getTotalCostMovimiento() {
		let totalMovimiento = 0;
		this.incapacidadDetalleMovimiento.forEach(detalle =>{
			if(detalle.tipoMovimiento){
				totalMovimiento = totalMovimiento + (Number(detalle.salarioDiario));
			}
		});
		return totalMovimiento;
	    //return this.incapacidadDetalleTipo.map(t => t.tipoMovimiento ? t.salarioDiario: 0).reduce((acc, value) => acc + value, 0);
	}

	getTotalCost(){

	}

	setIncapacidadesDetalles(detalles: CXPSolicitudPagoRHIncapacidadDetalleEditarProjection[]){
		let formArray: FormArray = new FormArray([]);
		detalles.forEach(detalle =>{
			let form = this._formBuilder.group({
				id: null,
				incapacidadId: new FormControl(this.incapacidad.id),
				tipo: detalle.tipo,
				tipoMovimiento: detalle.tipoMovimiento,
				salarioDiario: detalle.salarioDiario,
				porcentaje: detalle.porcentaje,
				dias: detalle.dias
			});
			formArray.push(form);
		});
		return formArray;
	}

	setArchivosRH(archivos: any[]){
		archivos.forEach(archivo =>{
			let form = this._formBuilder.group({
				id:[null],
				archivoId: new FormControl(archivo.id)
			})
			this.archivosFormArray.push(form);
		});
	}

}