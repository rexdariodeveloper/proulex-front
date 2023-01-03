import { analyzeAndValidateNgModules, ThrowStmt } from '@angular/compiler';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { PaisComboProjection } from '@app/main/modelos/pais';
import { environment } from '@environments/environment';
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { EstadoComboProjection } from '@models/estado';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { MunicipioComboProjection } from '@models/municipio';
import { TranslateService } from '@ngx-translate/core';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ValidatorService } from '@services/validators.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NuevaContratacionService } from './nueva-contratacion.service';
import * as moment from 'moment';
import { EmpleadoBeneficiarioEditarProjection } from '@app/main/modelos/empleado-beneficiario';
import { EmpleadoEditarProjection } from '@app/main/modelos/empleado';
import { EmpleadoDatoSaludEditarProjection } from '@app/main/modelos/empleado-dato-salud';
import { DepartamentoComboResponsabilidadProjection } from '@app/main/modelos/departamento';
import { EmpleadoHorarioEditarProjection } from '@app/main/modelos/empleado-horario';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmpleadoContactoEditarProjection } from '@app/main/modelos/empleado-contacto';
import { MatDialog } from '@angular/material/dialog';
import { ArchivoProjection } from '@models/archivo';
import { EmpleadoDocumentoEditarProjection } from '@app/main/modelos/empleado-documento';
import { fuseAnimations } from '@fuse/animations';
import { DocumentosConfiguracionRHEditarProjection } from '@app/main/modelos/documentos-configuracion-rh';
import { DocumentoDialogComponent, DocumentoDialogData } from '../../../../componentes/dialogs/documento/documento.dialog';
import { EmpleadoContratoEditarProjection } from '@app/main/modelos/empleado-contrato';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { JsonResponse } from '@models/json-response';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { SolicitudNuevaContratacionEditarProjection } from '@app/main/modelos/solicitud-nueva-contratacion';
import { SolicitudNuevaContratacionDetalleEditarProjection } from '@app/main/modelos/solicitud-nueva-contratacion-detalle';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { PuestoComboContratosProjection } from '@modelos/puesto';
import { PuestoHabilidadResponsabilidad } from '@models/puesto-habilidad-responsabilidad';
import { EmpleadoContratoResponsabilidad } from '@modelos/empleado-contrato-responsabilidad';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
import { EmpleadoContratoResponsabilidadComponent, ResponsabilidadDialogData } from './dialogs/responsabilidad/responsabilidad.dialog';

