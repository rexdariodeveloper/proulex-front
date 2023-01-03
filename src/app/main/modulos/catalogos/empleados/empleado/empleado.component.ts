import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener, IterableDiffers } from '@angular/core';
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
import { EmpleadoService } from './empleado.service';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { Usuario } from '@models/usuario';
import { Empleado, EmpleadoEditarProjection } from '@app/main/modelos/empleado';
import { EmpleadoContacto, EmpleadoContactoEditarProjection } from '@app/main/modelos/empleado-contacto';
import { EmpleadoCurso, EmpleadoCursoEditarProjection } from '@app/main/modelos/empleado-curso';
import { EmpleadoCategoria, EmpleadoCategoriaEditarProjection } from '@app/main/modelos/empleado-categoria';
import { EmpleadoBeneficiario, EmpleadoBeneficiarioEditarProjection } from '@app/main/modelos/empleado-beneficiario';
import { PAProfesorComboProjection } from '@app/main/modelos/paprofesor-categoria';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PaisComboProjection } from '@app/main/modelos/pais';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { DepartamentoComboProjection } from '@models/departamento';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ControlesMaestrosMultiples as cmmMain } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { ControlesMaestrosMultiples as cmmSpring } from '@models/mapeos/controles-maestros-multiples';
import * as moment from 'moment';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { UsuarioDatosAdicionalesComponent } from '@app/main/componentes/usuario-datos-adicionales/usuario-datos-adicionales.component';
import { VerificarRfcComponent, VerificarRfcData } from './dialogs/verificar-rfc/verificar-rfc.dialog';
import { AgregarCategoriaComponent, AgregarCategoriaData } from './dialogs/agregar-categoria/agregar-categoria.dialog';
import { EmpleadoDatoSaludEditarProjection } from '@app/main/modelos/empleado-dato-salud';
import { EmpleadoDocumentoEditarProjection } from '@app/main/modelos/empleado-documento';
import { ArchivoProjection } from '@models/archivo';
import { DocumentoDialogComponent, DocumentoDialogData } from './dialogs/documento/documento.dialog';
import { EmpleadoContratoEditarProjection } from '@app/main/modelos/empleado-contrato';
import { FichasDataService } from '@services/fichas-data.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';

