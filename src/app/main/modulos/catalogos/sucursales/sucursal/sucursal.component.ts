import { Component, ViewChild, HostListener } from '@angular/core';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { HashidsService } from '@services/hashids.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { Validators, FormGroup, FormBuilder, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ArticuloFamiliaComboProjection } from '@app/main/modelos/articulo-familia';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Sucursal } from '@app/main/modelos/sucursal';
import { SucursalPlantelEditarProjection } from '@app/main/modelos/sucursal-plantel';
import { ListadoPrecioComboProjection } from '@app/main/modelos/listado-precio';
import { MatTabGroup } from '@angular/material/tabs';
import { JsonResponse } from '@models/json-response';
import { environment } from '@environments/environment';
import { PaisComboProjection } from '@app/main/modelos/pais';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { UsuarioComboProjection } from '@models/usuario';
import { LocalidadComboProjection } from '@app/main/modelos/localidad';
import { AlmacenComboProjection } from '@app/main/modelos/almacen';
import { SucursalService } from './sucursal.service';
import { SucursalImpresoraFamiliaEditarProjection } from '@app/main/modelos/sucursal-impresora-familia';
import { ControlesMaestrosMultiples as CMM_MAPEO } from '@modelos/mapeos/controles-maestros-multiples';
import { SucursalFormasPagoEditar } from '../../../../modelos/sucursal-formas-pago';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { MedioPagoPVComboProjection } from '@app/main/modelos/medio-pago-pv';
import { CuentaBancariaComboProjection } from '@app/main/modelos/cuentas';

const MAX_28: number = 9999999999999999999999999999.99;