@Component({
  selector: 'app-nueva-contratacion',
  templateUrl: './nueva-contratacion.component.html',
  styleUrls: ['./nueva-contratacion.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class NuevaContratacionComponent implements OnInit, OnDestroy {

  // Configuracion de Slider
  @ViewChild('contenedorFicha') contenedorFicha;
  pasosStepper: string[] = [
		'Datos generales',
		'Datos Laborales',
		'Beneficiarios',
    'Datos Contacto',
    'Documentos'
	];
  pasoSeleccionado: number = 0;
  animationDirection: 'left' | 'right' | 'none';

  // Configuracion de la Ficha
  contadorRegistrosNuevos: number = -1;
  pageType: string = 'nuevo';
  deshabilitarBotones: boolean = true;
  apiUrl: string = environment.apiUrl;
  config: FichaCRUDConfig;
  titulo: String;
  fechaActual = moment(new Date()).format('YYYY-MM-DD');
  regexCURP = "[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}" +
    "(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])" +
    "[HM]{1}" +
    "(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)" +
    "[B-DF-HJ-NP-TV-Z]{3}" +
    "[0-9A-Z]{1}[0-9]{1}$";

  // Ficha
  form: FormGroup;
  formEmpleado: FormGroup = new FormGroup({});
  solicitudNuevaContratacion: SolicitudNuevaContratacionEditarProjection;
  listaSolicitudNuevaContratacionDetalle: FormArray = new FormArray([]);
  //empleadoContrato: EmpleadoContratoEditarProjection = new EmpleadoContratoEditarProjection();
  //listaEmpleado: FormArray = new FormArray([]); 

  // Ficha Card
  esVistaCard: boolean = true;
  configCard: FichaCRUDConfig;

  // Ficha Solicitud (Slider)
  configSolicitud: FichaCRUDConfig;
  currentStep: number;

  // Datos Generales
  datoSaludFormArray: FormArray = new FormArray([]);
  generalForm: FormGroup;
  generalFormArray: FormArray = new FormArray([]);
  saludFormArray: FormArray = new FormArray([]);
  listaSede: SucursalComboProjection[] = [];

  // Las selecciones (Datos Generales)
  listaPais: PaisComboProjection[] = [];
  listaEstadoNacimiento: EstadoComboProjection[] = [];
  @ViewChild('listaEstadoNacimientoSelect') listaEstadoNacimientoSelect: PixvsMatSelectComponent;
  listaEstado: EstadoComboProjection[] = [];
  @ViewChild('listaEstadoSelect') listaEstadoSelect: PixvsMatSelectComponent;
  listaEstadoCivil: ControlMaestroMultipleComboProjection[] = [];
  listaGenero: ControlMaestroMultipleComboProjection[] = [];
  listaGradoEstudio: ControlMaestroMultipleComboProjection[] = [];
  listaNacionalidad: ControlMaestroMultipleComboProjection[] = [];
  listaTipoSangre: ControlMaestroMultipleComboProjection[] = [];
  listaPuestosContrato: ControlMaestroMultipleComboProjection[] = [];

  camposListado: FieldConfig[] = [];

  // Datos Laborales
  empleadoContratoFormGroup: FormGroup;
  listaEmpleadoHorario: FormArray = new FormArray([]);
  dias: string[] = ['Lunes','Martes','Miercoles','Jueves','Viernes'];

  // Las selecciones (Datos Laborales)
  listaJustificacion: ControlMaestroMultipleComboProjection[] = [];
  listaTipoContrato: ControlMaestroMultipleComboProjection[] = [];
  listaDepartamento: DepartamentoComboResponsabilidadProjection[] = [];
  listaTipoHorario: ControlMaestroMultipleComboProjection[] = [];
  listaEstadoLaboral: EstadoComboProjection[] = [];
  @ViewChild('listaEstadoLaboralSelect') listaEstadoLaboralSelect: PixvsMatSelectComponent;
  listaMunicipioLaboral: MunicipioComboProjection[] = [];
  @ViewChild('listaMunicipioLaboralSelect') listaMunicipioLaboralSelect: PixvsMatSelectComponent;

  // Beneficiarios
  beneficiarioGroup: FormGroup;
  beneficiarioGroupIndex: number = null;
  beneficiarioEnEdicion: boolean = false;
  beneficiarios: FormArray = new FormArray([]);

  // Datos de Contacto
  contactoGroup: FormGroup;
  contactoGroupIndex: number = null;
  contactoEnEdicion: boolean = false;
  contactos: FormArray = new FormArray([]);

  responsabilidades: FormArray = new FormArray([]);

  // Documentos
  empleadoDocumento: EmpleadoDocumentoEditarProjection;
  listaEmpleadoDocumento: FormArray = new FormArray([]);
  displayedColumnsEmpleadoDocumento: string[] = [
    'archivo',
    'tipoDocumento',
    'fechaCreacion',
    'creadoPor',
    'acciones'
  ];

  // Las selecciones (Documentos)
  listaTipoDocumento: ControlMaestroMultipleComboProjection[] = [];
  listaDocumentosConfiguracionRH: DocumentosConfiguracionRHEditarProjection[] = [];
  
  // Las selecciones
  listaParentesco: ControlMaestroMultipleComboProjection[] = [];

  // Private
	private _unsubscribeAll: Subject < any > ;

  constructor(
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    private _translateService: TranslateService,
    public _nuevaContratacionService: NuevaContratacionService,
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _el: ElementRef,
    public _validatorService: ValidatorService,
    public _dialog: MatDialog,
    private _router: Router
  ) { 
    this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english,spanish);

    // Establecemos por Default
    this.currentStep = 0;

    // Set the private defaults
		this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._route.paramMap.subscribe(params => {
      this.pageType = params.get("handle");
			let id: string = params.get("id");

      this.pageType = params.get("handle");
      
      this.titulo = 'Solicitud nueva contratación';
     
      this.configCard = {
        //rutaAtras: "/app/ingreso-promocion/nuevas-contrataciones/",
        queryParamsRutaAtras: {
          precargarPrevio: 'true'
        },
        icono: "person"
      };

      this.config = this.configCard;

    });

    // Subscribe to update datos on changes
    this._nuevaContratacionService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
      if (datos && datos.solicitudNuevaContratacion) {
        this.solicitudNuevaContratacion = new SolicitudNuevaContratacionEditarProjection(datos.solicitudNuevaContratacion);
        //this.empleado.datoSalud = datos.empleadoDatoSalud;
        this.titulo = this.solicitudNuevaContratacion.codigo;
      } else {
        this.solicitudNuevaContratacion = new SolicitudNuevaContratacionEditarProjection();
        this.solicitudNuevaContratacion.id = this.contadorRegistrosNuevos;

        // Descontador
        this.contadorRegistrosNuevos--;
      }

      // Inicializar listados
      this.listaSede = datos.listaSede;
      this.listaPais = datos.listaPais;
      this.listaEstadoCivil = datos.listaEstadoCivil;
      this.listaGenero = datos.listaGenero;
      this.listaGradoEstudio = datos.listaGradoEstudio;
      this.listaNacionalidad = datos.listaNacionalidad;
      this.listaTipoSangre = datos.listaTipoSangre;
      this.listaJustificacion = datos.listaJustificacion;
      this.listaTipoContrato = datos.listaTipoContrato;
      this.listaDepartamento = datos.listaDepartamento;
      this.listaTipoHorario = datos.listaTipoHorario;
      this.listaParentesco = datos.listaParentesco;
      this.listaTipoDocumento = datos.listaTipoDocumento;
      this.listaPuestosContrato = datos.listaPuestos;

      this.createSolicitudNuevaContratacionForm();
    });

    

    if (this.pageType == 'ver') {
      //this.formEmpleado.disable();
      //this.form.disable();
      //this.usuarioGroup.disable();
      this.deshabilitarBotones = false;
    } else {
      //this.formEmpleado.enable();
        //this.usuarioGroup.enable();
    }

    this._nuevaContratacionService.onListaEstadoNacimientoChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((_listaEstadoNacimiento: EstadoComboProjection[]) => {
      if (_listaEstadoNacimiento != null) {
        this.listaEstadoNacimiento = _listaEstadoNacimiento;
        //this.formEmpleado.controls['estadoNacimiento'].setValue(null);
        if(!!this.listaEstadoNacimientoSelect){
          this.listaEstadoNacimientoSelect.setDatos(this.listaEstadoNacimiento);
        }
      }
		});

    this._nuevaContratacionService.onListaEstadoChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((_listaEstado: EstadoComboProjection[]) => {
      if (_listaEstado != null) {
        this.listaEstado = _listaEstado;
        //this.formEmpleado.controls['estado'].setValue(null);
        if(!!this.listaEstadoSelect){
          this.listaEstadoSelect.setDatos(this.listaEstado);
        }
      }
		});

    this._nuevaContratacionService.onListaEstadoLaboralChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((_listaEstadoLaboral: EstadoComboProjection[]) => {
      if (_listaEstadoLaboral != null) {
        this.listaEstadoLaboral = _listaEstadoLaboral;
        //(this.listaEmpleadoLaboral.controls[0] as FormGroup).controls['estado'].setValue(null);
        //(this.listaEmpleadoLaboral.controls[0] as FormGroup).controls['municipio'].setValue(null);
        if(!!this.listaEstadoLaboralSelect){
          this.listaEstadoLaboralSelect.setDatos(this.listaEstadoLaboral);
        }
      }
		});

    this._nuevaContratacionService.onListaMunicipioLaboralChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((_listaMunicipioLaboral: MunicipioComboProjection[]) => {
      if (_listaMunicipioLaboral != null) {
        this.listaMunicipioLaboral = _listaMunicipioLaboral;
        //(this.listaEmpleadoLaboral.controls[0] as FormGroup).controls['municipio'].setValue(null);
        if(!!this.listaMunicipioLaboralSelect){
          this.listaMunicipioLaboralSelect.setDatos(this.listaMunicipioLaboral);
        }
      }
		});

    this._nuevaContratacionService.onListaDocumentosConfiguracionRHChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((_listaDocumentosConfiguracionRH: DocumentosConfiguracionRHEditarProjection[]) => {
      if (_listaDocumentosConfiguracionRH != null) {
        this.listaDocumentosConfiguracionRH = _listaDocumentosConfiguracionRH;
        // if(_listaDocumentosConfiguracionRH.length == 0){
        //   this._matSnackBar.open('Necesitas configurar en la Matriz de Documentos. ', 'OK', {
        //     duration: 5000,
        //   });
        // }
      }
		});
  }

  ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

  isRequired(campo: string, form: FormGroup) {
    let form_field = form.get(campo);
    if (!form_field.validator) {
        return false;
    }

    let validator = form_field.validator({} as AbstractControl);
    return !!(validator && validator.required);

  }

  onClickAgregar(){
    this.esVistaCard = false;
    this.pasoSeleccionado = 0;

    // Limpiamos los datos de foto
    this.limpiarFoto();

    this.formEmpleado = this.createEmpleadoForm();

    this.edicionFormEmpleado();
  }

  onClickEditar(empleado: FormGroup){
    this.esVistaCard = false;
    this.pasoSeleccionado = 0;

    // Limpiamos los datos de foto
    this.limpiarFoto();

    this.formEmpleado = this.createEmpleadoForm(empleado.getRawValue());

    this.edicionFormEmpleado();
  }

  edicionFormEmpleado(){
    if (this.pageType == 'ver' && !this.deshabilitarBotones) 
      this.formEmpleado.disable();
    else 
      this.formEmpleado.enable();
  }

  cambiarVista(paso: number){
		this.pasoSeleccionado = paso;
	}

  deshabilitarCampos(event){
    this.deshabilitarBotones = true;
  }

  // Solicitud Nueva Contratacion
  createSolicitudNuevaContratacionForm(){
    // Solicitud Nueva Contratacion Detalle
    if(this.solicitudNuevaContratacion.listaSolicitudNuevaContratacionDetalle.length > 0){
      this.solicitudNuevaContratacion.listaSolicitudNuevaContratacionDetalle.map(detalle => {
        this.listaSolicitudNuevaContratacionDetalle.push(this.createSolicitudNuevaContratacionDetalleForm(detalle, detalle.empleado));
      });
    }

    this.form = this._formBuilder.group({
      id: new FormControl(this.solicitudNuevaContratacion.id),
      codigo: new FormControl(this.solicitudNuevaContratacion.codigo),
      estatusId: new FormControl(this.solicitudNuevaContratacion.estatusId),
      listaSolicitudNuevaContratacionDetalle: this.listaSolicitudNuevaContratacionDetalle
    });
  }

  // Solicitud Nueva Contratacion Detalle
  createSolicitudNuevaContratacionDetalleForm(detalle?: SolicitudNuevaContratacionDetalleEditarProjection, empleado?: EmpleadoEditarProjection): FormGroup{
    detalle = detalle ? detalle : new SolicitudNuevaContratacionDetalleEditarProjection();
    if(detalle.id == null){
     detalle.id = this.contadorRegistrosNuevos;

     // Descontador
     this.contadorRegistrosNuevos--;
    }

    let form = this._formBuilder.group({
      id: new FormControl(detalle.id),
      solicitudNuevaContratacionId: new FormControl(detalle.solicitudNuevaContratacionId),
      empleado: this.createEmpleadoForm(empleado),
      estatusId: new FormControl(detalle.estatusId)
    });

    return form;
  }

  // Datos Generales //
  createEmpleadoForm(empleado?: EmpleadoEditarProjection): FormGroup{
    empleado = empleado ? empleado : new EmpleadoEditarProjection();
    if(empleado.id == null){
      empleado.id = this.contadorRegistrosNuevos;

      // Descontador
      this.contadorRegistrosNuevos--;
    }

    // Dato Salud
    this.datoSaludFormArray = new FormArray([]);
    if(empleado.datosSalud.length > 0){
      empleado.datosSalud.map(salud => {
        this.datoSaludFormArray.push(this.createEmpleadoDatoSaludForm(salud));
      });
    }else{
      this.datoSaludFormArray.push(this.createEmpleadoDatoSaludForm());
    }

    // Empleado Contrato
    this.empleadoContratoFormGroup = this.createEmpleadoContratoForm(empleado.empleadoContrato);

    // Empleado Horario
    this.listaEmpleadoHorario = new FormArray([]);
    if(empleado.listaEmpleadoHorario.length > 0){
      empleado.listaEmpleadoHorario.map(empleadoHorario => {
        this.listaEmpleadoHorario.push(this.createEmpleadoHorarioForm(empleadoHorario))
      });
    }

    // Empleado Beneficiario
    this.beneficiarios = new FormArray([]);
    if(empleado.beneficiarios){
      empleado.beneficiarios.map(beneficiario =>{
        this.beneficiarios.push(this.createEmpleadoBeneficiarioForm(beneficiario)); 
      });
    }

    // Empleado Contacto
    this.contactos = new FormArray([]);
    if (empleado.contactos) {
      empleado.contactos.map(contacto => {
        this.contactos.push(this.createEmpleadoContactoForm(contacto));
      });
    }

    // Empleado Documento
    this.listaEmpleadoDocumento = new FormArray([]);
    if(empleado.listaEmpleadoDocumento){
      empleado.listaEmpleadoDocumento.map(documento => {
        this.listaEmpleadoDocumento.push(this.createEmpleadoDocumentoForm(documento));
      });
    }

    

    let form = this._formBuilder.group({
        id: new FormControl(empleado.id),
        sucursal: new FormControl(empleado.sucursal, [Validators.required]),
        codigoEmpleado: new FormControl(empleado.codigoEmpleado, [Validators.required, Validators.maxLength(15)]),
        nombre: new FormControl(empleado.nombre, [Validators.required, Validators.maxLength(100)]),
        primerApellido: new FormControl(empleado.primerApellido, [Validators.required]),
        segundoApellido: new FormControl(empleado.segundoApellido),
        fechaNacimiento: new FormControl(empleado.fechaNacimiento ? moment(empleado.fechaNacimiento).format('YYYY-MM-DD'): null,[Validators.required]),
        paisNacimiento: new FormControl(empleado.paisNacimiento, [Validators.required]),
        estadoNacimiento: new FormControl(empleado.estadoNacimiento, [Validators.required]),
        estadoCivil: new FormControl(empleado.estadoCivil, [Validators.required]),
        genero: new FormControl(empleado.genero, [Validators.required]),
        rfc: new FormControl(empleado.rfc, [Validators.required, Validators.maxLength(20),]),
        curp: new FormControl(empleado.curp, [Validators.required, Validators.maxLength(30)]),
        nss: new FormControl(empleado.nss, [Validators.maxLength(11)]),
        gradoEstudios: new FormControl(empleado.gradoEstudios, [Validators.required]),
        nacionalidad: new FormControl(empleado.nacionalidad, [Validators.required]),
        correoElectronico: new FormControl(empleado.correoElectronico, [Validators.required, Validators.maxLength(50)]),
        img64: new FormControl(),
        fotoId: new FormControl(empleado.fotoId),
        domicilio: new FormControl(empleado.domicilio, [Validators.required, Validators.maxLength(200)]),
        colonia: new FormControl(empleado.colonia, [Validators.required, Validators.maxLength(100)]),
        cp: new FormControl(empleado.cp, [Validators.required, Validators.maxLength(5)]),
        pais: new FormControl(empleado.pais, [Validators.required]),
        estado: new FormControl(empleado.estado, [Validators.required]),
        municipio: new FormControl(empleado.municipio, [Validators.required, Validators.maxLength(100)]),
        datosSalud: this.datoSaludFormArray,
        empleadoContrato: this.empleadoContratoFormGroup,
        listaEmpleadoHorario: this.listaEmpleadoHorario,
        beneficiarios: this.beneficiarios,
        contactos: this.contactos,
        listaEmpleadoDocumento: this.listaEmpleadoDocumento,
        estatusId: new FormControl(empleado.estatusId, [Validators.required]),
        telefonoContacto: new FormControl(empleado.telefonoContacto, [Validators.maxLength(50)]),
        telefonoMovil: new FormControl(empleado.telefonoMovil, [Validators.maxLength(50)]),
        telefonoTrabajo: new FormControl(empleado.telefonoTrabajo, [Validators.maxLength(50)]),
        telefonoTrabajoExtension: new FormControl(empleado.telefonoTrabajoExtension, [Validators.maxLength(10)]),
        telefonoMensajeriaInstantanea: new FormControl(empleado.telefonoMensajeriaInstantanea, [Validators.maxLength(50)]),
        fechaAlta: empleado.fechaAlta
    });

    if (this.pageType == 'editar' || this.pageType == 'ver') {
        //form.get('codigoEmpleado').disabled;
    }

    form.controls['paisNacimiento'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((pais: PaisComboProjection) => {
      if(!!pais && pais.id){
        this._nuevaContratacionService.getListaEstadoNacimiento(pais.id);
      }
    });

    form.controls['pais'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((pais: PaisComboProjection) => {
      if(!!pais && pais.id){
        this._nuevaContratacionService.getListaEstado(pais.id);
      }
    });

    form.controls['estado'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((estado: EstadoComboProjection) => {
      if(!!estado && estado.id){
        this._nuevaContratacionService.getListaMunicipio(estado.id);
      }
    });

    return form;
  }

  createEmpleadoDatoSaludForm(empleadoDatoSalud?: EmpleadoDatoSaludEditarProjection): FormGroup {

    empleadoDatoSalud = empleadoDatoSalud ? empleadoDatoSalud : new EmpleadoDatoSaludEditarProjection();

    if(empleadoDatoSalud.id == null){
      empleadoDatoSalud.id = this.contadorRegistrosNuevos;

      // Descontador
      this.contadorRegistrosNuevos--;
    }

    let form: FormGroup = this._formBuilder.group({
        id: new FormControl(empleadoDatoSalud.id),
        empleadoId: new FormControl(empleadoDatoSalud.empleadoId),
        tipoSangre: new FormControl(empleadoDatoSalud.tipoSangre, [Validators.required]),
        alergias: new FormControl(empleadoDatoSalud.alergias, [Validators.maxLength(255)]),
        padecimientos: new FormControl(empleadoDatoSalud.padecimientos, [Validators.maxLength(255)]),
        informacionAdicional: new FormControl(empleadoDatoSalud.informacionAdicional, [Validators.maxLength(255)])
    });

    // Descontador
    //this.contadorRegistrosNuevos--;

    if (this.pageType == 'editar' || this.pageType == 'ver') {

    }

    return form;
  }

   // Foto //
  imageChangedEvent: any = '';
  croppedImage: any = '';

  limpiarFoto(){
    this.imageChangedEvent = '';
    this.croppedImage = '';
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  /////////////////////

  // DATOS LABORALES //
  createEmpleadoContratoForm(empleadoContrato?: EmpleadoContratoEditarProjection): FormGroup {
    empleadoContrato = empleadoContrato ? empleadoContrato : new EmpleadoContratoEditarProjection();

    if(empleadoContrato.id == null){
      empleadoContrato.id = this.contadorRegistrosNuevos;

      //Descontador
      this.contadorRegistrosNuevos--;
    }

    this.responsabilidades = this._formBuilder.array([]);

    let form: FormGroup = this._formBuilder.group({
      id: new FormControl(empleadoContrato.id),
      empleadoId: new FormControl(empleadoContrato.empleadoId),
      codigo: new FormControl(empleadoContrato.codigo),
      justificacion: new FormControl(empleadoContrato.justificacion, [Validators.required]),
      tipoContrato: new FormControl(empleadoContrato.tipoContrato, [Validators.required]),
      puesto: new FormControl(empleadoContrato.puesto, [Validators.required]),
      ingresosAdicionales: new FormControl(empleadoContrato.ingresosAdicionales, [Validators.required]),
      sueldoMensual: new FormControl(empleadoContrato.sueldoMensual, [Validators.required]),
      fechaInicio: new FormControl(empleadoContrato.fechaInicio ? moment(empleadoContrato.fechaInicio).format('YYYY-MM-DD') : null, [Validators.required]),
      fechaFin: new FormControl(empleadoContrato.fechaFin ? moment(empleadoContrato.fechaFin).format('YYYY-MM-DD') : null, [Validators.required]),
      tipoHorario: new FormControl(empleadoContrato.tipoHorario, [Validators.required]),
      cantidadHoraSemana: new FormControl(empleadoContrato.cantidadHoraSemana, []),
      domicilio: new FormControl(empleadoContrato.domicilio, [Validators.required]),
      cp: new FormControl(empleadoContrato.cp, [Validators.required]),
      colonia: new FormControl(empleadoContrato.colonia, [Validators.required]),
      pais: new FormControl(empleadoContrato.pais, [Validators.required]),
      estado: new FormControl(empleadoContrato.estado, [Validators.required]),
      municipio: new FormControl(empleadoContrato.municipio, [Validators.required]),
      fechaContrato: new FormControl(empleadoContrato.fechaContrato),
      propositoPuesto: new FormControl(empleadoContrato.propositoPuesto),
      estatusId: new FormControl(empleadoContrato.estatusId),
      responsabilidades: this.responsabilidades
    });

    if (this.pageType == 'editar' || this.pageType == 'ver') {

    }
 
    form.controls['puesto'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((puesto: PuestoComboContratosProjection) => {
        if(!!puesto && puesto.id){
            let resps = puesto.habilidadesResponsabilidades.filter(item => !item.esHabilidad);
            form.setControl('responsabilidades', this.crearResponsabilidadAray(resps));
            //this.responsabilidades = this.crearResponsabilidadAray(resps);
            //this.empleadoContratoFormGroup.setControl('responsabilidades', this.responsabilidades);
        }else{
            form.setControl('responsabilidades', this._formBuilder.array([]));
            //this.responsabilidades = this._formBuilder.array([]);
        }
      });

    form.controls['tipoContrato'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((tipoContrato: ControlMaestroMultipleComboProjection) => {
      if(!!tipoContrato && tipoContrato.id){
        this._nuevaContratacionService.getListaDocumentosConfiguracionRH(ControlesMaestrosMultiples.CMM_RH_TipoProcesoRH.NUEVA_CONTRATACION, tipoContrato.id);
      }
    });

    form.controls['fechaInicio'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(fechaInicio => {
      var fFechaAlta = this.formEmpleado.controls['fechaAlta'];
      if(moment(fFechaAlta.value).format('YYYY-MM-DD') != moment(fechaInicio).format('YYYY-MM-DD')){
        fFechaAlta.setValue(fechaInicio);
      }
    })

    form.controls['tipoHorario'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((tipoHorario: ControlMaestroMultipleComboProjection) => {
			if(!!tipoHorario && tipoHorario.id){
        // Carga Hora Semana
        if(tipoHorario.id == ControlesMaestrosMultiples.CMM_ENT_TipoHorario.CARGA_HORA_SEMANA){
          form.controls.cantidadHoraSemana.setValidators([Validators.required, Validators.min(0), Validators.pattern("^[0-9]*$")]);
          this.eliminarHorarioFormArray();
        }

        // Rolar Turnos
        if(tipoHorario.id == ControlesMaestrosMultiples.CMM_ENT_TipoHorario.ROLAR_TURNO){
          // Limpiamos
          form.controls.cantidadHoraSemana.setValue(null);
          form.controls.cantidadHoraSemana.clearValidators();
          form.controls.cantidadHoraSemana.updateValueAndValidity();
          this.eliminarHorarioFormArray();
        }

        // Horario Fijo
        if(tipoHorario.id == ControlesMaestrosMultiples.CMM_ENT_TipoHorario.HORARIO_FIJO){
          // Limpiamos
          if(form.get('cantidadHoraSemana').value != null){
            form.controls.cantidadHoraSemana.setValue(null);
            form.controls.cantidadHoraSemana.clearValidators();
            form.controls.cantidadHoraSemana.updateValueAndValidity();
          }

          const padreId: number = form.controls['id'].value;
          if(this.listaEmpleadoHorario.controls.length == 0){
            // Nuevo
            this.dias.map((dia: string) => {
              this.listaEmpleadoHorario.push(this.createEmpleadoHorarioForm(null, dia));
            });
          }
        }
			}
		});

    form.controls['pais'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((pais: PaisComboProjection) => {
			if(!!pais && pais.id){
				this._nuevaContratacionService.getListaEstadoLaboral(pais.id);
			}
		});

    form.controls['estado'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((estado: EstadoComboProjection) => {
			if(!!estado && estado.id){
				this._nuevaContratacionService.getListaMunicipioLaboral(estado.id);
			}
		});

    return form;
  }

  crearResponsabilidadAray(responsabilidades : PuestoHabilidadResponsabilidad[]){
    let arrayResponsabilidades = this._formBuilder.array([]);
    for(let index = 0, total = responsabilidades.length; index < total; index++){
        let hr: EmpleadoContratoResponsabilidad = {
            id: null,
            empleadoContratoId:null,
            descripcion: responsabilidades[index].descripcion
        }
        arrayResponsabilidades.push(this.crearResponsabilidad(hr));
    }
    
    return arrayResponsabilidades;
  }

  crearResponsabilidad(responsabilidad){
    return this._formBuilder.group({
        id:[responsabilidad?.id],
        empleadoContratoId: new FormControl(responsabilidad?.empleadoContratoId),
        descripcion: new FormControl(responsabilidad?.descripcion)
    })
  }

  eliminarReponsabilidad(responsabilidad: EmpleadoContratoResponsabilidad){
    let index = -1;
    if(!!responsabilidad){
        let respons = this.empleadoContratoFormGroup.get("responsabilidades").value;
        if(responsabilidad.id){
            index = respons.findIndex(rItem => rItem.id == responsabilidad.id);
        }else{
            index = respons.findIndex(rItem => rItem.descripcion == responsabilidad.descripcion);
        }
    }

    if(index > -1){
        let responsabilidadesArray = this.empleadoContratoFormGroup.controls["responsabilidades"] as FormArray;
        responsabilidadesArray.removeAt(index);
    }
  }

   abrirModalResponsabilidad(responsabilidad: EmpleadoContratoResponsabilidad){
        let resp: EmpleadoContratoResponsabilidad = !!responsabilidad ? responsabilidad : new EmpleadoContratoResponsabilidad();    
        if(!!this.empleadoContratoFormGroup.value.id && this.empleadoContratoFormGroup.value.id > 0){
            resp.empleadoContratoId = this.empleadoContratoFormGroup.value.id;
        }

        this.camposListado = [{
            type: 'input',
            label: 'Descripción',
            inputType: 'text',
            name: 'descripcion',
            validations: [{
                    name: 'required',
                    validator: Validators.required,
                    message: 'Descripción requerida'
                },
                {
                    name: 'minlength',
                    validator: Validators.minLength(10),
                    message: 'La descripción debe contener al menos 10 caracteres'
                },
                {
                    name: 'maxlength',
                    validator: Validators.maxLength(250),
                    message: 'La descripción no debe sobrepasar los 250 caracteres'
                }
            ]
        }];
        let index: number = -1;
        if(!!responsabilidad){
            let respons = this.empleadoContratoFormGroup.get("responsabilidades").value;
            if(responsabilidad.id){
                index = respons.findIndex(rItem => rItem.id == resp.id);
            }else{
                index = respons.findIndex(rItem => rItem.descripcion == resp.descripcion);
            }
        }

        let info: ResponsabilidadDialogData = {
            esNuevo: (!!resp && resp.id ? true: false),
            responsabilidad: resp,
            titulo: "Responsabilidad",
            index: index,
            camposListado: this.camposListado,
            onAceptar: this.addResponsabilidad.bind(this)
        }

        const dialogRef = this._dialog.open(EmpleadoContratoResponsabilidadComponent, {
            width: '500px',
            data: info
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.addResponsabilidad(confirm);
            }
        });
   }

   addResponsabilidad(datos){
    let responsabilidadesArray = this.empleadoContratoFormGroup.controls["responsabilidades"] as FormArray;
    //let responsabilidad  = this.crearResponsabilidad(datos);
    if(datos.index === -1){
        responsabilidadesArray.push(this.crearResponsabilidad(datos));
    }else if(datos.index !== -1){
        let r = ((this.empleadoContratoFormGroup.get('responsabilidades') as FormArray).at(datos.index) as FormGroup)
        r.get('descripcion').setValue(datos.descripcion);
    }
    //console.log('Form', this.empleadoContratoFormGroup.get("responsabilidades").value);
        
}

  createEmpleadoHorarioForm(empleadoHorario?: EmpleadoHorarioEditarProjection, dia?: string): FormGroup {
    empleadoHorario = empleadoHorario ? empleadoHorario : new EmpleadoHorarioEditarProjection();

    if(empleadoHorario.id == null){
      empleadoHorario.id = this.contadorRegistrosNuevos;
      empleadoHorario.dia = dia;
      empleadoHorario.horaInicio = '09:00:00';
      empleadoHorario.horaFin = '18:00:00';

      //Descontador
      this.contadorRegistrosNuevos--;
    }

    let form: FormGroup = this._formBuilder.group({
        id: new FormControl(empleadoHorario.id),
        empleadoId: new FormControl(empleadoHorario.empleadoId),
        dia: new FormControl(empleadoHorario.dia, [Validators.required]),
        horaInicio: new FormControl(empleadoHorario.horaInicio, []),
        horaFin: new FormControl(empleadoHorario.horaFin, [])
    });

    // Descontador
    //this.contadorRegistrosNuevos--;

    if (this.pageType == 'editar' || this.pageType == 'ver') {

    }

    return form;
  }

  eliminarHorarioFormArray(){
    this.listaEmpleadoHorario.controls.map((empleadoHorario: FormGroup) => {
      if(empleadoHorario.controls.id.value < 0){
        this.listaEmpleadoHorario.removeAt(this.listaEmpleadoHorario.controls.findIndex(_empleadoHorario => _empleadoHorario.value.id == empleadoHorario.controls['id'].value));
      }
    });
  }

  /////////////////////

  // Beneficiarios //
  createEmpleadoBeneficiarioForm(empleadoBeneficiario?: EmpleadoBeneficiarioEditarProjection): FormGroup {

    empleadoBeneficiario = empleadoBeneficiario ? empleadoBeneficiario : new EmpleadoBeneficiarioEditarProjection();

    if(empleadoBeneficiario.id == null){
        empleadoBeneficiario.id = this.contadorRegistrosNuevos;
        
        // Descontador
        this.contadorRegistrosNuevos--;
    }

    let form: FormGroup = this._formBuilder.group({
      id: new FormControl(empleadoBeneficiario.id),
      empleadoId: new FormControl(empleadoBeneficiario.empleadoId),
      nombre: new FormControl(empleadoBeneficiario.nombre, [Validators.required, Validators.maxLength(100)]),
      primerApellido: new FormControl(empleadoBeneficiario.primerApellido, [Validators.required, Validators.maxLength(50),]),
      segundoApellido: new FormControl(empleadoBeneficiario.segundoApellido, [Validators.required, Validators.maxLength(50),]),
      parentesco: new FormControl(empleadoBeneficiario.parentesco, [Validators.required]),
      porcentaje: new FormControl(empleadoBeneficiario.porcentaje, [Validators.required, Validators.maxLength(3), Validators.max(100)])
    });

    if (this.pageType == 'editar' || this.pageType == 'ver') {

    }

    form.controls['porcentaje'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((beneficiario: EmpleadoBeneficiarioEditarProjection) => {
      if(!!beneficiario){
        let porcentajeTotal = 0;
        this.formEmpleado.controls['beneficiarios'].value.filter(value => value.id != empleadoBeneficiario.id).map(value => {
          porcentajeTotal += value.porcentaje;
        });

        form.controls['porcentaje'].setValidators(Validators.max(100 - porcentajeTotal));
      }
    });

    return form;
  }

  agregarBeneficiario(): void {
    this.beneficiarioGroup = this.createEmpleadoBeneficiarioForm();
    this.beneficiarioGroupIndex = null;
    this.beneficiarios.push(this.beneficiarioGroup);
    this.beneficiarioEnEdicion = true;
  }

  cancelarBeneficiario(form: FormGroup): void {
    if (this.beneficiarioGroupIndex == null) {
      this.beneficiarios.removeAt(this.beneficiarios.controls.length - 1);
    }
    this.beneficiarioEnEdicion = false;
  }


  editarBeneficiario(selectedBeneficiario: FormGroup, index: number): void {
    this.beneficiarioGroup = this.createEmpleadoBeneficiarioForm(selectedBeneficiario.getRawValue());
    this.beneficiarioGroupIndex = index;

    this.beneficiarioEnEdicion = true;
  }


  guardarBeneficiario(): void {
    if (this.beneficiarioGroup.valid) {
      if(this.beneficiarioGroupIndex != null){
          this.beneficiarios.controls[this.beneficiarioGroupIndex] = this.createEmpleadoBeneficiarioForm(this.beneficiarioGroup.getRawValue());
      }

      this.beneficiarioEnEdicion = false;
    } else {
      for (const key of Object.keys(this.beneficiarioGroup.controls)) {
        if(this.beneficiarioGroup.controls[key].invalid){
          this.beneficiarioGroup.controls[key].markAsTouched();
          const invalidControl = this._el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

          if (invalidControl) {
              invalidControl.focus();
              break;
          }
        }
      }

      this._nuevaContratacionService.cargando = false;
      //this.contactoGroup.enable();

      this._matSnackBar.open(this._translateService.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
        duration: 5000,
      });
    }
  }
  ///////////////////

  // Datos de Contacto //
  createEmpleadoContactoForm(empleadoContacto?: EmpleadoContactoEditarProjection): FormGroup {
    empleadoContacto = empleadoContacto ? empleadoContacto : new EmpleadoContactoEditarProjection();

    if(empleadoContacto.id == null){
      empleadoContacto.id = this.contadorRegistrosNuevos;
      empleadoContacto.borrado = false;

      // Descontador
      this.contadorRegistrosNuevos--;
    }

    let form: FormGroup = this._formBuilder.group({
      id: new FormControl(empleadoContacto.id),
      empleadoId: new FormControl(empleadoContacto.empleadoId),
      nombre: new FormControl(empleadoContacto.nombre, [Validators.required, Validators.maxLength(100)]),
      primerApellido: new FormControl(empleadoContacto.primerApellido, [Validators.required, Validators.maxLength(50)]),
      segundoApellido: new FormControl(empleadoContacto.segundoApellido, [Validators.maxLength(50),]),
      parentesco: new FormControl(empleadoContacto.parentesco, [Validators.required, Validators.maxLength(50)]),
      telefono: new FormControl(empleadoContacto.telefono, [Validators.maxLength(25),]),
      movil: new FormControl(empleadoContacto.movil, [Validators.maxLength(25)]),
      correoElectronico: new FormControl(empleadoContacto.correoElectronico, [Validators.required, Validators.maxLength(50)])
    });

    if (this.pageType == 'editar' || this.pageType == 'ver') {

    }

    return form;
  }

  agregarContacto(): void {
		this.contactoGroup = this.createEmpleadoContactoForm();
		this.contactoGroupIndex = null;
    this.contactos.push(this.contactoGroup);
    this.contactoEnEdicion = true;
  }

  cancelarContacto(form: FormGroup): void {
    if (this.contactoGroupIndex == null) {
      this.contactos.removeAt(this.contactos.controls.length - 1);
    }
    this.contactoEnEdicion = false;
  }

  editarContacto(selectedContacto: FormGroup, index: number): void {

    this.contactoGroup = this.createEmpleadoContactoForm(selectedContacto.getRawValue());
    this.contactoGroupIndex = index;

    this.contactoEnEdicion = true;
  }


  guardarContacto(): void {
    if (this.contactoGroup.valid) {        
      if(this.contactoGroupIndex != null){
        this.contactos.controls[this.contactoGroupIndex] = this.createEmpleadoContactoForm(this.contactoGroup.getRawValue());
      }

      this.contactoEnEdicion = false;
    } else {

      for (const key of Object.keys(this.contactoGroup.controls)) {
        if(this.contactoGroup.controls[key].invalid){
          this.contactoGroup.controls[key].markAsTouched();
          const invalidControl = this._el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

          if (invalidControl) {
              invalidControl.focus();
              break;
          }
        }
      }

      this._nuevaContratacionService.cargando = false;
      //this.contactoGroup.enable();

      this._matSnackBar.open(this._translateService.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
        duration: 5000,
      });
    }
  }
  ///////////////////////

  // Documento //
  createEmpleadoDocumentoForm(empleadoDocumento?: EmpleadoDocumentoEditarProjection, tipoDocumento?: ControlMaestroMultipleComboProjection, fechaVencimiento?: Date, fechaVigencia?: Date, archivo?: ArchivoProjection): FormGroup {

    empleadoDocumento = empleadoDocumento ? empleadoDocumento : new EmpleadoDocumentoEditarProjection();
    if(empleadoDocumento.id == null){
      empleadoDocumento.id = this.contadorRegistrosNuevos;
      empleadoDocumento.empleadoId = empleadoDocumento.empleadoId;
      empleadoDocumento.tipoDocumento = tipoDocumento;
      empleadoDocumento.fechaVencimiento = fechaVencimiento ? fechaVencimiento : null;
      empleadoDocumento.fechaVigencia = fechaVencimiento ? fechaVencimiento : null;
      empleadoDocumento.archivoId = archivo.id;
      empleadoDocumento.archivo = archivo;
      empleadoDocumento.activo = true;
      empleadoDocumento.tipoProcesoRHId = ControlesMaestrosMultiples.CMM_RH_TipoProcesoRH.NUEVA_CONTRATACION;

      // Descontador
      this.contadorRegistrosNuevos--;
    }

    let form: FormGroup = this._formBuilder.group({
      id: new FormControl(empleadoDocumento.id),
      empleadoId: new FormControl(empleadoDocumento.empleadoId),
      tipoDocumento: new FormControl(empleadoDocumento.tipoDocumento, [Validators.required]),
      archivoId: new FormControl(empleadoDocumento.archivoId, [Validators.required]),
      archivo: new FormControl(empleadoDocumento.archivo, []),
      fechaVencimiento: new FormControl(empleadoDocumento.fechaVencimiento, []),
      activo: new FormControl(empleadoDocumento.activo, [Validators.required, Validators.maxLength(50)]),
      tipoProcesoRHId: new FormControl(empleadoDocumento.tipoProcesoRHId)
    });

    if (this.pageType == 'editar' || this.pageType == 'ver') {

    }

    return form;
  }

  abrirDocumentoModal(): void {      
    let dialogData: DocumentoDialogData = {
      listaTipoDocumento: this.listaTipoDocumento,
      listaDocumentosConfiguracionRH: this.listaDocumentosConfiguracionRH,
      subCarpeta: 'nueva-contratacion',
      onAceptar: this.aceptarDocumentoModal.bind(this)
    };

    const dialogRef = this._dialog.open(DocumentoDialogComponent, {
      width: '600px',
      data: dialogData,
      autoFocus: true
    });
  }

  aceptarDocumentoModal(tipoDocumento: ControlMaestroMultipleComboProjection, fechaVencimiento: Date, fechaVigencia: Date, archivos: ArchivoProjection[]){
  //event.stopPropagation();
    archivos.map(archivo => {
      this.listaEmpleadoDocumento.push(this.createEmpleadoDocumentoForm(null, tipoDocumento, fechaVencimiento, fechaVigencia, archivo));
    });
  }

  cargaDataSourceListaEmpleadoDocumento(){
    return this.formEmpleado.controls['listaEmpleadoDocumento']?.value?.filter(empleadoDocumento => empleadoDocumento.activo == true);
  }

  eliminaArchivoEmpleadoDocumento(empleadoDocumento: EmpleadoDocumentoEditarProjection){
    (this.listaEmpleadoDocumento.controls.find(_empleadoDocumento => _empleadoDocumento.value.id == empleadoDocumento.id) as FormGroup).controls['activo'].setValue(false);
  }
  ///////////////

  validarSolicitud(): void{
    // Validaciones
    // Validar FormEmpleado
    if (!this.esValidarFormEmpleado()) {
      return;
    }
    // Validamos hay documentos que son obligatorios
    if (!this.esValidarDocumentos()) {
      return;
    }

    if (this.croppedImage) {
      this._nuevaContratacionService.cargando = true;
      //this.form.get('img64').setValue(this.croppedImage);
      this._nuevaContratacionService.post(JSON.stringify({img64: this.croppedImage}), '/api/v1/nuevas-contrataciones/subir-foto', true).then(function(result: JsonResponse) {
        if (result.status == 200) {
          this._nuevaContratacionService.cargando = false;
          const archivo: ArchivoProjection = result.data;
          this.formEmpleado.controls['fotoId'].setValue(archivo.id);
          this.agregarSolicitud();
        } else {
          this._nuevaContratacionService.cargando = false;
        }
      }.bind(this));
    }else{
      this.agregarSolicitud()
    }
  }

  agregarSolicitud(){
    if(!(this.listaSolicitudNuevaContratacionDetalle.controls.some(detalle => detalle.value.empleado.id == this.formEmpleado.controls['id'].value))){
      this.listaSolicitudNuevaContratacionDetalle.push(this.createSolicitudNuevaContratacionDetalleForm(null, this.formEmpleado.getRawValue()));
    }else{
      ((this.listaSolicitudNuevaContratacionDetalle.controls[this.listaSolicitudNuevaContratacionDetalle.controls.findIndex(detalle => detalle.value.empleado.id == this.formEmpleado.controls['id'].value)] as FormGroup).controls['empleado'] as FormGroup) = this.formEmpleado;
    }
    this.esVistaCard = true;
  }

  esValidarFormEmpleado(): boolean{
    let esValidar: boolean = true; 

    if(this.formEmpleado.invalid){
      let campoKey = '';
      for (const key of Object.keys(this.formEmpleado.controls)) {
        // Verificamos si es group con Form
        if(this.formEmpleado.controls[key] instanceof FormGroup){
          const form = this.formEmpleado.controls[key] as FormGroup;
          if(form){
            for (const _key of Object.keys(form.controls)) {
              if(form.controls[_key].invalid){
                form.controls[_key].markAsTouched();
                if(campoKey == ''){
                  esValidar = false;
                  campoKey = _key;
                  // Establecer la selecciona (TABS)
                  if(key == 'empleadoContrato'){
                    this.pasoSeleccionado = 1;
                  }
                }
              }
            }
          }
        }else{
          // Verificamos si es array con Form
          if(this.formEmpleado.controls[key] instanceof FormArray){
            // Obtenemos datosSalud o beneficios....
            const form = (this.formEmpleado.controls[key] as FormArray).controls[0] as FormGroup;
            if(form){
              for (const _key of Object.keys(form.controls)) {
                if(form.controls[_key].invalid){
                  form.controls[_key].markAsTouched();
                  if(campoKey == ''){
                    campoKey = _key;
                    esValidar = false;
                    if(key == 'datosSalud')
                      this.pasoSeleccionado = 0;
                  }
                }
              }
            }
          }else{
            // Normalmente Form
            if(this.formEmpleado.controls[key].invalid){
              this.formEmpleado.controls[key].markAsTouched();
              if(campoKey == ''){
                campoKey = key;
                esValidar = false;
                this.pasoSeleccionado = 0;
              }
            }
          }
        }
      }

      const invalidControl = this._el.nativeElement.querySelector('[formcontrolname="' + campoKey + '"]');
      if (invalidControl) {
        invalidControl.focus();
      }
      
      //this._nuevaContratacionService.cargando = false;
      //this.contactoGroup.enable();

      this._matSnackBar.open(this._translateService.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
        duration: 5000,
      });
    }

    return esValidar;
  }

  esValidarDocumentos(): boolean{
    let esValidar: boolean = true;

    const documentosObligatorios = this.listaDocumentosConfiguracionRH.filter(documento => documento.tipoOpcion.id == ControlesMaestrosMultiples.CMM_GEN_TipoOpcion.OBLIATORIO);
    for(let x = 0; x < documentosObligatorios.length; x++){
      var _listaEmpleadoDocumento = this.listaEmpleadoDocumento.controls.filter(documento => documento.value.tipoDocumento.id == documentosObligatorios[x].tipoDocumento.id);
      if(_listaEmpleadoDocumento.length == 0){
        esValidar = false;
        this.pasoSeleccionado = 4;

        //this._nuevaContratacionService.cargando = false;
        //this.contactoGroup.enable();
  
        this._matSnackBar.open(this._translateService.instant('MENSAJE.DOCUMENTO'), 'OK', {
          duration: 5000,
        });
  
        break;
      }
    }
    return esValidar;
  }

  guardar(){
    // Validaciones
    // Validar no se puede guardar 0 empleado
    if((this.form.controls['listaSolicitudNuevaContratacionDetalle'] as FormArray).length == 0){
      this._matSnackBar.open(this._translateService.instant('VALIDACION.AGREGAR_EMPLEADO'), 'OK', {
        duration: 5000,
      });
      return;
    }

    console.log(this.form.getRawValue());
    return;

    this._nuevaContratacionService.cargando = true;
    this._nuevaContratacionService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/nuevas-contrataciones/save').then(
      ((result: JsonResponse) => {
        if (result.status == 200) {
          this._matSnackBar.open(this._translateService.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
            duration: 5000,
          });
          this._router.navigate(['/app/ingreso-promocion/nuevas-contrataciones/'])
        } else {
          this._nuevaContratacionService.cargando = false;
        }
      }).bind(this)
    );
  }

  enviar(){
    this._matSnackBar.open('Aproximadamente', 'OK', {
      duration: 5000,
    });
  }

  volver(){
    if(this.esVistaCard){
      this._router.navigate(['/app/ingreso-promocion/nuevas-contrataciones/'])
    }else{
      const dialogRef = this._dialog.open(FuseConfirmDialogComponent, {
        width: '400px',
        data: {
            mensaje: '¿Deseas cancelar este registro?'
        }
    });

    dialogRef.afterClosed().subscribe(confirm => {
        if (confirm) {
          this.esVistaCard = true;      
        }
      });
    }
  }
}