@Component({
    selector: 'empleado',
    templateUrl: './empleado.component.html',
    styleUrls: ['./empleado.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class EmpleadoComponent implements ComponentCanDeactivate {
    // Configuracion de la Ficha
    contadorRegistrosNuevos: number = -1;
    permisoNuevaContratacion: boolean = false;
    localeEN = english;
	localeES = spanish;
    regexCURP = "[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}" +
    "(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])" +
    "[HM]{1}" +
    "(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)" +
    "[B-DF-HJ-NP-TV-Z]{3}" +
    "[0-9A-Z]{1}[0-9]{1}$";
    selected = new FormControl(0);

    @ViewChild(UsuarioDatosAdicionalesComponent) datosAdicionales: UsuarioDatosAdicionalesComponent;

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	CMM_CXPP_FormaPago = cmmMain.CMM_CXPP_FormaPago;

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    empleado: EmpleadoEditarProjection = new EmpleadoEditarProjection();

    // Datos Generales
    form: FormGroup;
    datoSaludForm: FormGroup;
    empleadoDatoSalud: EmpleadoDatoSaludEditarProjection;
    datoSaludFormArray: FormArray = new FormArray([]);

    // Las selecciones (Datos Generales)
    listaPais: PaisComboProjection[] = [];
    listaEstadoNacimiento: EstadoComboProjection[] = [];
    @ViewChild('listaEstadoNacimientoSelect') listaEstadoNacimientoSelect: PixvsMatSelectComponent;
    listaEstadoCivil: ControlMaestroMultipleComboProjection[] = [];
    listaGenero: ControlMaestroMultipleComboProjection[] = [];
    listaGradoEstudio: ControlMaestroMultipleComboProjection[] = [];
    listaNacionalidad: ControlMaestroMultipleComboProjection[] = [];
    listaEstado: EstadoComboProjection[] = [];
    @ViewChild('listaEstadoSelect') listaEstadoSelect: PixvsMatSelectComponent;
    listaTipoSangre: ControlMaestroMultipleComboProjection[] = [];

    // Datos Laborales
    displayedColumnsEmpleadoContrato: string[] = [
		'codigo',
		'tipoContrato',
        'puesto',
		'fechaInicio',
        'fechaFin',
		'sueldoMensual',
		'acciones'
	];

    // Las selecciones (Datos Laborales)
    listaTipoEmpleado: ControlMaestroMultipleComboProjection[] = [];
    listaSucursal: SucursalComboProjection[] = [];
    listaDepartamento: DepartamentoComboProjection[] = [];

    paisNacimientoControl: FormControl = new FormControl();
	estadoControl: FormControl = new FormControl();
    estadoNacimientoControl: FormControl = new FormControl();
    activoControl: FormControl = new FormControl();
    categoriaControl: FormControl = new FormControl();
    gradoEstudiosControl: FormControl = new FormControl();
    nacionalidadControl: FormControl = new FormControl();

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

    //Contactos
    contactoGroup: FormGroup;
    contactoGroupIndex: number = null;
    contactoEnEdicion: boolean = false;
    contactos: FormArray;
    cursos: FormArray;
    categorias: FormArray;
    empleadoContacto: EmpleadoContactoEditarProjection;
    empleadoUsuario: Usuario;
    usuarioGroup: FormGroup;

    //Beneficiarios
    beneficiarioGroup: FormGroup;
    beneficiarioGroupIndex: number = null;
    beneficiarioEnEdicion: boolean = false;
    beneficiarios: FormArray;


    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */
	rolControl: FormControl;
    estatusControl: FormControl;
	
    
    idiomas: ControlMaestroMultipleComboProjection[];
    
    parentesco: ControlMaestroMultipleComboProjection[];
	estados: EstadoComboProjection[];
    categoriasProfesores: PAProfesorComboProjection[];
    
    roles: any;
    estatus: any;

	paisControl: FormControl = new FormControl();
    

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;

    public patternRFC = { 'A': { pattern: new RegExp('^[a-z0-9]$') } };

    fechaActual = moment(new Date()).format('YYYY-MM-DD');

    esAcademico: boolean = false;

    displayedColumns: string[] = ['idioma', 'programa', 'comentarios','acciones','boton'];
    displayedColumnsCategorias: string[] = ['idioma', 'categoria','acciones','boton'];

    deshabilitarBotones: boolean = true;

    cambioDetalles: boolean = false;
    inicial: boolean = true;
    iterableDiffer: any;

    // Permisos componentes
    ocultarTabContratos: boolean = false;

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
        private _formBuilder: FormBuilder,
        private _location: Location,
        private router: Router,
        private _matSnackBar: MatSnackBar,
        public _dialog: MatDialog,
        private route: ActivatedRoute,
        private hashid: HashidsService,
        public _empleadoService: EmpleadoService,
        private el: ElementRef,
        public validatorService: ValidatorService,
        private iterableDiffers: IterableDiffers,
        public _fichasDataService: FichasDataService,
        public _fuseNavigationService: FuseNavigationService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english,spanish);

        // Set the default
        //this.empleado = new Empleado();

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.iterableDiffer = iterableDiffers.find([]).create(null);
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
                //this.empleado = new Empleado();
            }

            this.config = {
                rutaAtras: "/app/catalogos/empleados",
                rutaBorrar: "/api/v1/empleados/delete/",
                icono: "local_shipping"
            }

        });

        let permisosComponentes = this._fuseNavigationService.getSelectedPermisosComponentes();

        this.ocultarTabContratos = !!permisosComponentes.filter(x => x.componente == 'TAB Contratos' && x.tipoPermisoId == cmmSpring.CMM_EMPC_TipoPermiso.OCULTAR)[0];

        // Subscribe to update proveedor on changes
        this._empleadoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

                if (datos && datos.empleado) {
                    this.empleado = new EmpleadoEditarProjection(datos.empleado);
                    //this.empleado.datoSalud = datos.empleadoDatoSalud;
                    this.empleado.empleadoContrato = datos?.empleadoContrato;
                    this.titulo = this.empleado.codigoEmpleado;
                } else {
                    this.empleado = new EmpleadoEditarProjection();
                    this.empleado.id = this.contadorRegistrosNuevos;

                    // Descontador
                    this.contadorRegistrosNuevos--;
                }

                this.listaPais = datos.listaPais;
                this.listaEstadoNacimiento = datos.listaEstadoNacimiento;
                this.listaEstadoCivil = datos.listaEstadoCivil;
                this.listaGenero = datos.listaGenero;
                this.listaEstado = datos.listaEstado;
                this.listaGradoEstudio = datos.listaGradoEstudio;
                this.listaNacionalidad = datos.listaNacionalidad;
                this.listaTipoSangre = datos.listaTipoSangre;
                this.listaTipoEmpleado = datos.listaTipoEmpleado;
                this.listaSucursal = datos.listaSucursal;
                this.listaDepartamento = datos.listaDepartamento;
                this.permisoNuevaContratacion = datos.permisoNuevaContratacion;
                this.listaTipoDocumento = datos.listaTipoDocumento;
                
                this.roles = datos?.roles;
                this.estatus = datos?.cmmEstatus;
                this.categoriasProfesores = datos?.categoriasProfesor;
                this.idiomas = datos?.idiomas;
                this.parentesco = datos?.parentesco;

                this.createEmpleadoForm();
                
                this.form.get('nombre').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    this.usuarioGroup.get('nombre').setValue(this.form.get('nombre').value);
                });

                this.form.get('primerApellido').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    this.usuarioGroup.get('primerApellido').setValue(this.form.get('primerApellido').value);
                });

                this.form.get('segundoApellido').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    this.usuarioGroup.get('segundoApellido').setValue(this.form.get('segundoApellido').value);
                });

                this.form.get('correoElectronico').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    this.usuarioGroup.get('correoElectronico').setValue(this.form.get('correoElectronico').value);
                });

                this.form.get('tipoEmpleado').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    if(this.form.get('tipoEmpleado').value && this.form.get('tipoEmpleado').value.valor == "Acad�mico"){
                        this.esAcademico=true;
                    }else{
                        this.esAcademico=false;
                    }
                });

                

            });
		/*this._empleadoService.onComboEstadosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoEstados => {
			if (listadoEstados) {
				this._empleadoService.onComboEstadosChanged.next(null);
				this.estados = listadoEstados;
				this.estadoSelect.setDatos(this.estados);
			}
		});*/

        if (this.pageType == 'ver') {
            this.form.disable();
            //this.usuarioGroup.disable();
            this.deshabilitarBotones = false;
            if(this.empleado.tipoEmpleado.id == cmmMain.CMM_EMP_TipoEmpleado.ADMINISTRATIVO || this.empleado.tipoEmpleado.id == cmmMain.CMM_EMP_TipoEmpleado.ACADEMICO){
                this.esAcademico=true;
                //this.form.get('categoria').setValidators([Validators.required]);  
            }
            
        } else {
            this.form.enable();
            //this.usuarioGroup.enable();
        }

        this._empleadoService.onListaEstadoNacimientoChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((_listaEstadoNacimiento: EstadoComboProjection[]) => {
            if (_listaEstadoNacimiento != null) {
              this.listaEstadoNacimiento = _listaEstadoNacimiento;
              //this.form.get('estadoNacimiento').setValue(null);
              if(!!this.listaEstadoNacimientoSelect){
                this.listaEstadoNacimientoSelect.setDatos(this.listaEstadoNacimiento);
              }
            }
        });

        this._empleadoService.onListaEstadoChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((_listaEstado: EstadoComboProjection[]) => {
            if (_listaEstado != null) {
              this.listaEstado = _listaEstado;
              //this.form.get('estadoNacimiento').setValue(null);
              if(!!this.listaEstadoSelect){
                this.listaEstadoSelect.setDatos(this.listaEstado);
              }
            }
        });
        
    }

    ngAfterViewInit(){
        this.inicial = false;
    }

    ngDoCheck() {
        if(this.categorias?.value != null && this.pageType == 'ver'){
            let changes = this.iterableDiffer.diff(this.categorias.value);
            if (changes && !this.inicial) {
                this.cambioDetalles = true;
            }
        }
    }

    createEmpleadoForm(){
		
		this.paisControl = new FormControl(this.empleado.pais, [Validators.required]);
        this.paisNacimientoControl = new FormControl(this.empleado.paisNacimiento, [Validators.required]);
		this.estadoControl = new FormControl(this.empleado.estado, [Validators.required]);
        //this.activoControl = new FormControl(this.empleado.activo || (this.pageType == 'nuevo'), []);
		//this.gradoEstudiosControl = new FormControl(this.empleado?.gradoEstudios);
        //this.nacionalidadControl = new FormControl(this.empleado?.nacionalidad);

		// this.paisControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
        //     //this.estadoSelect.setDatos([]);
        //     //this.estadoControl.setValue(null);
        //     if (this.paisControl.value) {
        //         this._empleadoService.getComboEstados(this.paisControl.value.id).then(value =>{
        //             this.estados = value.data;
        //             this.estadoSelect.setDatos(this.estados);
        //         });
        //     }
            
        // });

        // this.paisNacimientoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
        //     //this.estadoSelect.setDatos([]);
        //     //this.estadoControl.setValue(null);
        //     if (this.paisNacimientoControl.value) {
        //         this._empleadoService.getComboEstados(this.paisNacimientoControl.value.id).then(value =>{
        //             this.estadosNacimiento = value.data;
        //             this.estadoNacimientoSelect.setDatos(this.estadosNacimiento);
        //         });
        //     }
            
        // });

        // Dato Salud
        if(this.empleado.datosSalud.length > 0){
            this.empleado.datosSalud.map(salud => {
                this.datoSaludFormArray.push(this.createEmpleadoDatoSaludForm(salud));
            });
        }else{
            this.datoSaludFormArray.push(this.createEmpleadoDatoSaludForm());
        }

        this.beneficiarios = new FormArray([]);

        if(this.empleado.beneficiarios){
            this.empleado.beneficiarios.forEach(beneficiario =>{
               this.beneficiarios.push(this.createEmpleadoBeneficiarioForm(beneficiario, this.empleado)); 
            });
        }

        this.contactos = new FormArray([]);

        if (this.empleado.contactos) {
            this.empleado.contactos.forEach(contacto => {
                this.contactos.push(this.createEmpleadoContactoForm(contacto, this.empleado));
            });
        }

        this.cursos = new FormArray([]);
        if(this.empleado.cursos){
            this.empleado.cursos.forEach(curso =>{
                this.cursos.push(this.createEmpleadoCursoForm(curso, this.empleado));
            });
        }

        this.categorias = new FormArray([]);
        if(this.empleado.categorias){
            this.empleado.categorias.forEach(categoria =>{
                this.categorias.push(this.createEmpleadoCategoriaForm(categoria,this.empleado));
            });
        }

        // Lista Empleado Documento
        if(this.empleado.listaEmpleadoDocumento){
            this.empleado.listaEmpleadoDocumento.map(documento => {
                this.listaEmpleadoDocumento.push(this.createEmpleadoDocumentoForm(documento));
            });
        }

        if(this.empleado.usuario){
            this.usuarioGroup = this.createUsuarioForm(this.empleado.usuario,this.empleado);
        }
        else{
            this.usuarioGroup = this.createUsuarioForm(null,this.empleado);
        }

        this.form = this._formBuilder.group({
            id: [this.empleado.id],
            codigoEmpleado: new FormControl(this.empleado.codigoEmpleado, [Validators.required, Validators.maxLength(15)]),
            nombre: new FormControl(this.empleado.nombre, [Validators.required, Validators.maxLength(100)]),
            primerApellido: new FormControl(this.empleado.primerApellido, [Validators.required]),
            segundoApellido: new FormControl(this.empleado.segundoApellido),
            fechaNacimiento: new FormControl(this.empleado.fechaNacimiento ? moment(this.empleado.fechaNacimiento).format('YYYY-MM-DD'): null,[Validators.required]),
            paisNacimiento: new FormControl(this.empleado.paisNacimiento, [Validators.required]),
            estadoNacimiento: new FormControl(this.empleado.estadoNacimiento, [Validators.required]),
            estadoCivil: new FormControl(this.empleado.estadoCivil, [Validators.required]),
            genero: new FormControl(this.empleado.genero, [Validators.required]),
            rfc: new FormControl(this.empleado.rfc, [Validators.required, Validators.maxLength(20),]),
            curp: new FormControl(this.empleado.curp, [Validators.required, Validators.maxLength(30)]),
            nss: new FormControl(this.empleado.nss, [Validators.maxLength(11)]),
            gradoEstudios: new FormControl(this.empleado.gradoEstudios, [Validators.required]),
            nacionalidad: new FormControl(this.empleado.nacionalidad, [Validators.required]),
            correoElectronico: new FormControl(this.empleado.correoElectronico, [Validators.required, Validators.maxLength(50)]),
            telefonoContacto: new FormControl(this.empleado.telefonoContacto, [Validators.maxLength(50)]),
			telefonoMovil: new FormControl(this.empleado.telefonoMovil, [Validators.maxLength(50)]),
			telefonoTrabajo: new FormControl(this.empleado.telefonoTrabajo, [Validators.maxLength(50)]),
			telefonoTrabajoExtension: new FormControl(this.empleado.telefonoTrabajoExtension, [Validators.maxLength(10)]),
			telefonoMensajeriaInstantanea: new FormControl(this.empleado.telefonoMensajeriaInstantanea, [Validators.maxLength(50)]),
            img64: new FormControl(),
            domicilio: new FormControl(this.empleado.domicilio, [Validators.required, Validators.maxLength(200)]),
            colonia: new FormControl(this.empleado.colonia, [Validators.required, Validators.maxLength(100)]),
            cp: new FormControl(this.empleado.cp, [Validators.required, Validators.maxLength(5)]),
            pais: this.paisControl,
            estado: this.estadoControl,
            municipio: new FormControl(this.empleado.municipio, [Validators.required, Validators.maxLength(100)]),
            datosSalud: this.datoSaludFormArray,
            archivoId: new FormControl(this.empleado.fotoId),
            tipoEmpleado: new FormControl(this.empleado.tipoEmpleado, [Validators.required]),
            sucursal: new FormControl(this.empleado.sucursal, [Validators.required]),
            departamento: new FormControl(this.empleado.departamento, [Validators.required]),
            fechaAlta: new FormControl(this.empleado.fechaAlta ? moment(this.empleado.fechaAlta).format('YYYY-MM-DD'):null,[Validators.required]),
            categorias: this.categorias,
            beneficiarios: this.beneficiarios,
            listaEmpleadoDocumento: this.listaEmpleadoDocumento,
            contactos: this.contactos,
            usuario: this.usuarioGroup,
            estatusId: new FormControl(this.empleado.estatusId, [Validators.required])
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            //form.get('codigoEmpleado').disabled;
        }

        this.form.controls['paisNacimiento'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((pais: PaisComboProjection) => {
			if(!!pais && pais.id){
				this._empleadoService.getListaEstadoNacimiento(pais.id);
			}else{
				this.form.controls['estadoNacimiento'].setValue(null);
			}
		});

        this.form.controls['pais'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((pais: PaisComboProjection) => {
			if(!!pais && pais.id){
				this._empleadoService.getListaEstado(pais.id);
			}else{
				this.form.controls['estado'].setValue(null);
			}
		});
    }

    createEmpleadoDatoSaludForm(empleadoDatoSalud?: EmpleadoDatoSaludEditarProjection): FormGroup {

        this.empleadoDatoSalud = empleadoDatoSalud ? empleadoDatoSalud : new EmpleadoDatoSaludEditarProjection();

        let form: FormGroup = this._formBuilder.group({
            id: [this.empleadoDatoSalud.id],
            empleadoId: new FormControl(this.empleado.id),
            alergias: new FormControl(this.empleadoDatoSalud.alergias, [Validators.maxLength(255)]),
            padecimientos: new FormControl(this.empleadoDatoSalud.padecimientos, [Validators.maxLength(255)]),
            informacionAdicional: new FormControl(this.empleadoDatoSalud.informacionAdicional, [Validators.maxLength(255)]),
            tipoSangre: new FormControl(this.empleadoDatoSalud.tipoSangre, [Validators.required]),
        });

        // Descontador
        //this.contadorRegistrosNuevos--;

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }

    createEmpleadoBeneficiarioForm(empleadoBeneficiario: EmpleadoBeneficiarioEditarProjection, empleado: EmpleadoEditarProjection): FormGroup {

        empleadoBeneficiario = empleadoBeneficiario ? empleadoBeneficiario : new EmpleadoBeneficiarioEditarProjection();

        if(empleadoBeneficiario.id == null){
            empleadoBeneficiario.id = this.contadorRegistrosNuevos;
            
            // Descontador
            this.contadorRegistrosNuevos--;
        }

        let form: FormGroup = this._formBuilder.group({
            id: [empleadoBeneficiario.id],
            empleadoId: new FormControl(empleado.id),
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
                let porcentajeTotal: number = 0;
                this.form.controls['beneficiarios'].value.filter(value => value.id != empleadoBeneficiario.id).map(value => {
                    porcentajeTotal += parseFloat(value.porcentaje);
                });

                form.controls['porcentaje'].setValidators([form.controls['porcentaje'].validator, Validators.max(100 - porcentajeTotal)]);
			}
		});

        return form;
    }

    createEmpleadoContactoForm(empleadoContacto: EmpleadoContactoEditarProjection, empleado: EmpleadoEditarProjection): FormGroup {

        this.empleadoContacto = empleadoContacto ? empleadoContacto : new EmpleadoContactoEditarProjection();
        this.empleadoContacto.borrado = false;

        let form: FormGroup = this._formBuilder.group({
            id: [this.empleadoContacto.id],
            empleadoId: new FormControl(this.empleadoContacto.empleadoId, []),
            nombre: new FormControl(this.empleadoContacto.nombre, [Validators.required, Validators.maxLength(100),]),
            primerApellido: new FormControl(this.empleadoContacto.primerApellido, [Validators.required, Validators.maxLength(50),]),
            segundoApellido: new FormControl(this.empleadoContacto.segundoApellido, [Validators.maxLength(50),]),
            parentesco: new FormControl(this.empleadoContacto.parentesco, [Validators.required, Validators.maxLength(50)]),
            telefono: new FormControl(this.empleadoContacto.telefono, [Validators.maxLength(25),]),
            movil: new FormControl(this.empleadoContacto.movil, [Validators.maxLength(25)]),
            correoElectronico: new FormControl(this.empleadoContacto.correoElectronico, [Validators.required, Validators.maxLength(50),]),
            
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }

    createEmpleadoCursoForm(curso: EmpleadoCursoEditarProjection, empleado: EmpleadoEditarProjection): FormGroup {

        curso = curso ? curso : new EmpleadoCursoEditarProjection();

        let form: FormGroup = this._formBuilder.group({
            id: [curso.id],
            empleadoId: new FormControl(empleado.id),
            idioma: new FormControl(curso.idioma),
            programa: new FormControl(curso.programa),
            comentarios: new FormControl(curso.comentarios),
            activo: new FormControl(curso.activo)
        });
        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }

    createEmpleadoCategoriaForm(categoria: EmpleadoCategoriaEditarProjection, empleado: EmpleadoEditarProjection): FormGroup{
        categoria = categoria ? categoria : new EmpleadoCategoriaEditarProjection();

        let form: FormGroup = this._formBuilder.group({
            id: [categoria.id],
            empleadoId: new FormControl(empleado.id),
            idioma: new FormControl(categoria.idioma),
            categoria: new FormControl(categoria.categoria),
            activo: new FormControl(categoria.activo)
        });

        return form;
    }

    createEmpleadoDocumentoForm(empleadoDocumento?: EmpleadoDocumentoEditarProjection, tipoDocumento?: ControlMaestroMultipleComboProjection, fechaVencimiento?: Date, archivo?: ArchivoProjection): FormGroup {

        empleadoDocumento = empleadoDocumento ? empleadoDocumento : new EmpleadoDocumentoEditarProjection();
        if(empleadoDocumento.id == null){
            empleadoDocumento.id = this.contadorRegistrosNuevos;
            empleadoDocumento.empleadoId = empleadoDocumento.empleadoId;
            empleadoDocumento.tipoDocumento = tipoDocumento;
            empleadoDocumento.fechaVencimiento = fechaVencimiento ? fechaVencimiento : null;
            empleadoDocumento.archivoId = archivo.id;
            empleadoDocumento.archivo = archivo;
            empleadoDocumento.activo = true;
            empleadoDocumento.tipoProcesoRHId = cmmMain.CMM_RH_TipoProcesoRH.NUEVA_CONTRATACION;

            // Descontador
            this.contadorRegistrosNuevos--;
        }

        let form: FormGroup = this._formBuilder.group({
            id: [empleadoDocumento.id],
            empleadoId: new FormControl(empleadoDocumento.empleadoId, []),
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
          onAceptar: this.aceptarDocumentoModal.bind(this)
        };
        
    
        const dialogRef = this._dialog.open(DocumentoDialogComponent, {
          width: '600px',
          data: dialogData,
          autoFocus: true
        });
    
        // dialogRef.keydownEvents().pipe(takeUntil(this._unsubscribeAll)).subscribe(event => {
        //   if(event.key === "Enter"){
        //     event.preventDefault();
        //     event.stopPropagation();
        //     dialogRef.componentInstance.aceptar();
        //   }
        // });
            
    }

    aceptarDocumentoModal(tipoDocumento: ControlMaestroMultipleComboProjection, fechaVencimiento: Date, archivos: ArchivoProjection[]){
		//event.stopPropagation();
        archivos.map(archivo => {
            this.listaEmpleadoDocumento.push(this.createEmpleadoDocumentoForm(null, tipoDocumento, fechaVencimiento, archivo));
        });
	}

    cargaDataSourceListaEmpleadoDocumento(){
        return this.form.controls['listaEmpleadoDocumento']?.value?.filter(empleadoDocumento => empleadoDocumento.activo == true);
    }

    cargaDataSourceListaEmpleadoContrato(){
        var listaEmpleadoContrato: EmpleadoContratoEditarProjection[] = [];
        listaEmpleadoContrato.push(this.empleado.empleadoContrato);
        return listaEmpleadoContrato;
    }

    eliminaArchivoEmpleadoDocumento(empleadoDocumento: EmpleadoDocumentoEditarProjection){
        (this.listaEmpleadoDocumento.controls.find(_empleadoDocumento => _empleadoDocumento.value.id == empleadoDocumento.id) as FormGroup).controls['activo'].setValue(false);
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

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }

    actualizarDatos(){
        if(this.cambioDetalles){
            const dialogRef = this._dialog.open(FuseConfirmDialogComponent, {
                    width: '400px',
                    data: {
                        mensaje: this.translate.instant("�Quieres actualizar los grupos activos?")
                    }
                });

                dialogRef.afterClosed().subscribe(confirm => {
                    if (confirm) {
                        this.form.addControl("actualizarDatos",new FormControl(true));
                    }else{
                        this.form.addControl("actualizarDatos",new FormControl(false));
                    }
                    this.guardar();
                });
            }else{
                this.guardar();
            }
    }

    guardar() {
        if (this.croppedImage) {
            this.form.get('img64').setValue(this.croppedImage);
        }
        if (this.usuarioGroup.get('contrasenia') && this.usuarioGroup.get('contraseniaConfirmar') && this.usuarioGroup.get('contrasenia').value !== this.usuarioGroup.get('contraseniaConfirmar').value) {
                this._matSnackBar.open("No coinciden las contrase�as", 'OK', {
                    duration: 5000,
                });

                this.usuarioGroup.get('contrasenia').setValue(null);
                this.usuarioGroup.get('contraseniaConfirmar').setValue(null);
                this._empleadoService.cargando = false;
        }
        if (this.form.valid) {
            this.form.addControl('cursos',this.cursos);
            this.form.addControl('categorias',this.categorias);
            //this.form.addControl('listaEmpleadoDocumento', this.listaEmpleadoDocumento);

            this._empleadoService.cargando = true;
            if(this.datosAdicionales){
                    if(!this.datosAdicionales.validar()){
                        this._empleadoService.cargando = false;
                        this.form.enable({ emitEvent: false });

                        this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                            duration: 5000,
                        });
                        return;
                    }
                    this.datosAdicionales.setDatosForm();
                }
    		this.form.disable();
            this._empleadoService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/empleados/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                            duration: 5000,
    					});
    					this.form.disable();
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._empleadoService.cargando = false;
                        this.form.enable();
                    }
                }.bind(this)
            );
        } else {
            let campoKey = '';
            for (const key of Object.keys(this.form.controls)) {
                // Verificamos si es group con Form
                if(this.form.controls[key] instanceof FormGroup){

                    const form = this.form.controls[key] as FormGroup;
                    if(form){
                        for (const _key of Object.keys(form.controls)) {
                            if(form.controls[_key].invalid){
                                form.controls[_key].markAsTouched();
                                if(campoKey == ''){
                                    // Establecer la selecciona (TABS)
                                    if(key == 'usuario'){
                                        this.selected.setValue(5);
                                    }

                                    campoKey = _key;
                                }
                            }
                        }
                    }
                }else{
                    // Verificamos si es array con Form
                    if(this.form.controls[key] instanceof FormArray){
                        // Obtenemos datosSalud o beneficios....
                        const form = (this.form.controls[key] as FormArray).controls[0] as FormGroup;
                        if(form){
                            for (const _key of Object.keys(form.controls)) {
                                if(form.controls[_key].invalid){
                                    form.controls[_key].markAsTouched();
                                    if(campoKey == ''){
                                        // Establecer la selecciona (TABS)
                                        // Datos Generales
                                        if(key == 'datosSalud'){
                                            this.selected.setValue(0);
                                        }
                                        // Datos Beneficiarios
                                        if(key == 'beneficiarios'){
                                            this.selected.setValue(2);
                                        }
                                        // Datos Contacto
                                        if(key == 'contactos'){
                                            this.selected.setValue(3);
                                        }
                                        // Documentos
                                        if(key == 'listaEmpleadoDocumento'){
                                            this.selected.setValue(4);
                                        }

                                        campoKey = _key;
                                    }
                                }
                            }
                        }
                    }else{
                        // Normalmente Form
                        if(this.form.controls[key].invalid){
                            this.form.controls[key].markAsTouched();
                            if(campoKey == ''){
                                // Establecer la selecciona (TABS)
                                // Datos Laborales
                                if(key == 'tipoEmpleado' || key == 'sucursal' || key == 'departamento' || key == 'fechaAlta'){
                                    this.selected.setValue(1);
                                }else{
                                    // Datos Generales
                                    this.selected.setValue(0);
                                }
                        
                                campoKey = key;
                            }
                        }
                    }
                }
            }

            const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + campoKey + '"]');
            if (invalidControl) {
                //let tab = invalidControl.parents('div.tab-pane').scope().tab
                //tab.select();                         
                invalidControl.focus();
            }

            this._empleadoService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }

    newContacto(): void {
		this.contactoGroup = this.createEmpleadoContactoForm(null, this.empleado);
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

        this.contactoGroup = this.createEmpleadoContactoForm(selectedContacto.getRawValue(), this.empleado);
        this.contactoGroupIndex = index;

        this.contactoEnEdicion = true;
    }


    addContacto(): void {
        if(this.contactoGroup.controls['telefono'].value ||  this.contactoGroup.controls['movil'].value 
            && (this.contactoGroup.controls['telefono'].value.length!=0 || this.contactoGroup.controls['movil'].value!=0)){
            if (this.contactoGroup.valid) {
                
                if(this.contactoGroupIndex != null){
                    this.contactos.controls[this.contactoGroupIndex] = this.createEmpleadoContactoForm(this.contactoGroup.getRawValue(), this.empleado);
                }

                this.contactoEnEdicion = false;

            } else {

                for (const key of Object.keys(this.contactoGroup.controls)) {
                    if (this.contactoGroup.controls[key].invalid) {
                        const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                        if (invalidControl) {
                         
                            invalidControl.focus();
                            break;
                        }

                    }
                }

                this._empleadoService.cargando = false;
                //this.contactoGroup.enable();

                this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                    duration: 5000,
                });

            }
        }
        else{
            
        }
    }

    createUsuarioForm(empleadoUsuario: Usuario, empleado: EmpleadoEditarProjection): FormGroup {
        this.empleadoUsuario = empleadoUsuario ? empleadoUsuario : new Usuario();
        /*this.empleadoUsuario.nombre = this.empleado?.nombre;
        this.empleadoUsuario.primerApellido = this.empleado?.primerApellido;
        this.empleadoUsuario.segundoApellido = this.empleado?.segundoApellido;
        this.empleadoUsuario.correoElectronico = this.empleado?.correoElectronico;*/

        this.rolControl = new FormControl(this.empleadoUsuario.rol, [Validators.required])
        this.estatusControl = new FormControl(this.empleadoUsuario.estatus, [Validators.required])

        let form = this._formBuilder.group({
            id: [this.empleadoUsuario.id],
            nombre: new FormControl(this.empleadoUsuario.nombre),
            primerApellido: new FormControl(this.empleadoUsuario.primerApellido),
            segundoApellido: new FormControl(this.empleadoUsuario.segundoApellido),
            correoElectronico: new FormControl(this.empleadoUsuario.correoElectronico),
            contrasenia: new FormControl(this.empleadoUsuario.contrasenia, [Validators.required]),
            contraseniaConfirmar: new FormControl(this.empleadoUsuario.contrasenia, [Validators.required]),
            img64: new FormControl(),
            rol: this.rolControl,
            estatus: this.pageType != 'nuevo' ? this.estatusControl : null,
            archivoId: new FormControl(this.empleadoUsuario.archivoId),
            fechaModificacion :this.empleadoUsuario.fechaModificacion,
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            form.get('estatus').setValidators([]);
            form.get('estatus').updateValueAndValidity();

            form.get('contrasenia').setValidators([Validators.minLength(6), Validators.maxLength(20)]);
            form.get('contrasenia').updateValueAndValidity();

            form.get('contraseniaConfirmar').setValidators([Validators.minLength(6), Validators.maxLength(20)]);
            form.get('contraseniaConfirmar').updateValueAndValidity();
        }

        return form;
    }

    setDataUsuarioChange(event){
        this.usuarioGroup.get('nombre').setValue(event);
    }

    confirmarBorrarCurso(i){
        const dialogRef = this._dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: '�?�?�?¿Deseas borrar el curso seleccionado?'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.borrarGrupo(i);
            }
        });
    }

    borrarGrupo(i){
        this.cursos.controls[i].get('activo').setValue(false);
    }

    confirmarBorrarCategoria(i){
        const dialogRef = this._dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: '�?�?�?¿Deseas borrar la categoria seleccionado?'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.borrarCategoria(i);
            }
        });
    }

    borrarCategoria(i){
        this.categorias.controls[i].get('activo').setValue(false);
    }

    abrirModal(){
        const dialogRef = this._dialog.open(VerificarRfcComponent, {
            width: '500px',
            data: {
                idiomas: this.idiomas
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.nuevoCurso(confirm);
            }
        });
    }

    abrirModalCategoria(){
        const dialogRef = this._dialog.open(AgregarCategoriaComponent, {
            width: '500px',
            data: {
                idiomas: this.idiomas,
                categorias: this.categoriasProfesores
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.nuevaCategoria(confirm);
            }
        });
    }

    nuevoCurso(curso){
        let cursosDuplicados = [];
        for(var i=0;i<curso.programa.length;i++){
            let index = this.cursos.value.findIndex(cursoArray =>{
                return cursoArray.activo && (cursoArray.idioma.valor == curso.idioma.valor) && (cursoArray.programa.nombre == curso.programa[i].nombre)
            });
            if(index == -1){
                let form = this._formBuilder.group({
                    id: [null],
                    empleadoId: new FormControl(null),
                    idioma: new FormControl(curso.idioma),
                    programa: new FormControl(curso.programa[i]),
                    comentarios: new FormControl(curso.comentarios),
                    activo: new FormControl(true)
                });
                this.cursos.push(form);
            }else{
                cursosDuplicados.push(curso.programa[i].nombre);
            }
        }

        if(cursosDuplicados.length >0){
            this._matSnackBar.open(this.translate.instant('Los siguientes programas ya han sido a�adidos: '+cursosDuplicados.join()), 'OK', {
                duration: 5000,
            });
        }
    }

    nuevaCategoria(categoria){
        let categoriasDuplicadas = [];
        let index = this.categorias.value.findIndex(categoriaArray =>{
            return categoriaArray.activo && (categoriaArray.idioma.valor == categoria.idioma.valor)
        });
        if(index == -1){
            let form = this._formBuilder.group({
                id: [null],
                empleadoId: new FormControl(null),
                idioma: new FormControl(categoria.idioma),
                categoria: new FormControl(categoria.categoria),
                activo: new FormControl(true)
            });
            this.categorias.push(form);
        }else{
            categoriasDuplicadas.push(categoria.idioma.valor);
        }
        

        if(categoriasDuplicadas.length >0){
            this._matSnackBar.open(this.translate.instant('Solo puedes tener un idioma por categoria'), 'OK', {
                duration: 5000,
            });
        }
    }

    deshabilitarCampos(event){
        this.deshabilitarBotones = true;
    }

    newBeneficiario(): void {
        this.beneficiarioGroup = this.createEmpleadoBeneficiarioForm(null, this.empleado);
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

        this.beneficiarioGroup = this.createEmpleadoBeneficiarioForm(selectedBeneficiario.getRawValue(), this.empleado);
        this.beneficiarioGroupIndex = index;

        this.beneficiarioEnEdicion = true;
    }


    addBeneficiario(): void {
        if (this.beneficiarioGroup.valid) {
            
            if(this.beneficiarioGroupIndex != null){
                this.beneficiarios.controls[this.beneficiarioGroupIndex] = this.createEmpleadoBeneficiarioForm(this.beneficiarioGroup.getRawValue(), this.empleado);
            }

            this.beneficiarioEnEdicion = false;

        } else {

            for (const key of Object.keys(this.beneficiarioGroup.controls)) {
                if (this.beneficiarioGroup.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                     
                        invalidControl.focus();
                        break;
                    }

                }
            }

            this._empleadoService.cargando = false;
            //this.contactoGroup.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }
    }


    imageChangedEvent: any = '';
    croppedImage: any = '';

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }

    verContrato(empleadoContacto): void{
        this._empleadoService.getArchivoURL('/api/v1/empleados-contratos/preview', this.empleado, true);
    }

    descargarContrato(empleadoContacto): void{
        this._empleadoService.getArchivoURL('/api/v1/empleados-contratos/preview', this.empleado, false);
    }
}