@Component({
	selector: 'sucursal',
	templateUrl: './sucursal.component.html',
	styleUrls: ['./sucursal.component.scss']
})
export class SucursalComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	@ViewChild('tabs') tabs: MatTabGroup;

	localeEN = english;
	localeES = spanish;

	titulo: string;
	pageType: string = 'nuevo';
	currentId: number;
	apiUrl: string = environment.apiUrl;

	config: FichaCRUDConfig;

	form: FormGroup;

	sucursal: Sucursal;

	responsableControl: FormControl = new FormControl();
	coordinadorControl: FormControl = new FormControl();
	tipoFacturaGlobalControl: FormControl = new FormControl();
	
	tiposFacturaGlobal: ControlMaestroMultipleComboProjection[];
	usuarios: UsuarioComboProjection[];

	paisControl: FormControl = new FormControl();
	paises: PaisComboProjection[];

	@ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;
	estadoControl: FormControl = new FormControl();
	estados: EstadoComboProjection[];
	estadosPlantel: EstadoComboProjection[];

	activoControl: FormControl = new FormControl();
	predeterminadaControl: FormControl = new FormControl();

	tipoSucursalControl: FormControl = new FormControl();
	tiposSucursal: ControlMaestroMultipleComboProjection[];
	listados: ListadoPrecioComboProjection[];
	listadoPrecioControl: FormControl = new FormControl();
	almacenesControl: FormControl = new FormControl();
	cuentaBancariaControl: FormControl = new FormControl();
	cuentasBancarias: CuentaBancariaComboProjection[] = [];

	// formPOS: FormGroup[];
	permisoConfigPV = null;
	impresorasFamilias: SucursalImpresoraFamiliaEditarProjection[];
	tipoImpresoras: ControlMaestroMultipleComboProjection[];
	familias: ArticuloFamiliaComboProjection[];
	almacenes: AlmacenComboProjection[];
	impresorasTipoCMM = CMM_MAPEO.CMM_IMP_TipoImpresion;
	// Formas de pago
	formasPago = [];
	sucursalFormasPago: SucursalFormasPagoEditar[];

	selectTodosDias: boolean = false;

	mediosPagoPVControl: FormControl = new FormControl();
	mediosPagoPV: MedioPagoPVComboProjection[] = [];

	// Private
	private _unsubscribeAll: Subject<any>;

	plantelEditar: SucursalPlantelEditarProjection = null;
	idContactoTmp: number = 1;

	formPlantel: FormGroup;
	responsablePlantelControl: FormControl = new FormControl();
	almacenPlantelControl: FormControl = new FormControl();
	@ViewChild('localidadPlantelSelect') localidadPlantelSelect: PixvsMatSelectComponent;
	localidadPlantelControl: FormControl = new FormControl();
	localidades: LocalidadComboProjection[];
	paisPlantelControl: FormControl = new FormControl();
	@ViewChild('estadoPlantelSelect') estadoPlantelSelect: PixvsMatSelectComponent;
	estadoPlantelControl: FormControl = new FormControl();
	telefonoFijoPlantelControl: FormControl = new FormControl();
	telefonoMovilPlantelControl: FormControl = new FormControl();
	telefonoTrabajoPlantelControl: FormControl = new FormControl();
	telefonoTrabajoExtensionPlantelControl: FormControl = new FormControl();
	telefonoMensajeriaInstantaneaPlantelControl: FormControl = new FormControl();

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _snackBar: MatSnackBar,
		private _fuseSidebarService: FuseSidebarService,
		private _fuseNavigationService: FuseNavigationService,
		private _sucursalService: SucursalService,
		private hashid: HashidsService,
		private router: Router,
		private translate: TranslateService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private _formBuilder: FormBuilder,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar
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
			if (this.pageType == 'nuevo') {
				this.sucursal = new Sucursal();
			}

			this.config = {
				rutaAtras: "/app/catalogos/sucursales",
				rutaBorrar: "/api/v1/sucursales/delete/",
				icono: "store"
			}

		});

		this.serviceSubscriptions();
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	serviceSubscriptions() {
		this._sucursalService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
			if (datos) {
				this.sucursal = datos.sucursal || new Sucursal();

				if (this.sucursal?.id) {
					this.titulo = this.sucursal.codigoSucursal;
					this.getComboEstados(this.sucursal.paisId);
				}

				(this.sucursal.planteles || []).forEach(plantel => {
					plantel.idTmp = this.idContactoTmp++;
				});

				this.paises = datos.paises;
				this.usuarios = datos.usuarios;
				this.tiposSucursal = datos.tiposSucursal;
				this.almacenes = datos.almacenes;
				this.cuentasBancarias = datos.cuentasBancarias;
				this.tiposFacturaGlobal = datos.tiposFacturaGlobal;

				// POS
				this.permisoConfigPV = datos.permisoCMA;
				this.tipoImpresoras = datos.tipoImpresoras;
				this.familias = datos.familias;
				this.impresorasFamilias = datos.impresoras;
				// formas de pago;
				this.sucursalFormasPago = datos.formasPagoSucursal;
				this.formasPago = datos.formasPago;
				this.listados = datos.listado;
				this.mediosPagoPV = datos.mediosPagoPV;
				this.createForms();
			}
		});
	}

	createForms() {
		this.form = this.createForm();
		this.formPlantel = this.createPlantelForm();
		// this.createFormPOS();

		if (this.pageType == 'ver') {
			this.form.disable({
				emitEvent: false
			});

		} else {
			this.form.enable({
				emitEvent: false
			});

		}

	}


	createForm(): FormGroup {
		this.responsableControl = new FormControl(this.sucursal.responsable, [Validators.required]);
		this.coordinadorControl = new FormControl(this.sucursal.coordinador, [Validators.required]);
		this.tipoFacturaGlobalControl = new FormControl(this.sucursal.tipoFacturaGlobal, [Validators.required]);
		this.activoControl = new FormControl(this.sucursal.activo || (this.pageType == 'nuevo'), []);
		this.predeterminadaControl = new FormControl(this.sucursal.predeterminada || false, []);
		this.tipoSucursalControl = new FormControl(this.sucursal.tipoSucursal, [Validators.required]);
		this.cuentaBancariaControl = new FormControl(this.sucursal.cuentaBancaria, []);

		this.paisControl = new FormControl(this.sucursal.pais, [Validators.required]);
		this.estadoControl = new FormControl(this.sucursal.estado, [Validators.required]);
		this.listadoPrecioControl = new FormControl(this.sucursal.listadoPrecio);

		this.mediosPagoPVControl = new FormControl(this.sucursal?.mediosPagoPV || [], [Validators.required]);

		this.paisControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.sucursal.pais = this.paisControl.value || null;
			this.estadoSelect.setDatos([]);
			this.estadoControl.setValue(null);
			if (this.paisControl.value) {
				this._sucursalService.getComboEstados(this.paisControl.value.id).then(value => {
					this.estados = value.data;
					this.estadoSelect.setDatos(this.estados);
				});
			}
		});

		if (this.sucursal.pais) {
			if (this.paisControl.value) {
				this._sucursalService.getComboEstados(this.paisControl.value.id).then(value => {
					this.estados = value.data;
					this.estadoSelect.setDatos(this.estados);
				});
			}
		}

		if (this.sucursal.almacenesHijos) {
			this.almacenesControl = new FormControl(this.sucursal.almacenesHijos);
		}


		let form = this._formBuilder.group({
			id: [this.sucursal.id],
			codigoSucursal: new FormControl(this.sucursal.codigoSucursal, [Validators.required, Validators.maxLength(10)]),
			prefijo: new FormControl(this.sucursal.prefijo, [Validators.required, Validators.maxLength(4)]),
			serie: new FormControl(this.sucursal.serie, [Validators.required, Validators.maxLength(4)]),
			nombre: new FormControl(this.sucursal.nombre, [Validators.required, Validators.maxLength(100)]),
			responsable: this.responsableControl,
			coordinador: this.coordinadorControl,
			tipoFacturaGlobal: this.tipoFacturaGlobalControl,
			tipoSucursal: this.tipoSucursalControl,
			cuentaBancaria: this.cuentaBancariaControl,
			porcentajeComision: new FormControl(this.sucursal.porcentajeComision, [Validators.max(100), Validators.min(0)]),
			presupuestoSemanal: new FormControl(this.sucursal.presupuestoSemanal, [Validators.max(MAX_28), Validators.min(0)]),
			activo: this.activoControl,
			predeterminada: this.predeterminadaControl,
			domicilio: new FormControl(this.sucursal.domicilio, [Validators.required, Validators.maxLength(250)]),
			cp: new FormControl(this.sucursal.cp, [Validators.required, Validators.pattern('[0-9]+'), Validators.maxLength(5)]),
			colonia: new FormControl(this.sucursal.colonia, [Validators.required, Validators.maxLength(250)]),
			ciudad: new FormControl(this.sucursal.ciudad, [Validators.required, Validators.maxLength(100)]),
			pais: this.paisControl,
			estado: this.estadoControl,
			plantelesBandera: new FormControl(this.sucursal.plantelesBandera),
			telefono: new FormControl(this.sucursal.telefono, [Validators.required, Validators.maxLength(25)]),
			extension: new FormControl(this.sucursal.extension, [Validators.maxLength(3), Validators.pattern('[0-9]+')]),
			mostrarRed: new FormControl((this.sucursal.mostrarRed || false), []),
			nombreRed: new FormControl((!!this.sucursal.mostrarRed ? (this.sucursal.nombreRed || '') : ''), [Validators.maxLength(100), this.requiredIfValidator(() => this.form.get('mostrarRed').value)]),
			contraseniaRed: new FormControl((!!this.sucursal.mostrarRed ? (this.sucursal.contraseniaRed || '') : ''), [Validators.maxLength(100), this.requiredIfValidator(() => this.form.get('mostrarRed').value)]),
			lunes: new FormControl((this.sucursal.lunes || false), []),
			martes: new FormControl((this.sucursal.martes || false), []),
			miercoles: new FormControl((this.sucursal.miercoles || false), []),
			jueves: new FormControl((this.sucursal.jueves || false), []),
			viernes: new FormControl((this.sucursal.viernes || false), []),
			sabado: new FormControl((this.sucursal.sabado || false), []),
			domingo: new FormControl((this.sucursal.domingo || false), []),
			listadoPrecio: this.listadoPrecioControl,
			almacenes: this.almacenesControl,

			mediosPagoPV: this.mediosPagoPVControl
			// impresoras: this._formBuilder.array([]), // new FormArray([])// this._formBuilder.array(impresoras)
			// formasPago: this._formBuilder.array([])
		});
		if (!!this.permisoConfigPV?.valorAsBoolean) {
			form.addControl('impresoras', this._formBuilder.array([]));
			form.addControl('formasPago', this._formBuilder.array([]));
			// let impresoras: FormArray = new FormArray([]);
			let impresoras = form.get("impresoras") as FormArray;
			this.familias.forEach(familia => {
				const impresora = this.impresorasFamilias.find(element => element.familiaId === familia.id);
				const id = (!!impresora ? impresora.id : null);
				const sucursal = (this.sucursal.id || null);
				const tipoImpresora = (!!impresora ? impresora.tipoImpresoraId : this.impresorasTipoCMM.LOCAL);
				const ip = (!!impresora ? impresora.ip : null);// new FormControl( ( !!impresora ? impresora.ip : null), [] );

				const item = this._formBuilder.group({
					id: id,
					activo: true,
					sucursalId: sucursal,
					familiaId: familia.id,
					tipoImpresoraId: tipoImpresora,
					ip: ip
				});

				impresoras.push(item);

			});

			let sucursalformasPago = form.get("formasPago") as FormArray;
			this.formasPago.forEach(formapago => {
				let sfp = this.sucursalFormasPago.find(item => item.formaPagoId == formapago.id);;
				const formaPagoSucursal = this._formBuilder.group({
					id: (!!sfp ? sfp.id : null),
					sucursalId: this.sucursal.id,
					formaPagoId: formapago.id,
					usarEnPV: (!!sfp ? sfp.usarEnPV : null),
					activo: true
				});
				sucursalformasPago.push(formaPagoSucursal);
			});
		}

		if (this.sucursal.lunes && this.sucursal.martes && this.sucursal.miercoles && this.sucursal.jueves && this.sucursal.viernes
			&& this.sucursal.sabado && this.sucursal.domingo) {
			//this.form.get('todosDias').setValue(true);
			this.selectTodosDias = true;
		}


		return form;
	}

	createPlantelForm(): FormGroup {

		// Inicializar FormControls
		this.localidades = [];
		this.paisPlantelControl = new FormControl(this.plantelEditar?.pais || null, [Validators.required]);
		this.estadoPlantelControl = new FormControl(this.plantelEditar?.estado || null, [Validators.required]);
		this.responsablePlantelControl = new FormControl(this.plantelEditar?.responsable || null, [Validators.required]);
		this.almacenPlantelControl = new FormControl(this.plantelEditar?.almacen || null, [Validators.required]);
		this.localidadPlantelControl = new FormControl(this.plantelEditar?.localidad, [Validators.required]);
		this.telefonoFijoPlantelControl = new FormControl(this.plantelEditar?.telefonoFijo || null, [Validators.maxLength(50)]);
		this.telefonoMovilPlantelControl = new FormControl(this.plantelEditar?.telefonoMovil || null, [Validators.maxLength(50)]);
		this.telefonoTrabajoPlantelControl = new FormControl(this.plantelEditar?.telefonoTrabajo || null, [Validators.maxLength(50)]);
		this.telefonoTrabajoExtensionPlantelControl = new FormControl(this.plantelEditar?.telefonoTrabajoExtension || null, [Validators.maxLength(10)]);
		this.telefonoMensajeriaInstantaneaPlantelControl = new FormControl(this.plantelEditar?.telefonoMensajeriaInstantanea || null, [Validators.maxLength(50)]);
		// Subscripciones FormControl.valueChanges
		if (this.plantelEditar && this.plantelEditar.localidad) {
			this._sucursalService.getComboLocalidades(this.plantelEditar.almacen.id).then(value => {
				this.localidades = value?.data?.datos;
				this.localidadPlantelSelect.setDatos(this.localidades);
				//this.estadoPlantelSelect.setDatos(value.data);
			});
		}
		this.paisPlantelControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if (this.paisPlantelControl.value) {
				this._sucursalService.getComboEstados(this.paisPlantelControl.value.id).then(value => {
					this.estadosPlantel = value.data;
					this.estadoPlantelSelect.setDatos(this.estadosPlantel);
				});
			}
		});

		if (this.plantelEditar?.pais) {
			if (this.paisPlantelControl.value) {
				this._sucursalService.getComboEstados(this.plantelEditar.pais.id).then(value => {
					this.estadosPlantel = value.data;
					this.estadoPlantelSelect.setDatos(this.estadosPlantel);
				});
			}
		}

		this.almacenPlantelControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if (this.almacenPlantelControl.value) {
				this._sucursalService.getComboLocalidades(this.almacenPlantelControl.value.id).then(value => {
					this.localidades = value.data.datos;
					this.localidadPlantelSelect.setDatos(this.localidades);
					//this.estadoPlantelSelect.setDatos(value.data);
				});
			}
		});
		// ...

		// Inicializar Form
		let form = this._formBuilder.group({
			idTmp: [this.plantelEditar?.idTmp || this.idContactoTmp++],
			id: [this.plantelEditar?.id || null],
			codigoSucursal: new FormControl(this.plantelEditar?.codigoSucursal || null, [Validators.required, Validators.maxLength(3)]),
			nombre: new FormControl(this.plantelEditar?.nombre || null, [Validators.required, Validators.maxLength(100)]),
			responsable: this.responsablePlantelControl,
			almacen: this.almacenPlantelControl,
			localidad: this.localidadPlantelControl,
			direccion: new FormControl(this.plantelEditar?.direccion || null, [Validators.required, Validators.maxLength(100)]),
			cp: new FormControl(this.plantelEditar?.cp || null, [Validators.required, Validators.maxLength(5)]),
			colonia: new FormControl(this.plantelEditar?.colonia || null, [Validators.required, Validators.maxLength(100)]),
			pais: this.paisPlantelControl,
			estado: this.estadoPlantelControl,
			municipio: new FormControl(this.plantelEditar?.municipio || null, [Validators.required, Validators.maxLength(100)]),
			correoElectronico: new FormControl(this.plantelEditar?.correoElectronico || null, [Validators.required, Validators.email, Validators.maxLength(50)]),
			telefonoFijo: this.telefonoFijoPlantelControl,
			telefonoMovil: this.telefonoMovilPlantelControl,
			telefonoTrabajo: this.telefonoTrabajoPlantelControl,
			telefonoTrabajoExtension: this.telefonoTrabajoExtensionPlantelControl,
			telefonoMensajeriaInstantanea: this.telefonoMensajeriaInstantaneaPlantelControl,
			activo: new FormControl(true)
		});

		return form;
	}

	guardarPlantel() {
		if (this.formPlantel.valid) {
			if (!this.telefonoFijoPlantelControl.value && !this.telefonoMovilPlantelControl.value && !this.telefonoTrabajoPlantelControl.value && !this.telefonoMensajeriaInstantaneaPlantelControl.value) {
				this._matSnackBar.open('Es necesario ingresar al menos un teléfono para continuar', 'OK', {
					duration: 5000,
				});
				return;
			}

			let plantelGuardar: SucursalPlantelEditarProjection = this.formPlantel.getRawValue();
			let plantelEditar: SucursalPlantelEditarProjection = (this.sucursal.planteles || []).find(plantel => {
				return plantel.idTmp == plantelGuardar.idTmp;
			});
			if (!!plantelEditar) {
				for (let campo in plantelGuardar) {
					plantelEditar[campo] = plantelGuardar[campo];
				}
				this.sucursal.planteles = [].concat(this.sucursal.planteles || []);
			} else {
				this.sucursal.planteles = (this.sucursal.planteles || []).concat(plantelGuardar);
			}
			this.localidadPlantelSelect.setDatos([]);
			this.plantelEditar = null;
			this.limpiarFormularioPlantel();
		}
	}

	cancelarFormularioPlantel() {
		this.plantelEditar = null;
		this.limpiarFormularioPlantel();
	}

	limpiarFormularioPlantel() {
		this.setFormPlantel();
	}

	eliminarPlantel(idTmp: number) {
		this.sucursal.planteles = this.sucursal.planteles.filter(plantel => {
			return plantel.idTmp != idTmp;
		});
		this.limpiarFormularioPlantel();
	}

	editarPlantel(plantel: SucursalPlantelEditarProjection) {
		if (this.form?.enabled) {
			this.plantelEditar = plantel;
			this.limpiarFormularioPlantel();
		}
	}

	setFormPlantel() {
		this.formPlantel = null;
		setTimeout(() => {
			this.formPlantel = this.createPlantelForm();
		});
	}

	disableInput(form: FormGroup, campo: string, inhabilitar: string): void {
		// form.get(campo).setValue(Number(form.get(campo).value));
		const valor = Number(form.get(campo).value);
		if (valor !== this.impresorasTipoCMM.IP) {
			form.controls[inhabilitar].disable();
			form.controls[inhabilitar].setValidators(null);
			form.controls['ip'].setValue('');
		} else {
			form.controls[inhabilitar].enable();
			form.controls[inhabilitar].setValidators([Validators.required]);
		}
	}

	getFormaPago(indice: number): Object {
		const formaspago = this.form.get('formasPago') as FormArray;
		const formapago = formaspago.controls[indice] as FormGroup;

		return this.formasPago.find(fp => fp.id === formapago.controls['formaPagoId'].value);
	}

	getFamilia(indice: number): ArticuloFamiliaComboProjection {
		let impresoras = this.form.get('impresoras') as FormArray;
		let impresora = impresoras.controls[indice] as FormGroup;

		return this.familias.find(familia => familia.id === impresora.controls['familiaId'].value);
	}

	requiredIfValidator(predicate) {
		return (formControl => {
			if (!formControl.parent) {
				return null;
			}
			if (predicate()) {
				return Validators.required(formControl);
			}
			return null;
		})

	}

	guardar(event) {

		this._sucursalService.cargando = true;


		if (!this.form.valid) {
			this.form.markAllAsTouched();
		}

		if (this.form.valid) {
			this.form.disable({
				emitEvent: false
			});

			let almacen = {
				fechaModificacion: this.sucursal.fechaModificacion
			};

			(this.sucursal.planteles || []).forEach(plantel => {
				delete plantel.idTmp;
			});

			let formRaw = this.form.getRawValue();
			formRaw.planteles = this.sucursal.planteles;

			this._sucursalService.guardar(JSON.stringify(formRaw), '/api/v1/sucursales/save').then(
				(result: JsonResponse) => {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.router.navigate([this.config.rutaAtras])
					} else {
						this._sucursalService.cargando = false;
						this.form.enable({
							emitEvent: false
						});
					}
				}
			);
		} else {
			this._sucursalService.cargando = false;
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

	getComboEstados(paisId: number) {
		this._sucursalService.getComboEstados(paisId);
	}

	seleccionarTodosLosDias() {
		this.form.get('lunes').setValue(this.selectTodosDias);
		this.form.get('martes').setValue(this.selectTodosDias);
		this.form.get('miercoles').setValue(this.selectTodosDias);
		this.form.get('jueves').setValue(this.selectTodosDias);
		this.form.get('viernes').setValue(this.selectTodosDias);
		this.form.get('sabado').setValue(this.selectTodosDias);
		this.form.get('domingo').setValue(this.selectTodosDias);
	}

	changeSelectTodos() {
		if (this.form.get('lunes').value && this.form.get('martes').value && this.form.get('miercoles').value
			&& this.form.get('jueves').value && this.form.get('viernes').value
			&& this.form.get('sabado').value && this.form.get('domingo').value) {
			this.selectTodosDias = true;
		}
		else {
			this.selectTodosDias = false;
		}
	}

}