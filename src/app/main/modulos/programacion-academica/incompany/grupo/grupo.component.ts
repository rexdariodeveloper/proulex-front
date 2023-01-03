import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, FormArray, Form } from '@angular/forms';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { GrupoService } from './grupo.service';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take, pairwise, startWith, distinctUntilChanged } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { ProgramaGrupoIncompany, ProgramaGrupoIncompanyEditarProjection } from '@app/main/modelos/programa-grupo-incompany';
//import { ProgramaGrupoIncompanyGrupo, ProgramaGrupoIncompanyGrupoEditarProjection } from '@app/main/modelos/programa-grupo-incompany-grupo';
import { ProgramaGrupo, ProgramaGrupoEditarProjection } from '@app/main/modelos/programa-grupo';
import { ProgramaGrupoIncompanyHorario, ProgramaGrupoIncompanyHorarioEditarProjection } from '@app/main/modelos/programa-grupo-incompany-horario';
import { ProgramaGrupoIncompanyMaterial, ProgramaGrupoIncompanyMaterialEditarProjection } from '@app/main/modelos/programa-grupo-incompany-material';
import { ProgramaGrupoIncompanyClaseCancelada, ProgramaGrupoIncompanyClaseCanceladaEditarProjection } from '@app/main/modelos/programa-grupo-incompany-clase-cancelada';
import { ProgramaGrupoIncompanyClaseReprogramada, ProgramaGrupoIncompanyClaseReprogramadaEditarProjection } from '@app/main/modelos/programa-grupo-incompany-clase-reprogramada';
import { ProgramaGrupoIncompanyCriterioEvaluacion, ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection } from '@app/main/modelos/programa-grupo-incompany-criterio-evaluacion';
import { PAActividadEvaluacionComboProjection } from '@app/main/modelos/paactividad';
import { PrecioIncompanyComboProjection, PrecioIncompanyComboZonaProjection, PrecioIncompanyComisionProjection } from '@app/main/modelos/precio-incompany';
import { ProgramaIdiomaComboProjection } from '@app/main/modelos/programa-idioma';
import { ClienteComboProjection } from '@app/main/modelos/cliente';
import { ProgramaIdiomaEditarProjection, ProgramaIdioma } from '@app/main/modelos/programa-idioma';
import { PAModalidadComboProjection, PAModalidad } from '@app/main/modelos/pamodalidad';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { AlumnoAsistencia } from '@app/main/modelos/alumno-asistencia';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { EmpleadoComboProjection } from '@app/main/modelos/empleado';
import { MatTableDataSource } from '@angular/material/table';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { SucursalComboIncompanyProjection, SucursalComboProjection } from '@app/main/modelos/sucursal';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import * as moment from 'moment';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { CriterioEvaluacionComponent } from './dialogs/criterio-evaluacion/criterio-evaluacion.dialog';
import { ModalidadPersonalizadaComponent } from './dialogs/modalidad-personalizada/modalidad-personalizada.dialog';
import { ModalidadHorarioComponent } from './dialogs/modalidad-horario/modalidad-horario.dialog';
import { ReprogramarClaseComponent } from './dialogs/reprogramar-clase/reprogramar-clase.dialog';
import { FechasHabilesService } from '@services/fechas-habiles.service';
import { ProgramaGrupoProfesorListadoGrupoProjection } from '@app/main/modelos/programa-grupo-profesor';
import { CambioProfesorTitularIncompanyComponent } from './dialogs/cambio-profesor-titular/cambio-profesor-titular.dialog';
import { ProgramaGrupoListadoClase, ProgramaGrupoListadoClaseEditarProjection } from '@app/main/modelos/programa-grupo-listado-clase';
import { ProgramaGrupoIncompanyComisionEditarProjection } from '@app/main/modelos/programa-grupo-incompany-comision';
import { ComisionComponent } from './dialogs/comision/comision.dialog';
import * as _ from 'lodash';
import { PrecioIncompanyDetalleEditarProjection } from '@app/main/modelos/precio-incompany-detalles';
//import { VerificarRfcComponent, VerificarRfcData } from './dialogs/verificar-rfc/verificar-rfc.dialog';

class Resumen {
    public alumnoId: number;
    public asistencias: number;
    public faltas: number;
    public retardos: number;

    constructor(){
        this.alumnoId = null;
        this.asistencias = 0;
        this.faltas = 0;
        this.retardos = 0;
    }
}

class ProfesoresTitularesIncompanyController {

    public profesoresTitularesMap: {[fecha:string]: ProgramaGrupoProfesorListadoGrupoProjection} = {};
    public profesoresSuplentesMap: {[fecha:string]: ProgramaGrupoListadoClaseEditarProjection} = {};
    
    private fechasHabiles: string[] = [];
    private profesoresTitulares: ProgramaGrupoProfesorListadoGrupoProjection[] = [];
    private profesoresSuplentes: ProgramaGrupoListadoClaseEditarProjection[] = [];

    constructor(fechasHabiles: string[], profesoresTitulares: ProgramaGrupoProfesorListadoGrupoProjection[], profesoresSuplentes: ProgramaGrupoListadoClaseEditarProjection[]){
        this.fechasHabiles = fechasHabiles;
        this.profesoresTitulares = profesoresTitulares.filter(profesor => {
            return profesor.activo;
        });
        this.profesoresSuplentes = profesoresSuplentes;
        this.setProfesoresMap();
    }

    setProfesoresMap(){
        this.profesoresTitularesMap = {};
        let profesorInicial: ProgramaGrupoProfesorListadoGrupoProjection = null;
        this.profesoresTitulares.forEach(profesorTitular => {
            this.profesoresTitularesMap[profesorTitular.fechaInicio] = profesorTitular;
            if(!profesorInicial){
                profesorInicial = profesorTitular;
            }
        });
        this.profesoresSuplentes.forEach(profesorSuplente => {
            this.profesoresSuplentesMap[profesorSuplente.fecha] = profesorSuplente;
            if(!profesorInicial){
                profesorInicial = profesorSuplente;
            }
        });
        let profesorActual: ProgramaGrupoProfesorListadoGrupoProjection = profesorInicial;
        this.fechasHabiles.forEach(fechaHabil => {
            if(!!this.profesoresTitularesMap[fechaHabil]){
                profesorActual = this.profesoresTitularesMap[fechaHabil];
            }else{
                this.profesoresTitularesMap[fechaHabil] = profesorActual;
            }
        });

    }

    setProfesoresSuplentes(profesoresSuplentes: ProgramaGrupoListadoClaseEditarProjection[]){
        this.profesoresSuplentes = profesoresSuplentes;
        this.setProfesoresMap();
    }

    agregarProfesorTitular(profesor: ProgramaGrupoProfesorListadoGrupoProjection){
        this.profesoresTitulares = this.profesoresTitulares.filter(profesorTitular => {
            return profesorTitular.fechaInicio < profesor.fechaInicio;
        });
        this.profesoresTitulares.push(profesor);
        this.setProfesoresMap();
    }

    getProfesoresTitulares(): ProgramaGrupoProfesorListadoGrupoProjection[]{
        return this.profesoresTitulares;
    }

}


@Component({
    selector: 'grupo',
    templateUrl: './grupo.component.html',
    styleUrls: ['./grupo.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class GrupoComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

    contadorRegistrosNuevos: number = -1;

    usuarioActual: Usuario;

	CMM_CXPP_FormaPago = ControlesMaestrosMultiples.CMM_CXPP_FormaPago;

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    grupo: ProgramaGrupoIncompany;
    form: FormGroup;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */
    idiomas : ControlMaestroMultipleComboProjection[];
    modalidadesDatos: PAModalidadComboProjection[];
    unidadesMedidas: UnidadMedidaComboProjection[];
    articulos: ArticuloComboProjection[];
    sucursales: SucursalComboIncompanyProjection[];
    test: PAActividadEvaluacionComboProjection[];
    testFormat: ControlMaestroMultipleComboProjection[];
    plataformas: ControlMaestroMultipleComboProjection[];
    tiposGrupos: ControlMaestroMultipleComboProjection[];
    zonas: ControlMaestroMultipleComboProjection[];
    clientes: ClienteComboProjection[];
    cursos: ProgramaIdiomaComboProjection[];
    profesores: EmpleadoComboProjection[];
    criteriosEvaluacion: any[];
    listaZona: PrecioIncompanyComboZonaProjection[];
	/*rolControl: FormControl;
    estatusControl: FormControl;
	
    estadosNacimiento: EstadoComboProjection[];
    estadosCiviles: ControlMaestroMultipleComboProjection[];
    generos: ControlMaestroMultipleComboProjection[];
	tiposContratos: ControlMaestroMultipleComboProjection[];
    puestos: ControlMaestroMultipleComboProjection[];
    tiposEmpleados: ControlMaestroMultipleComboProjection[];
	paises: PaisComboProjection[];
	estados: EstadoComboProjection[];
	monedas: MonedaComboProjection[];
	departamentos: DepartamentoComboProjection[];
    sucursales: SucursalComboProjection[];
    roles: any;
    estatus: any;

	paisControl: FormControl = new FormControl();
	estadoControl: FormControl = new FormControl();
    estadoNacimientoControl: FormControl = new FormControl();*/
    activoControl: FormControl = new FormControl();
	@ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;
    @ViewChild('modalidadSelect') modalidadSelect: PixvsMatSelectComponent;
    @ViewChild('nivelSelect') nivelSelect: PixvsMatSelectComponent;
    @ViewChild('cursoSelect') cursoSelect: PixvsMatSelectComponent;
    @ViewChild('materialSelect') materialSelect: PixvsMatSelectComponent;
    @ViewChild('sucursalSelect') sucursalSelect: PixvsMatSelectComponent;

    idiomaControl: FormControl = new FormControl();

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;

    fechaActual = moment(new Date()).format('YYYY-MM-DD');

    sucursalControl: FormControl = new FormControl();
    clienteControl: FormControl = new FormControl();
    plataformaControl: FormControl = new FormControl();
    programaIdiomaControl: FormControl = new FormControl();
    modalidadControl: FormControl = new FormControl();
    tipoGrupoControl: FormControl = new FormControl();
    empleadoControl: FormControl = new FormControl();
    materialControl: FormControl = new FormControl();
    nivelControl: FormControl = new FormControl();
    precioControl: FormControl = new FormControl();
    modalidadTemp: any;


    displayedColumnsArchivos: string[] = ['nombreOriginal', 'creadoPor', 'fecha','boton'];
    displayedColumnsGrupos: string[] = ['codigo', 'nombre', 'alias','fechaInicio','fechaFin','profesor','boton','acciones'];
    displayedColumnsClases: string[] = ['id', 'fecha', 'nivel','estatus','acciones'];

    displayedColumnsCriteriosEvaluacion: string[] = ['actividadEvaluacion.actividad', 'modalidad.nombre', 'testFormat.valor','fechaAplica','score','time', 'acciones', 'boton'];
    displayedColumnsFooterCriteriosEvaluacion: string[] = ['actividadEvaluacion.actividad', 'modalidad.nombre', 'testFormat.valor','fechaAplica','score','time'];

    deshabilitarBotones: boolean = true;

    archivos : any[];
    archivosFormArray: FormArray = new FormArray([]);

    grupoAdd: FormGroup; 
    gruposFormArray: FormArray = new FormArray([]);
    datosTablaGrupos = [];

    horariosFormArray: FormArray = new FormArray([]);
    criteriosEvaluacionFormArray: FormArray = new FormArray([]);
    clasesCanceladasFormArray: FormArray = new FormArray([]);
    clasesReprogramadasFormArray: FormArray = new FormArray([]);
    materialesFormArray: FormArray = new FormArray([]);
    clasesFormArray: FormArray = new FormArray([]);
    clasesTabla = [];
    gruposTabla = [];

    filterBy: string;

    vistaPrincipal: boolean = true;

    animationDirection: 'left' | 'right' | 'none';
    currentStep: number;

    steps = [];

    jsonNiveles = [];

    horasTotales: number = 0;

    totalDias: number = 0;
    horario = [];
    horarioMostrar: string;

    grupoSelected: number;
    criterioSelected: number;

    modalidadPersonalizada: boolean = false;
    modalidadPersonalizadaCombo = {
        id: 9999,
        nombre: 'Personalizada',
        codigo: 'PER'
    }

    mostrarGuardar: boolean = false;
    mostrarEditar: boolean = true;
    mostrarBorrar: boolean = true;

    guardando: boolean = false;

    claseReprogramarSelected: number;

    selectedIndex = 0;

    reverseModalidad: boolean = false;

    listadoClases : any[];


    //Datos para calificaciones asistencias
    tests: any[];
    alumnos: any[];
    inscripciones: any[];

    //Variables calificaciones
    dataSourceCalificaciones: any[] = [];
    calificaciones: any[] = [];
    metricas: any[] = [];
    tareas: any[] = [];
    displayedColumnsCalificaciones: string[] = [];
    tableGroups: any[] = [];
    displayedTableGroups: string[] = [];
    tableHeaders: any[] = [];
    displayedTableHeaders: string[] = [];
    controls: FormArray = null;

    //Variables asistencias
    fechas: Date[] = [];
    resumeColumns: string[] = [];
    dateColumns: any[] = [];
    resumeDataSource: any[] = [];
    hasChanges: boolean = false;
    opened: boolean = false;
    asistencias: any[] = [];
    faltasPermitidas: number = 0;
    duracionClase: number = 0;
    diasSemana: string = '';
    fechasAsistencias: Date[] = [];
    resumenes: any[] = [];
    dataSources: any[] = [];
    displayedColumnsAsistencias: string[] = [];
    editIndex: number = null;
    isReady: boolean = false;
    currentIndex: number = 0;
    editableIndex: number = null;
    horasDia: number = 0;
    minutosTotal: number = 0;
    tableMode: 'detail' | 'resume' = 'detail';
    modalidad: PAModalidadComboProjection;
    historial: any[];
    mostrarCalificaciones: boolean = true;
    mostrarAsistencias: boolean = false;
    displayedColumnsAlumnos: string[] = ['imagen', 'codigo','primerApellido','segundoApellido','nombre','edad','correoElectronico','telefono','inscripcion','ordenVenta'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource([]);

    permisoSueldo: boolean;
    permisoPrecio: boolean;
    permisoPorcentaje: boolean;
    permisoCategoria: boolean = false;
    permisoComision: boolean;
    profesoresTitularesController: ProfesoresTitularesIncompanyController;
    nuevoProfesorTitular: EmpleadoComboProjection = null;
    listadoClasesProfesores: FormArray = new FormArray([]);
    permisos: any;

    criterioEconomicoFormGroup: FormGroup;

    // Comisiones
    precioDetalle: PrecioIncompanyDetalleEditarProjection;
    listaPrecio: PrecioIncompanyComisionProjection[] = [];
    listaUsuario: UsuarioComboProjection[] = [];
    listaComisionFormArray: FormArray = new FormArray([]);
    displayedColumnsListaComision: string[] = ['empleado', 'porcentaje', 'montoComision','acciones','boton'];

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
        public _grupoService: GrupoService,
        private el: ElementRef,
        public validatorService: ValidatorService,
        private _changeDetectorRef: ChangeDetectorRef,
        public fechasHabilesService: FechasHabilesService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.grupo = new ProgramaGrupoIncompany();

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        //this.tabIndex = 0;

        this.usuarioActual = JSON.parse(localStorage.getItem('usuario'));

        this.filterBy = 'all';

        this.animationDirection = 'none';
        this.currentStep = 0;
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
                this.grupo = new ProgramaGrupoIncompany();
                this.mostrarBorrar = false;
                this.mostrarEditar = false;
                this.mostrarGuardar = true;
            }
            else{
                this.mostrarBorrar = true;
                this.mostrarEditar = true;
                this.mostrarGuardar = false;
            }

            this.config = {
                rutaAtras: "/app/programacion-academica/incompany",
                rutaBorrar: "/api/v1/incompany/grupos/delete/",
                icono: "book"
            }

        });
        // Subscribe to update proveedor on changes
        this._grupoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos && datos.grupo) {
                    this.grupo = datos.grupo;
                    this.titulo = this.grupo.codigo;
                } else {
                    this.grupo = new ProgramaGrupoIncompany();
                }
                this.archivos = [];
                this.idiomas = datos.idiomas;
                //this.modalidadesDatos = datos.modalidades;
                this.unidadesMedidas = datos.unidadesMedidas;
                this.articulos = datos.articulos;
                this.sucursales = datos.sucursales;
                this.clientes = datos.clientes;
                this.zonas = datos.zonas;
                this.form = this.createProgramaForm();
                //this.cursos = datos.cursos;
                this.test = datos.test;
                this.testFormat = datos.testFormat;
                this.plataformas = datos.plataformas;
                this.tiposGrupos = datos.tipoGrupo;
                this.profesores = datos.profesores;
                this.permisoSueldo = datos.permisoSueldo;
                this.permisoPrecio = datos.permisoPrecio;
                this.permisoPorcentaje = datos.permisoPorcentaje;
                this.permisoComision = datos.permisoComision;
                this.permisos = datos.permisos;
                this.listaUsuario = datos.listaUsuario;
                this.listaPrecio = datos.listaPrecio;

                if (this.pageType == 'ver') {
                    this.form.disable();
                    this.deshabilitarBotones = false;
                } else {
                    this.form.enable();
                    //this.usuarioGroup.enable();
                }
                

            });

            this.fechasHabilesService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((datos) => {
                if(!!datos){
                    this.listadoClases = datos;
                    if(this.grupoAdd){
                        //Asistencias
                        let horasDia: number = this.modalidad?.horasPorDia;
                        datos.forEach(fecha => {
                            this.fechasAsistencias.push(moment(fecha).toDate());
                        });
                        let prevIndex = this.currentIndex;
                        this.editableIndex = null;
                        this.minutosTotal = horasDia * this.fechas.length * 60;
                        this.dataSources = [];
                        
                        this.fechasAsistencias.forEach((fecha, i) => {
                            let source: any[] = [];

                            this.alumnos?.forEach(alumno => {
                                
                                let asistencia: any = this.asistencias.find( reg => {return moment(reg.fecha).diff(moment(fecha), 'days') == 0 && reg.alumnoId == alumno.id });
                                if(!asistencia){
                                    asistencia = new AlumnoAsistencia();
                                    asistencia.alumno = alumno;
                                    asistencia.alumnoId = alumno.id;
                                    asistencia.grupo = this.grupo;
                                    asistencia.grupoId = this.grupo.id;
                                    asistencia.fecha = moment(fecha).toDate();
                                    asistencia.tipoAsistenciaId = moment().startOf('day').diff(moment(fecha), 'days') == 0 ? ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.ASISTENCIA : null;
                                }
                                source.push(asistencia);
                            });
                            
                            if(prevIndex == 0){
                                if(moment().startOf('day').diff(moment(fecha), 'days') == 0)
                                    this.currentIndex = i;
                            }
                            else{
                                this.currentIndex = prevIndex;
                            }
                            this.dataSources.push(source);
                        });
                    }
                }
            });

        // Subscribe to update proveedor on changes
        this._grupoService.onComboZonaChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((_listaZona: PrecioIncompanyComboZonaProjection[]) => {
            if(!!_listaZona){
                if(_listaZona.length == 0){
                    this._matSnackBar.open('No hay las zonas', 'OK', {
                        duration: 5000,
                    });
                }
                this.listaZona = _listaZona;
            }
        });
    }

    ngAfterView(){

    }

    createProgramaForm(): FormGroup {
        this.sucursalControl = new FormControl(this.grupo.sucursal, [Validators.required]);
        this.clienteControl = new FormControl(this.grupo.cliente, [Validators.required]);

        this.sucursalControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (this.sucursalControl.value) {
                this._grupoService.getSucursales(this.sucursalControl.value.id).then(value =>{
                    this.cursos = value.data;
                    this.cursoSelect?.setDatos(this.cursos);
                });
            }
        });

        if(this.grupo.archivos){
            this.grupo.archivos.forEach(documento =>{
                this.archivos.push({
                    id: documento.archivo.id,
                    nombreOriginal: documento.archivo.nombreOriginal,
                    fecha: documento.archivo.fechaCreacion,
                    creadoPor: documento.archivo.creadoPor.nombre+' '+documento.archivo.creadoPor.primerApellido
                })
            })
        }

        if(this.grupo.grupos){
            this.grupo.grupos.forEach(grupo =>{
                this.gruposFormArray.push(this.createGrupoForm(grupo,this.grupo.id));
            });
            this.gruposTabla = this.gruposFormArray.value.filter(grupo =>{
                return !moment(this.fechaActual).isAfter(moment(grupo.fechaFin)) ;
            });
        }

        let form: FormGroup = this._formBuilder.group({
            id: [this.grupo.id],
            sucursal: this.sucursalControl,
            cliente: this.clienteControl,
            grupos: this.gruposFormArray,
            activo: new FormControl(this.grupo.activo == null ? true : this.grupo.activo),
            codigo: new FormControl(this.grupo.codigo)
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }

    getGruposActivos(){
        this.filterBy='all';
        this.gruposTabla = this.gruposFormArray.value.filter(grupo =>{
            return !moment(this.fechaActual).isAfter(moment(grupo.fechaFin)) && grupo.estatus.id != 2000622;
        });
    }

    getGruposFinalizados(){
        this.filterBy='frequent';
        this.gruposTabla = this.gruposFormArray.value.filter(grupo =>{
            return moment(this.fechaActual).isAfter(moment(grupo.fechaFin));
        });
    }

    getGruposCancelados(){
        this.filterBy='starred';
        this.gruposTabla = this.gruposFormArray.value.filter(grupo =>{
            return grupo.estatus.id == 2000622;
        });
    }


    /*createIdiomaCertificacionForm(certificacion: ProgramaIdiomaCertificacionEditarProjection, idioma: ProgramaIdiomaEditarProjection): FormGroup {
        certificacion = certificacion ? certificacion : new ProgramaIdiomaCertificacionEditarProjection;

        let form: FormGroup = this._formBuilder.group({
            id: [certificacion.id],
            programaIdiomaId: new FormControl(idioma.id),
            nivel: new FormControl(certificacion.nivel),
            certificacion: new FormControl(certificacion.certificacion),
            precio: new FormControl(certificacion.precio)
        })

        return form;
    }*/



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

    guardar() {
        this.guardando = true;
        if (this.croppedImage) {
            this.form.get('img64').setValue(this.croppedImage);
        }
   
        if(this.archivos && this.archivos.length>0){
            this.setArchivos(this.archivos);
            this.form.addControl('archivos',this.archivosFormArray);
        }
        if (this.form.valid) {
            this._grupoService.cargando = true;

    		this.form.disable();
            this._grupoService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/incompany/grupos/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                            duration: 5000,
    					});
    					this.form.disable();
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._grupoService.cargando = false;
                        this.form.enable();
                    }
                }.bind(this)
            );
        } else {
            this.guardando = false;
            for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {                          
                        invalidControl.focus();
                        break;
                    }

                }
            }

            this._grupoService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }


    deshabilitarCampos(event){
        this.deshabilitarBotones = true;
    }

    pdfChangeEvent(event: any){
        let archivo: File = null;
        if(event?.target?.files?.length){
            for(let file of event.target.files){ archivo = file; }
        }
        if(!!archivo){
            this._grupoService.subirArchivo(archivo,"").then(archivoResponse =>{
                this.archivos.push({
                    nombreOriginal: archivo.name,
                    id:archivoResponse.data,
                    fecha: this.fechaActual,
                    creadoPor: this.usuarioActual.nombre +' '+this.usuarioActual.primerApellido
                });
                this.archivos = [...this.archivos];
            });
        }
    }

    descargarPDF(archivo: any){
        if(archivo){
            this._grupoService.verArchivo(archivo);
        }
    }

    setArchivos(archivos: any[]){
        this.archivosFormArray = new FormArray([]);
        archivos.forEach(archivo =>{
            let form = this._formBuilder.group({
                id:[null],
                archivoId: new FormControl(archivo.id),
                programaIncompanyId: new FormControl(this.grupo.id)
            })
            this.archivosFormArray.push(form);
        });
    }

    nuevoGrupo(grupo: ProgramaGrupoEditarProjection){
        if(this.sucursalControl.value != null){
            
            this.modalidadPersonalizada = false;
            if(grupo == null || grupo.id == null){
                this.steps =[
                    {
                        title:'Datos del grupo'
                    },
                    {
                        title:'Criterios de evaluación'
                    },
                    {
                        title:'Criterios económicos'
                    },
                    {
                        title: 'Comisiones'
                    }
                ];
            }
            else{
                this.steps =[
                    {
                        title:'Datos del grupo'
                    },
                    {
                        title:'Criterios de evaluación'
                    },
                    {
                        title:'Criterios económicos'
                    },
                    {
                        title: 'Comisiones'
                    },
                    {
                        title:'Listado de clases'
                    },
                    {
                        title:'Alumnos'
                    },
                    {
                        title:'Asistencias y Calificaciones'
                    }
                ];
            }
            grupo = grupo ? grupo : new ProgramaGrupoEditarProjection();
            if(grupo.id != null){
              this.grupoSelected = this.gruposFormArray.value.findIndex(grupoArray =>{
                    return grupoArray?.codigo == grupo.codigo
                });  
            }

            // Obtenemos el precio de detalle
            this.getPrecioDetalle(grupo, false);

            /////////////////////////////Calificaciones y Asistencias ////////////////////////////
            if(grupo.id != null){
                this._grupoService.getAsistenciasCalificaciones(grupo.id).then(value =>{
                    if(value.data){ 
                        let datos = value.data;
                        this.alumnos = datos.alumnos.map(a => a.alumno).sort((a,b) => this.compare(a,b));
                        this.modalidad = datos?.modalidad;
                        let dias: boolean[] = [!!this.modalidad?.domingo, !!this.modalidad?.lunes, !!this.modalidad?.martes, !!this.modalidad?.miercoles, !!this.modalidad?.jueves, !!this.modalidad?.viernes, !!this.modalidad?.sabado];
                        this.fechasHabilesService.getFechasHabiles(moment(grupo?.fechaInicio).format('YYYY-MM-DD'), moment(grupo?.fechaFin).format('YYYY-MM-DD'), dias).then(x =>{
                            //this.cursos = datos.cursos;
                            //this.sucursales = datos.sucursales;
                            this.metricas = datos.metricas;
                            this.tareas = datos.actividades;
                            this.calificaciones = datos.calificaciones;
                            this.inscripciones = datos.inscripciones;
                            this.dataSource.data = this.inscripciones || [];
                            this.tests = datos.tests;
                            this.tests = [...new Map(this.tests.map(item => [item.actividad, item])).values()];
                            this.tableGroups = [];
                            this.tableGroups.push({id: null, name: 'g0', label: '', span: 5, porcentaje: null});
                            datos.metricas.forEach( m => {
                                let actividades = datos.actividades.filter(a => a?.evaluacionId == m?.id);
                                let puntos = 0;
                                actividades.forEach(actividad => { puntos += actividad?.puntaje; });
                                let span = actividades.length > 0 ? actividades.length : 1;
                                this.tableGroups.push({id: m?.id, name: ('g' + m?.id), label: m?.nombre, span: span, porcentaje: m?.porcentaje, puntos: m?.porcentaje/puntos});
                            });
                            this.tableGroups.push({id: null, name: 'gt', label: '', span: 1, porcentaje: null});
                            this.displayedTableGroups = this.tableGroups.map((item) => {return item?.name});
                            this.tableHeaders = [];
                            this.tableHeaders.push({id: null, name: 'codigo', label: 'Código', puntaje: null});
                            this.tableHeaders.push({id: null, name: 'apellido1', label: 'Primer apellido', puntaje: null});
                            this.tableHeaders.push({id: null, name: 'apellido2', label: 'Segundo apellido', puntaje: null});
                            this.tableHeaders.push({id: null, name: 'nombre', label: 'Nombre', puntaje: null});
                            datos?.actividades.forEach( a => {
                                let g = this.tableGroups.find( tg => tg.id == a.evaluacionId);
                                this.tableHeaders.push({id: a?.id, name: ('a' + a?.id), label: a?.nombre, puntaje: a?.puntaje, puntos: g.puntos});
                            });
                            this.tableHeaders.push({id: null, name: 'total', label: 'Calificación Final', puntaje: null});
                            this.displayedTableHeaders = this.tableHeaders.map((item) => {return item?.name});
                            let array = [];
                            this.alumnos.forEach( alumno => {
                                let obj = {};
                                obj['codigo'] = alumno?.codigo;
                                obj['apellido1'] = alumno.primerApellido;
                                obj['apellido2'] = alumno.segundoApellido;
                                obj['nombre'] = alumno.nombre;
                                datos.actividades.forEach(actividad => {
                                    let calificacion = this.calificaciones.find( c => c.alumnoId == alumno.id && c.programaIdiomaExamenDetalleId == actividad.id);
                                    obj[('a'+ actividad.id)] = calificacion?.puntaje || 0;
                                });
                                obj['total'] = 0.00;
                                array.push(obj);
                            });
                            if(array && array.length > 0){
                                this.displayedColumnsCalificaciones = Object.keys(array[0]);
                                this.dataSourceCalificaciones = array;

                                let groups = this.dataSourceCalificaciones.map((item) => {
                                    let formGroup = new FormGroup({});
                                    Object.keys(item).forEach((field) => {
                                        formGroup.addControl(field, this._formBuilder.control(item[field]) );
                                    });
                                    return formGroup;
                                });

                                this.controls = new FormArray(groups);

                                for (let i = 0; i < this.controls.length; i++) {
                                    this.calculateRow(i);
                                }
                            }

                            this.historial = datos.historial;

                            //Asistencias
                            this.asistencias = datos?.asistencias || [];
                            this.displayedColumnsAsistencias = ['codigo','apellido1', 'apellido2', 'nombre', 'asistencia', 'resumen','comentarios'];
                            this.resumeColumns = ['codigo','apellido1','apellido2','nombre'];
                            
                            let horasDia: number = this.modalidad.horasPorDia;
                            this.horasDia = horasDia;
                            let diasAsistencias: boolean[] = [!!this.modalidad?.domingo, !!this.modalidad?.lunes, !!this.modalidad?.martes, !!this.modalidad?.miercoles, !!this.modalidad?.jueves, !!this.modalidad?.viernes, !!this.modalidad?.sabado];
                            this.diasSemana = this.getDiasSemana(dias);
                            //this.fechasAsistencias = [];
                            this.faltasPermitidas = (datos?.faltas / 100) || 0;
                            this.getResumen();

                            this.dateColumns = [];
                            
                            this.fechasAsistencias.forEach((fecha,i) => {
                                this.dateColumns.push({name: 'fecha'+i, label: moment(fecha).format('YYYY-MM-DD')});
                                this.resumeColumns.push('fecha'+i);
                            });

                            this.getCondensado();
                        });
                        
                    }
                });
            }

            // if(grupo.id != null)
            //     this.getComboZona(true, grupo);


            //////////////////////////////////////////////////////////////////////////////////////
            let materialesSelected = [];
            this.horariosFormArray = new FormArray([]);
            this.criteriosEvaluacionFormArray = new FormArray([]);
            this.clasesCanceladasFormArray = new FormArray([]);
            this.clasesReprogramadasFormArray = new FormArray([]);
            this.programaIdiomaControl = new FormControl(grupo.programaIdioma, [Validators.required]);
            this.modalidadControl = new FormControl(grupo.paModalidad);
            this.materialControl = new FormControl(grupo.materiales, [Validators.required]);
            this.tipoGrupoControl = new FormControl(grupo.tipoGrupo, [Validators.required]);
            this.plataformaControl = new FormControl(grupo.plataforma, [Validators.required]);
            this.empleadoControl = new FormControl(grupo.empleado, [Validators.required]);
            this.precioControl = new FormControl(grupo.precioIncompany, [Validators.required]);
            this.nivelControl = new FormControl(null);
            this.listaComisionFormArray = new FormArray([]);
            if(grupo.nivel){
                let nivel ={
                    id: grupo.nivel,
                    nombre: 'Nivel '+grupo.nivel
                }
                this.nivelControl = new FormControl(nivel, [Validators.required]);
            }else{
                this.nivelControl = new FormControl(null, [Validators.required]);
            }

            this.nivelControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                if(this.nivelControl.value){
                    this._grupoService.getArticulos(this.programaIdiomaControl.value.id,this.nivelControl.value.id).then(value =>{
                        if(value.data){ 
                            this.materialControl = new FormControl(null, [Validators.required]);
                            let selectedMaterial = value.data.selectedArticulo;
                            this.grupoAdd.get('materialControl').setValue([selectedMaterial]);
                            this.articulos = value.data.articulos;
                            this.materialSelect.setDatos(this.articulos);
                            
                        }
                    });
                } 
            });

            this.precioControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((zona: PrecioIncompanyComboZonaProjection) => {
                if(!!zona){
                    this.criterioEconomicoFormGroup.controls.porcentajeApoyoTransporte.setValue(zona.porcentajeTransporte);
                    this.criterioEconomicoFormGroup.controls.precioVentaGrupo.setValue(zona.precioVenta);
                    const clientePrecioVentaCurso: number = parseFloat((this.precioDetalle.precioVenta * (this.criterioEconomicoFormGroup.controls.porcentajeComision.value / 100)).toFixed(2));
                    this.criterioEconomicoFormGroup.controls.clientePrecioVentaCurso.setValue(clientePrecioVentaCurso);
                    this.getPrecioDetalle(this.grupoAdd.value, true);
                }else{
                    // Limpiamos
                    this.criterioEconomicoFormGroup.controls.porcentajeApoyoTransporte.setValue(null);
                    this.criterioEconomicoFormGroup.controls.porcentajeApoyoTransporte.clearValidators();
                    this.criterioEconomicoFormGroup.controls.porcentajeApoyoTransporte.updateValueAndValidity();
                    this.criterioEconomicoFormGroup.controls.precioVentaGrupo.setValue(null);
                    this.criterioEconomicoFormGroup.controls.precioVentaGrupo.clearValidators();
                    this.criterioEconomicoFormGroup.controls.precioVentaGrupo.updateValueAndValidity();
                    this.criterioEconomicoFormGroup.controls.clientePrecioVentaCurso.setValue(null);
                    this.criterioEconomicoFormGroup.controls.clientePrecioVentaCurso.clearValidators();
                    this.criterioEconomicoFormGroup.controls.clientePrecioVentaCurso.updateValueAndValidity();
                }
            })

            this.empleadoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                if(this.grupoAdd.get('empleado').value?.nombreCompleto){
                    //this.createClases();
                    let dias: boolean[] = [!!this.modalidad?.domingo, !!this.modalidad?.lunes, !!this.modalidad?.martes, !!this.modalidad?.miercoles, !!this.modalidad?.jueves, !!this.modalidad?.viernes, !!this.modalidad?.sabado];
                    this.fechasHabilesService.getFechasHabiles(moment(this.grupoAdd.get('fechaInicio').value).format('YYYY-MM-DD'), moment(this.grupoAdd.get('fechaFin').value).format('YYYY-MM-DD'), dias);
                }
                if(this.grupoAdd.get('empleado').value){
                    if(this.grupoAdd.value.paModalidad?.horarios){
                        let horario = this.grupoAdd.value.paModalidad.horarios.filter(horario =>{
                            return horario.nombre == this.grupoAdd.value.horario;
                        });
                        this.permisoCategoria=false;
                        this._grupoService.getDatosSueldoIncompany(this.programaIdiomaControl.value.id,this.grupoAdd.get('empleado').value.id,horario[0].id).then(value =>{
                            try{
                               this.grupoAdd.get('categoriaProfesor').setValue(value.data.categoria);
                                this.grupoAdd.get('sueldoProfesor').setValue(value.data.sueldo); 
                            }catch(e){
                                this._matSnackBar.open(this.translate.instant('El curso o el profesor no tienen tabulador'), 'OK', {
                                    duration: 5000,
                                });
                            }
                            
                        });
                    }else{
                        this.permisoCategoria=true;
                    }
                    
                }
            });

            this.programaIdiomaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((idioma) => {
                this.nivelControl.reset();
                this.jsonNiveles = [];
                for(var i=0;i<this.programaIdiomaControl.value.numeroNiveles;i++){
                    this.jsonNiveles.push({
                        id:i+1,
                        nombre: 'Nivel '+(i+1)
                    });
                    this.nivelSelect?.setDatos(this.jsonNiveles);

                }
                //debugger;
                if(this.cursoSelect)
                    this.cursoSelect.setDatos(this.cursos);
                if(this.sucursalSelect)
                    this.sucursalSelect.setDatos(this.sucursales);
                if (this.programaIdiomaControl.value) {
                    this._grupoService.getComboModalidades(this.programaIdiomaControl.value.id).then(value =>{
                        this.modalidadesDatos = [];
                        const uniqueObjects = [...new Map(value.data.map(item => [item.id, item])).values()];
                        this.modalidadesDatos = uniqueObjects;
                        this.modalidadesDatos.sort(function(a, b) { 
                          return a.id - b.id  ||  a.nombre.localeCompare(b.nombre);
                        });                   
                        this.modalidadesDatos.push(this.modalidadPersonalizadaCombo)
                        this.modalidadSelect?.setDatos(this.modalidadesDatos)
                    });
                }
                if(grupo.id == null){
                    this.grupoAdd.get('calificacionMinima').setValue(this.programaIdiomaControl.value.calificacionMinima);
                    this.grupoAdd.get('faltasPermitidas').setValue(this.programaIdiomaControl.value.faltasPermitidas ? this.programaIdiomaControl.value.faltasPermitidas : 0);            
                    this.grupoAdd.get('plataforma').setValue(this.programaIdiomaControl.value.plataforma);
                }
                
            });

            this.modalidadControl.valueChanges.pipe(startWith(1), pairwise()).subscribe(([prevValue, selectedValue]) => {
                this.modalidadTemp = prevValue ? prevValue : null;
                if(this.modalidadControl.value?.id != 9999){
                    this.horasTotales = 0;
                    if(this.modalidadControl.value && this.modalidadControl.value.lunes){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;    
                    }
                    if(this.modalidadControl.value && this.modalidadControl.value.martes){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;
                    }
                    if(this.modalidadControl.value && this.modalidadControl.value.miercoles){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;
                    }
                    if(this.modalidadControl.value && this.modalidadControl.value.jueves){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;
                    }
                    if(this.modalidadControl.value && this.modalidadControl.value.viernes){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;
                    }
                    if(this.modalidadControl.value && this.modalidadControl.value.sabado){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;
                    }
                    if(this.modalidadControl.value && !this.reverseModalidad){
                        this.abrirModalModalidad(); 
                    }
                    if(this.reverseModalidad){
                        this.reverseModalidad = false;
                    }
                       
                    
                }else if(this.modalidadControl.value?.id == 9999){
                    this.abrirModalModalidadPersonalizada();
                }
                
                
            });

            /*this._grupoService.onComboModalidadChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoModalidades => {
                if (listadoModalidades) {
                    this.modalidadesDatos = [];
                    this._grupoService.onComboModalidadChanged.next(null);
                    
                }
            });*/

            if(grupo.materiales){
                grupo.materiales.forEach(material =>{
                    materialesSelected.push(material.articulo);
                    //this.materialesFormArray.push(this.createMaterialesForm(material, grupo));
                });
                this.materialControl = new FormControl(materialesSelected, [Validators.required]);
            }

            if(grupo.criteriosEvaluacion){
                grupo.criteriosEvaluacion.forEach(criterio =>{
                    this.criteriosEvaluacionFormArray.push(this.createCriteriosEvaluacionForm(criterio,grupo.id));
                });
            }

            if(grupo.listaComision){
                grupo.listaComision.map(comision => {
                    this.listaComisionFormArray.push(this.createComisionForm(comision));
                });
            }

            if(grupo.clasesCanceladas && grupo.clasesCanceladas.length > 0){
                grupo.clasesCanceladas.forEach(clase =>{
                    this.clasesCanceladasFormArray.push(this.createClaseCanceladaForm(clase));
                });
            }

            if(grupo.clasesReprogramadas && grupo.clasesReprogramadas.length > 0){
                grupo.clasesReprogramadas.forEach(clase =>{
                    this.clasesReprogramadasFormArray.push(this.createClaseReprogramadaForm(clase));
                });
            }

            if(grupo.paModalidad == null && grupo.id != null){
                this.modalidadControl = new FormControl(this.modalidadPersonalizadaCombo);
            }
            if(grupo.programaIdioma?.id){
                this._grupoService.getComboModalidades(this.programaIdiomaControl.value.id).then(value =>{
                    this.modalidadesDatos = value.data;
                    const uniqueObjects = [...new Map(value.data.map(item => [item.id, item])).values()];
                    this.modalidadesDatos = uniqueObjects;  
                    this.modalidadesDatos.push(this.modalidadPersonalizadaCombo);
                    this.modalidadSelect?.setDatos(this.modalidadesDatos);
                });
                if(this.modalidadControl && this.modalidadControl.value.id !=9999){
                       this.horasTotales = 0;
                    if(this.modalidadControl.value && this.modalidadControl.value.lunes){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;    
                    }
                    if(this.modalidadControl.value.martes){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;
                    }
                    if(this.modalidadControl.value.miercoles){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;
                    }
                    if(this.modalidadControl.value.jueves){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;
                    }
                    if(this.modalidadControl.value.viernes){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;
                    }
                    if(this.modalidadControl.value.sabado){
                        this.horasTotales = this.modalidadControl.value.horasPorDia + this.horasTotales;
                    }
                }
                
                for(var i=0;i<this.programaIdiomaControl.value.numeroNiveles;i++){
                    this.jsonNiveles.push({
                        id:i+1,
                        nombre: 'Nivel '+(i+1)
                    });
                }
            }

            if(grupo.horarios && grupo.horarios.length >0){
                grupo.horarios.forEach(horario =>{
                    this.horariosFormArray.push(this.createHorarioForm(horario))
                });
                this.modalidadesDatos = [];
                this.modalidadPersonalizada = true;
                this.modalidadControl = new FormControl(this.modalidadPersonalizadaCombo);
            }

            // Criterios Economicos
            this.criterioEconomicoFormGroup = this._formBuilder.group({
                precioIncompany: this.precioControl,
                precioVentaGrupo: new FormControl(grupo.precioVentaGrupo),
                clientePrecioVentaCurso: new FormControl(grupo.clientePrecioVentaCurso, [Validators.required]),
                clientePrecioVentaLibro: new FormControl(grupo.clientePrecioVentaLibro, [Validators.required]),
                clientePrecioVentaCertificacion: new FormControl(grupo.clientePrecioVentaCertificacion, [Validators.required]),
                precioVentaCurso: new FormControl(grupo.precioVentaCurso, [Validators.required]),
                precioVentaLibro: new FormControl(grupo.precioVentaLibro, [Validators.required]),
                precioVentaCertificacion: new FormControl(grupo.precioVentaCertificacion, [Validators.required]),
                porcentajeComision: new FormControl(grupo.id == null ? 4 :grupo.porcentajeComision, [Validators.required, Validators.min(0), Validators.max(100)]),
                porcentajeApoyoTransporte: new FormControl(grupo.porcentajeApoyoTransporte, [Validators.required, Validators.min(0), Validators.max(100)]),
                kilometrosDistancia: new FormControl(grupo.kilometrosDistancia, [Validators.required]),
                //precioMaterial: new FormControl(grupo.precioMaterial, [Validators.required]),
            });

            this.criterioEconomicoFormGroup.controls.porcentajeComision.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(porcentajeComision => {
                if(!!porcentajeComision){
                    const clientePrecioVentaCurso: number = parseFloat((this.precioDetalle.precioVenta * (porcentajeComision / 100)).toFixed(2));
                    this.criterioEconomicoFormGroup.controls.clientePrecioVentaCurso.setValue(clientePrecioVentaCurso);
                }
            });

            let form: FormGroup = this._formBuilder.group({
                id:[grupo.id],
                programaGrupoIncompany: new FormControl(this.grupo.id),
                programaIdioma: this.programaIdiomaControl,
                nivel: new FormControl(grupo.nivel ? grupo.nivel: null, [Validators.required]),
                alias: new FormControl(grupo.alias),
                paModalidad: this.modalidadControl,
                tipoGrupo: this.tipoGrupoControl,
                fechaInicio: new FormControl(grupo.fechaInicio ? moment(grupo.fechaInicio).format('YYYY-MM-DD'): null, [Validators.required]),
                fechaFin:  new FormControl(grupo.fechaFin ? moment(grupo.fechaFin).format('YYYY-MM-DD'): null, [Validators.required]),
                calificacionMinima: new FormControl(grupo.calificacionMinima, [Validators.required]),
                faltasPermitidas: new FormControl(grupo.faltasPermitidas, [Validators.required]),
                cupo: new FormControl(grupo.cupo ? grupo.cupo : 20, [Validators.required]),
                plataforma: this.plataformaControl,
                empleado: this.empleadoControl,
                materialControl: this.materialControl,
                nivelControl: this.nivelControl,
                codigo:new FormControl(grupo.codigo ? grupo.codigo : null),
                nombre: new FormControl(grupo.nombre),
                precioIncompany: this.criterioEconomicoFormGroup.controls.precioIncompany.value,
                precioVentaGrupo: this.criterioEconomicoFormGroup.controls.precioVentaGrupo.value,
                clientePrecioVentaCurso: this.criterioEconomicoFormGroup.controls.clientePrecioVentaCurso.value,
                clientePrecioVentaLibro: this.criterioEconomicoFormGroup.controls.clientePrecioVentaLibro.value,
                clientePrecioVentaCertificacion: this.criterioEconomicoFormGroup.controls.clientePrecioVentaCertificacion.value,
                precioVentaCurso: this.criterioEconomicoFormGroup.controls.precioVentaCurso.value,
                precioVentaLibro: this.criterioEconomicoFormGroup.controls.precioVentaLibro.value,
                precioVentaCertificacion: this.criterioEconomicoFormGroup.controls.precioVentaCertificacion.value,
                porcentajeComision: this.criterioEconomicoFormGroup.controls.porcentajeComision.value,
                porcentajeApoyoTransporte: this.criterioEconomicoFormGroup.controls.porcentajeApoyoTransporte.value,
                kilometrosDistancia: this.criterioEconomicoFormGroup.controls.kilometrosDistancia.value,
                //precioMaterial: this.criterioEconomicoFormGroup.controls.precioMaterial.value,
                horarios: this.horariosFormArray,
                horario: new FormControl(grupo['horario']),
                categoriaProfesor: new FormControl(grupo.categoriaProfesor),
                sueldoProfesor: new FormControl(grupo.sueldoProfesor),
                estatus: new FormControl(grupo.estatus)

            });

            form.controls.programaIdioma.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(_programa => {
                if(!!_programa){
                    this.getComboZona();
                }
                
            });

            form.controls.paModalidad.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(_paModalidad => {
                if(!!_paModalidad){
                    form.controls.horario.setValue('');
                    this.getComboZona();
                }else{

                }
            });

            this.grupoAdd = form;
            this.createDiasClases();
            // Obetenemos lista de zona
            this.getComboZona();
            
            this.vistaPrincipal = false;
            this.nivelControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                if(this.grupoAdd.get('nivelControl').value){
                  this.grupoAdd.get('nivel').setValue(this.grupoAdd.get('nivelControl').value.id);
                }
            });
        }else{
            this._matSnackBar.open(this.translate.instant('Selecciona una sede'), 'OK', {
                duration: 5000,
            });
        }
        
    }

    createGrupoForm(grupo: ProgramaGrupo, idIncompanyGrupo: number){
        grupo = grupo ? grupo : new ProgramaGrupo();

        let criteriosEvaluacionFormArray = new FormArray([]);
        if(grupo.criteriosEvaluacion){
            grupo.criteriosEvaluacion.forEach(criterio =>{
                criteriosEvaluacionFormArray.push(this.createCriteriosEvaluacionForm(criterio,grupo.id));
            });
        }

        let materiales = new FormArray([]);
        if(grupo.materiales){
            grupo.materiales.forEach(material =>{
                materiales.push(this.createMaterialesExistentesForm(material,grupo.id));
            });
        }

        let horariosFormArray = new FormArray([]);
        if(grupo.horarios && grupo.horarios.length >0){
            grupo.horarios.forEach(horario =>{
                horariosFormArray.push(this.createHorarioForm(horario))
            });
            this.modalidadPersonalizada = true;
        }

        let clasesCanceladasFormArray = new FormArray([]);
        if(grupo.clasesCanceladas && grupo.clasesCanceladas.length > 0){
            grupo.clasesCanceladas.forEach(clase =>{
                clasesCanceladasFormArray.push(this.createClaseCanceladaForm(clase));
            });
        }

        let clasesReprogramadasFormArray = new FormArray([]);
        if(grupo.clasesReprogramadas && grupo.clasesReprogramadas.length > 0){
            grupo.clasesReprogramadas.forEach(clase =>{
                clasesReprogramadasFormArray.push(this.createClaseReprogramadaForm(clase));
            });
        }

        let listaComisionFormArray = new FormArray([]);
        if(grupo.listaComision && grupo.listaComision.length > 0){
            grupo.listaComision.filter(comision => comision.activo == true).map(comision => {
                listaComisionFormArray.push(this.createComisionForm(comision));
            })
        }

        // Criterios Economicos
        this.criterioEconomicoFormGroup = this._formBuilder.group({
            precioIncompany: new FormControl(grupo.precioIncompany, [Validators.required]),
            precioVentaGrupo: new FormControl(grupo.precioVentaGrupo, [Validators.required]),
            clientePrecioVentaCurso: new FormControl(grupo.clientePrecioVentaCurso, [Validators.required]),
            clientePrecioVentaLibro: new FormControl(grupo.clientePrecioVentaLibro, [Validators.required]),
            clientePrecioVentaCertificacion: new FormControl(grupo.clientePrecioVentaCertificacion, [Validators.required]),
            precioVentaCurso: new FormControl(grupo.precioVentaCurso, [Validators.required]),
            precioVentaLibro: new FormControl(grupo.precioVentaLibro, [Validators.required]),
            precioVentaCertificacion: new FormControl(grupo.precioVentaCertificacion, [Validators.required]),
            porcentajeComision: new FormControl(grupo.id == null ? 4 :grupo.porcentajeComision, [Validators.required]),
            porcentajeApoyoTransporte: new FormControl(grupo.porcentajeApoyoTransporte, [Validators.required]),
            kilometrosDistancia: new FormControl(grupo.kilometrosDistancia, [Validators.required]),
            precioMaterial: new FormControl(grupo.precioMaterial, [Validators.required]),
        });

        let form: FormGroup = this._formBuilder.group({
            id:[grupo.id],
            programaGrupoIncompany: new FormControl(this.grupo.id),
            programaIdioma: new FormControl(grupo.programaIdioma),
            nivel: new FormControl(grupo.nivel, [Validators.required]),
            alias: new FormControl(grupo.alias),
            paModalidad: new FormControl(grupo.paModalidad.codigo == "PER" ? null : grupo.paModalidad),
            horario: new FormControl(grupo.paModalidad.codigo == "PER" ? null : grupo.modalidadHorario.nombre),
            tipoGrupo: new FormControl(grupo.tipoGrupo, [Validators.required]),
            fechaInicio: new FormControl(grupo.fechaInicio ? moment(grupo.fechaInicio).format('YYYY-MM-DD'): null, [Validators.required]),
            fechaFin:  new FormControl(grupo.fechaFin ? moment(grupo.fechaFin).format('YYYY-MM-DD'): null, [Validators.required]),
            calificacionMinima: new FormControl(grupo.calificacionMinima, [Validators.required]),
            faltasPermitidas: new FormControl(grupo.faltasPermitidas, [Validators.required]),
            cupo: new FormControl(grupo.cupo ? grupo.cupo : 20, [Validators.required]),
            plataforma: new FormControl(grupo.plataforma),
            empleado: new FormControl(grupo.empleado),
            materiales: materiales,
            precioIncompany: this.criterioEconomicoFormGroup.controls.precioIncompany.value,
            precioVentaGrupo: this.criterioEconomicoFormGroup.controls.precioVentaGrupo.value,
            clientePrecioVentaCurso: this.criterioEconomicoFormGroup.controls.clientePrecioVentaCurso.value,
            clientePrecioVentaLibro: this.criterioEconomicoFormGroup.controls.clientePrecioVentaLibro.value,
            clientePrecioVentaCertificacion: this.criterioEconomicoFormGroup.controls.clientePrecioVentaCertificacion.value,
            precioVentaCurso: this.criterioEconomicoFormGroup.controls.precioVentaCurso.value,
            precioVentaLibro: this.criterioEconomicoFormGroup.controls.precioVentaLibro.value,
            precioVentaCertificacion: this.criterioEconomicoFormGroup.controls.precioVentaCertificacion.value,
            porcentajeComision: this.criterioEconomicoFormGroup.controls.porcentajeComision.value,
            porcentajeApoyoTransporte: this.criterioEconomicoFormGroup.controls.porcentajeApoyoTransporte.value,
            kilometrosDistancia: this.criterioEconomicoFormGroup.controls.kilometrosDistancia.value,
            precioMaterial: this.criterioEconomicoFormGroup.controls.precioMaterial.value,
            codigo:new FormControl(grupo.codigo),
            nombre: new FormControl(grupo.nombre),
            criteriosEvaluacion: criteriosEvaluacionFormArray,
            horarios: horariosFormArray,
            clasesCanceladas: clasesCanceladasFormArray,
            clasesReprogramadas: clasesReprogramadasFormArray,
            categoriaProfesor: new FormControl(grupo.categoriaProfesor),
            sueldoProfesor: new FormControl(grupo.sueldoProfesor),
            listaComision: listaComisionFormArray,
            estatus: new FormControl(grupo.estatus)
        });

        return form;
    }

    createMaterialesForm(material: ArticuloComboProjection, grupoId: number): FormGroup {
        material = material ? material : new ArticuloComboProjection();

        let form: FormGroup = this._formBuilder.group({
            id: [null],
            grupoId: new FormControl(grupoId),
            articulo: new FormControl(material),
            articuloId: new FormControl(material.id)
        })

        return form;
    }

    createMaterialesExistentesForm(material: ProgramaGrupoIncompanyMaterial, grupoId: number): FormGroup {
        material = material ? material : new ProgramaGrupoIncompanyMaterial();
        let form: FormGroup = this._formBuilder.group({
            id: [material.id],
            grupoId: new FormControl(grupoId),
            articulo: new FormControl(material.articulo)
        })

        return form;
    }

    gotoStep(step): void
    {
        // Decide the animation direction
        this.animationDirection = this.currentStep < step ? 'left' : 'right';

        // Run change detection so the change
        // in the animation direction registered
        this._changeDetectorRef.detectChanges();

        // Set the current step
        this.currentStep = step;
        if ( this.currentStep === 1 )
        {
            this.getCriteriosEvaluacion();
        }

        if( this.currentStep == 4){
            let dias : any;
            if(!this.modalidadPersonalizada){

            }else{

            }
            //this.fechasHabilesService.getFechasHabiles(moment(this.grupoAdd.get('fechaInicio').value).format('YYYY-MM-DD'), moment(this.grupoAdd.get('fechaFin').value).format('YYYY-MM-DD'), dias);
            this.createDiasClases();
        }
    }

    gotoNextStep(): void
    {        
        if ( this.currentStep === this.steps.length)
        {
            return;
        }

        // Set the animation direction
        this.animationDirection = 'left';

        // Run change detection so the change
        // in the animation direction registered
        this._changeDetectorRef.detectChanges();

        if ( (this.currentStep+1) === 1 && this.grupoAdd.valid )
        {
            this.getCriteriosEvaluacion();
        }
        else if((this.currentStep+1) === 1 && !this.grupoAdd.valid){
            this.markFormGroupTouched(this.grupoAdd);
            /*for (const key of Object.keys(this.grupoAdd.controls)) {
                if (this.grupoAdd.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {                          
                        invalidControl.focus();
                        break;
                    }

                }
            }*/

            this._grupoService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
            return;
        }
        else if( (this.currentStep+1) == 3 && this.criterioEconomicoFormGroup.valid){
            this.createDiasClases();
        }
        else if((this.currentStep+1) == 3 && this.criterioEconomicoFormGroup.invalid){
            this.markFormGroupTouched(this.criterioEconomicoFormGroup);

            this._grupoService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
            return;
        }
        

        // Increase the current step
        this.currentStep++;
    }

    gotoPreviousStep(): void
    {

        if ( this.currentStep === 0 )
        {
            return;
        }


        // Set the animation direction
        this.animationDirection = 'right';

        // Run change detection so the change
        // in the animation direction registered
        this._changeDetectorRef.detectChanges();

        // Decrease the current step
        this.currentStep--;

        if ( this.currentStep === 1 )
        {
            this.getCriteriosEvaluacion();
        }
    }

    getCriteriosEvaluacion(){
        if(!this.modalidadPersonalizada){
            
            let modalidad = this.grupoAdd.get('paModalidad').value;
            let dias: boolean[] = [!!modalidad?.domingo, !!modalidad?.lunes, !!modalidad?.martes, !!modalidad?.miercoles, !!modalidad?.jueves, !!modalidad?.viernes, !!modalidad?.sabado];
            this.fechasHabilesService.getFechasHabiles(moment(this.grupoAdd?.get('fechaInicio').value).format('YYYY-MM-DD'), moment(this.grupoAdd?.get('fechaFin').value).format('YYYY-MM-DD'), dias);
            
            //this.criteriosEvaluacionFormArray = new FormArray([]);
            let json ={
                id: null,
                programaIdiomaId: this.programaIdiomaControl.value.id,
                modalidadId: this.modalidadControl.value.id,
                fechaInicio: this.grupoAdd.get('fechaInicio').value,
                nivel: this.grupoAdd.get('nivel').value
            }
            this._grupoService.getCriteriosEvaluacion(json).then(value =>{
                let criterios = value.data;
                
                this.criteriosEvaluacion = criterios;
                this.criteriosEvaluacion = [...new Map(this.criteriosEvaluacion.map(item => [item.actividadEvaluacion.actividad, item])).values()];
                //let score = 100 / this.criteriosEvaluacion.length;
                /*this.criteriosEvaluacion.forEach(criterio =>{
                    criterio.score = 0
                });*/
                
                if((this.criteriosEvaluacionFormArray.length == 0)){
                    this.criteriosEvaluacion.forEach(criterio =>{
                        this.criteriosEvaluacionFormArray.push(this.createCriteriosEvaluacionNuevoForm(criterio,this.grupo.id ? this.grupo.id : null));
                    });
                }else{
                    // this.criteriosEvaluacion = [];
                    // criterios.map(criterio => {
                    //     let _criterio = this.getCriteriosEvaluacionActivo().find(__criterio => __criterio.actividadEvaluacion.id == criterio.actividadEvaluacion.id);
                    //     if(!_criterio)
                    //         this.criteriosEvaluacion.push(criterio);
                    // }); 
                }
            });
            
            
        }else if(this.modalidadPersonalizada){
            let modalidadPersonalizada = this.grupoAdd.get('horarios').value;
            let dias: boolean[] = [false,!!modalidadPersonalizada[0].horaInicioString!=null,!!modalidadPersonalizada[1].horaInicioString!=null,!!modalidadPersonalizada[2].horaInicioString!=null,!!modalidadPersonalizada[3].horaInicioString!=null,!!modalidadPersonalizada[4].horaInicioString!=null,!!modalidadPersonalizada[5].horaInicioString!=null];
            this.fechasHabilesService.getFechasHabiles(moment(this.grupoAdd?.get('fechaInicio').value).format('YYYY-MM-DD'), moment(this.grupoAdd?.get('fechaFin').value).format('YYYY-MM-DD'), dias);
            if((!this.criteriosEvaluacionFormArray || this.criteriosEvaluacionFormArray.length==0)){
                this.criteriosEvaluacionFormArray = new FormArray([]);
                let json ={
                    id: null,
                    programaIdiomaId: this.programaIdiomaControl.value.id,
                    modalidadId: null,
                    fechaInicio: this.grupoAdd.get('fechaInicio').value,
                    nivel: this.grupoAdd.get('nivel').value
                }
                this._grupoService.getCriteriosEvaluacion(json).then(value =>{
                    let criterios = value.data;
                    this.criteriosEvaluacion = criterios;
                    this.criteriosEvaluacion = [...new Map(this.criteriosEvaluacion.map(item => [item.actividadEvaluacion.actividad, item])).values()];
                    
                    this.criteriosEvaluacion.forEach(criterio =>{
                        criterio.modalidad.nombre = 'Personalizada';
                        this.criteriosEvaluacionFormArray.push(this.createCriteriosEvaluacionNuevoForm(criterio,this.grupo.id ? this.grupo.id : null));
                    });
                });
            }
            
        }
        
    }

    createCriteriosEvaluacionNuevoForm(criterio: ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection, grupoId: number){
        criterio = criterio ? criterio : new ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection;
        if(criterio.id == null){
            criterio.grupoId = grupoId;
        }

        let form: FormGroup = this._formBuilder.group({
            id:[criterio.id],
            grupoId: new FormControl(criterio.grupoId),
            actividadEvaluacion: new FormControl(criterio.actividadEvaluacion),
            modalidad: new FormControl(criterio.modalidad ? criterio.modalidad : this.modalidadControl.value),
            testFormat: new FormControl(criterio.testFormat),
            fechaAplica: new FormControl(this.listadoClases && criterio.dias > this.listadoClases.length ? this.listadoClases[this.listadoClases.length -1] : this.listadoClases[criterio.dias - 1]),
            score: new FormControl(criterio.score),
            time: new FormControl(criterio.time),
            activo: new FormControl(criterio.activo != null ? criterio.activo: true),
            dias: new FormControl(criterio.dias)
        });
        return form; 
    }

    createCriteriosEvaluacionForm(criterio: ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection, grupoId: number){
        criterio = criterio ? criterio : new ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection;
        if(criterio.id == null){
            criterio.grupoId = grupoId;
        }
        let form: FormGroup = this._formBuilder.group({
            id:[criterio.id],
            grupoId: new FormControl(criterio.grupoId),
            actividadEvaluacion: new FormControl(criterio.actividadEvaluacion),
            modalidad: new FormControl(criterio.modalidad ? criterio.modalidad : null),
            testFormat: new FormControl(criterio.testFormat),
            fechaAplica: new FormControl(criterio.fechaAplica != null ? moment(criterio.fechaAplica).format('YYYY-MM-DD') : null ),
            score: new FormControl(criterio.score),
            time: new FormControl(criterio.time),
            activo: new FormControl(criterio.activo != null ? criterio.activo: true),
            dias: new FormControl(criterio.dias)
        });
        return form; 
    }

    getScoreTotal(){
        let total = 0;
        this.getCriteriosEvaluacionActivo().forEach(criterio =>{
            total = total + criterio.score
        });
        return total;
    }

    getTimeTotal(){
        let total = 0;
        this.getCriteriosEvaluacionActivo().forEach(criterio =>{
            total = total + criterio.time
        });
        return total;
    }

    abrirModalCriterioEvaluacion(criterio: any, index: number){
        this.criterioSelected = index;
        let listaActividadEvaluacion: any = [], esNuevo: boolean = criterio ? false : true;
        this.criteriosEvaluacion?.map(_criterio => {
            let __criterio = this.getCriteriosEvaluacionActivo().find(criterioFind => criterioFind.actividadEvaluacion.id == _criterio.actividadEvaluacion.id);
            if(!__criterio || (criterio ? criterio.actividadEvaluacion.id == __criterio.actividadEvaluacion.id : false))
                listaActividadEvaluacion.push(_criterio.actividadEvaluacion);
        }); 
        const dialogRef = this.dialog.open(CriterioEvaluacionComponent, {
            width: '1000px',
            data: {
                esNuevo: esNuevo,
                criterio: criterio,
                testFormats: this.testFormat,
                listaActividadEvaluacion: listaActividadEvaluacion,
                modalidad: this.modalidadControl.value
            },
            disableClose: true
        });
        dialogRef.afterClosed().subscribe((criterio: FormGroup) => {
            if (criterio) {
                if(esNuevo)
                    this.criteriosEvaluacionFormArray.push(this.createCriteriosEvaluacionNuevoForm(criterio.value, this.grupoAdd.controls.id.value));
                else
                    this.modificarCriterio(criterio);
            }
        });
    }

    agregarCriterio(criterio: FormGroup){
        this.criteriosEvaluacionFormArray.push(criterio);
    }

    modificarCriterio(criterio: FormGroup){
        var criterioActualiza = this.criteriosEvaluacionFormArray.controls.find((_criterio: FormGroup) => _criterio.controls.actividadEvaluacion.value.id == criterio.controls.actividadEvaluacion.value.id);
        criterioActualiza.patchValue(criterio.value);
        this.criterioSelected = null; 
    }

    verificarGrupo(){

        if((this.currentStep+1) == 3 && this.criterioEconomicoFormGroup.invalid){
            this.markFormGroupTouched(this.criterioEconomicoFormGroup);

            this._grupoService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
            return;
        }
        /*if(this.getScoreTotal() > 100){
            this._matSnackBar.open(this.translate.instant('El score en criterios de evaluación no puede ser mayor a 100'), 'OK', {
                duration: 5000,
            });

        }
        else{*/
        

        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: '¿Deseas guardar el grupo con los datos proporcionados?'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.agregarGrupo();
            }
        });
        //}
        
    }

    confirmarBorrarGrupo(index: number){
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                width: '400px',
                data: {
                    mensaje: '¿Deseas borrar el grupo?'
                }
            });

            dialogRef.afterClosed().subscribe(confirm => {
                if (confirm) {
                    this.borrarGrupo(index);
                }
            });
    }

    agregarGrupo(){

        //////////////////////////Reset Datos Asistencias / Calificaciones ////////////////////
        this.tests = [];
        this.alumnos = [];
        this.inscripciones = [];

        //Variables calificaciones
        this.dataSourceCalificaciones = [];
        this.calificaciones = [];
        this.metricas = [];
        this.tareas = [];
        this.displayedColumnsCalificaciones = [];
        this.tableGroups = [];
        this.displayedTableGroups= [];
        this.tableHeaders = [];
        this.displayedTableHeaders = [];
        this.controls = null;

        //Variables asistencias
        this.fechas = [];
        this.resumeColumns= [];
        this.dateColumns = [];
        this.resumeDataSource = [];
        this.hasChanges = false;
        this.opened = false;
        this.asistencias = [];
        this.faltasPermitidas = 0;
        this.duracionClase = 0;
        this.diasSemana = '';
        this.fechasAsistencias = [];
        this.resumenes = [];
        this.dataSources = [];
        this.displayedColumnsAsistencias = [];
        this.editIndex = null;
        this.isReady = false;
        this.currentIndex = 0;
        this.editableIndex = null;
        this.horasDia = 0;
        this.minutosTotal = 0;
        this.tableMode = 'detail';
        this.modalidad = null;
        this.historial = [];
        this.mostrarCalificaciones = true;
        this.mostrarAsistencias = false;

        ////////////////////////////////////////////////////
        let profesoresTitulares = this.profesoresTitularesController.getProfesoresTitulares();
        let profesoreTitulares: FormArray = new FormArray([]);
        profesoresTitulares.forEach(prof =>{
            profesoreTitulares.push(this.createFormProfesorTitular(prof));
        });
        try{
            this.grupoAdd.get('nuevoProfesorTitular').setValue(new FormControl(this.nuevoProfesorTitular));    
        }catch(e){
            this.grupoAdd.addControl('nuevoProfesorTitular',new FormControl(this.nuevoProfesorTitular));    
        }

        try{
            this.grupoAdd.get('profesoresTitulares').setValue(profesoreTitulares);    
        }catch(e){
            this.grupoAdd.addControl('profesoresTitulares',profesoreTitulares);
        }
        
        let idHorario : number;

        try{
            this.grupoAdd.get('paModalidad').value.horarios.forEach(horario =>{
                if(this.grupoAdd.get('horario').value == horario.nombre){
                    idHorario = horario.codigo
                }
            });
        }catch(e){
            idHorario = null;
        }
        let estatus ={id: 2000620, valor: 'Activo'};

        let codigo = this.sucursalControl.value.prefijo+'ICP'+this.programaIdiomaControl.value.codigo+(this.modalidadPersonalizada ? 'PRS' : this.modalidadControl.value.codigo)+'0'+this.nivelControl.value.id+(this.modalidadPersonalizada ? 99 : idHorario);
        codigo = codigo + (this.getUltimoNumero(this.grupoAdd));
        this.grupoAdd.get('codigo').setValue(codigo);
        
        let nombre = this.programaIdiomaControl.value.nombre+'-'+this.modalidadControl.value.nombre+'-'+this.nivelControl.value.id;
        this.grupoAdd.get('nombre').setValue(nombre);
        this.grupoAdd.addControl('criteriosEvaluacion',this.criteriosEvaluacionFormArray);
        this.grupoAdd.addControl('clasesCanceladas',this.clasesCanceladasFormArray);
        this.grupoAdd.addControl('clasesReprogramadas',this.clasesReprogramadasFormArray);
        this.grupoAdd.addControl('listaComision', this.listaComisionFormArray);
        if(this.grupoAdd.get('id').value == null){
            this.grupoAdd.get('estatus').setValue(estatus);    
        }
        if(this.modalidadControl && this.modalidadControl.value && !this.modalidadPersonalizada){
            var modalidadControl = new FormControl(this.modalidadControl.value);
            this.modalidadControl.reset();
            this.grupoAdd.removeControl('paModalidad');
            this.grupoAdd.addControl('paModalidad',modalidadControl);
        }
        if(this.modalidadPersonalizada){
             this.grupoAdd.get('paModalidad').reset();   
        }
        
        if(this.grupoAdd.get('materialControl')){
            this.materialesFormArray = new FormArray ([]);
            this.grupoAdd.get('materialControl').value.forEach(material =>{
                this.materialesFormArray.push(this.createMaterialesForm(material,this.grupoAdd.get('id') ? this.grupoAdd.get('id').value : null))
            });
            this.grupoAdd.addControl("materiales",this.materialesFormArray);
        }

        // Criterios Grupos
        this.grupoAdd.controls.precioIncompany.setValue(this.criterioEconomicoFormGroup.controls.precioIncompany.value);
        this.grupoAdd.controls.precioVentaGrupo.setValue(this.criterioEconomicoFormGroup.controls.precioVentaGrupo.value);
        this.grupoAdd.controls.clientePrecioVentaCurso.setValue(this.criterioEconomicoFormGroup.controls.clientePrecioVentaCurso.value);
        this.grupoAdd.controls.clientePrecioVentaLibro.setValue(this.criterioEconomicoFormGroup.controls.clientePrecioVentaLibro.value);
        this.grupoAdd.controls.clientePrecioVentaCertificacion.setValue(this.criterioEconomicoFormGroup.controls.clientePrecioVentaCertificacion.value);
        this.grupoAdd.controls.precioVentaCurso.setValue(this.criterioEconomicoFormGroup.controls.precioVentaCurso.value);
        this.grupoAdd.controls.precioVentaLibro.setValue(this.criterioEconomicoFormGroup.controls.precioVentaLibro.value);
        this.grupoAdd.controls.precioVentaCertificacion.setValue(this.criterioEconomicoFormGroup.controls.precioVentaCertificacion.value);
        this.grupoAdd.controls.porcentajeComision.setValue(this.criterioEconomicoFormGroup.controls.porcentajeComision.value);
        this.grupoAdd.controls.porcentajeApoyoTransporte.setValue(this.criterioEconomicoFormGroup.controls.porcentajeApoyoTransporte.value);
        this.grupoAdd.controls.kilometrosDistancia.setValue(this.criterioEconomicoFormGroup.controls.kilometrosDistancia.value);
        //this.grupoAdd.controls.precioMaterial.setValue(this.criterioEconomicoFormGroup.controls.precioMaterial.value);
        
        if(this.grupoAdd.get('id').value == null){
            this.gruposFormArray.push(this.grupoAdd);
            this.vistaPrincipal = true;
            this.mostrarBorrar = false;
            this.mostrarEditar = false;
            this.mostrarGuardar = true;
        } else{
            //this.gruposFormArray.removeAt(this.gruposFormArray.controls.findIndex((g: FormGroup) => g.controls.id.value == this.grupoAdd.controls.id.value));
            //var _grupoAdd = this.gruposFormArray.controls.find((g: FormGroup) => g.controls.id.value == this.grupoAdd.controls.id.value);
            //_grupoAdd.patchValue(this.grupoAdd.value);
            //this.gruposFormArray.push(this.grupoAdd);
            const index: number = this.gruposFormArray.controls.findIndex((g: FormGroup) => g.controls.id.value == this.grupoAdd.controls.id.value);
            this.gruposFormArray.removeAt(index);
            //let _grupoAdd: FormGroup = this.gruposFormArray.controls.find((g: FormGroup) => g.controls.id.value == this.grupoAdd.controls.id.value) as FormGroup;
            //_grupoAdd.patchValue(this.grupoAdd.value);
            this.gruposFormArray.insert(index, this.grupoAdd);
            //_grupoAdd.controls.criteriosEvaluacion.setValue(this.criteriosEvaluacionFormArray.value);
            //this.gruposFormArray.push(this.grupoAdd);

            this.mostrarBorrar = false;
            this.mostrarEditar = false;
            this.mostrarGuardar = true;
            this.vistaPrincipal = true;
        }
        this.modalidadPersonalizada = false;
        this.selectedIndex = 1;
        this.filterBy = 'all';
        this.currentStep = 0;
        this.gruposTabla = this.gruposFormArray.value.filter(grupo =>{
            return !moment(this.fechaActual).isAfter(moment(grupo.fechaFin)) ;
        });
    }

    getUltimoNumero(grupo: FormGroup): string{
        let ultimoNumero: string = '';
        if(grupo.controls.id.value == null){
            ultimoNumero = this.getFinalNumero(ultimoNumero, grupo);
        }else{
            ultimoNumero = grupo.controls.codigo.value.slice((grupo.controls.codigo.value.length-2));
            const esGrupo: boolean = this.gruposFormArray.controls.some((_grupo: FormGroup) => _grupo.controls.id.value == grupo.controls.id.value && _grupo.controls.programaIdioma.value.id == grupo.controls.programaIdioma.value.id && _grupo.controls.nivel.value == grupo.controls.nivel.value && _grupo.controls.paModalidad?.value?.id == grupo.controls.paModalidad?.value?.id && _grupo.controls.tipoGrupo.value.id == grupo.controls.tipoGrupo.value.id && _grupo.controls.fechaInicio.value == grupo.controls.fechaInicio.value && _grupo.controls.horario.value == grupo.controls.horario.value);
            if(!esGrupo){
                ultimoNumero = this.getFinalNumero(ultimoNumero, grupo);
            }
        }
        return ultimoNumero;
    }

    getFinalNumero(ultimoNumero: string, grupo: FormGroup): string{
        const listaGrupo: AbstractControl[] = this.gruposFormArray.controls.filter((_grupo: FormGroup) => _grupo.controls.programaIdioma.value.id == grupo.controls.programaIdioma.value.id && _grupo.controls.nivel.value == grupo.controls.nivel.value && _grupo.controls.paModalidad?.value?.id == grupo.controls.paModalidad?.value?.id && _grupo.controls.tipoGrupo.value.id == grupo.controls.tipoGrupo.value.id && _grupo.controls.fechaInicio.value == grupo.controls.fechaInicio.value && _grupo.controls.horario.value == grupo.controls.horario.value) as AbstractControl[];
        ultimoNumero = ("0" + (listaGrupo.length + 1)).slice(-2);
        if(listaGrupo.length > 0){
            let numeros: Array<number> = [];
            listaGrupo.map((grupo: FormGroup) => {
                const codigo: string = grupo.controls.codigo.value;
                let _ultimoNumro: string = codigo.slice((codigo.length-2));
                numeros.push(parseInt(_ultimoNumro));
            })
            // Orden los numeros menor al mayor
            numeros.sort();
            ultimoNumero = ("0" + (numeros[numeros.length-1] + 1)).slice(-2);
        }
        return ultimoNumero;
    }

    regresar(){
        this.selectedIndex = 1; 
        this.mostrarBorrar = false;
        this.mostrarEditar = false;
        this.mostrarGuardar = true;
        this.vistaPrincipal = true;
        this.currentStep = 0;
        this.modalidadPersonalizada = false;
    }

    abrirModalModalidadPersonalizada(){
        const dialogRef = this.dialog.open(ModalidadPersonalizadaComponent, {
            width: '1000px',
            data: {
                grupoIncompany: this.grupoAdd.get('id') ? this.grupoAdd.get('id').value: null
            },
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.setModalidadPersonalizada(confirm);
            }
            this.reverseModalidad = false;
        });
    }

    abrirModalModalidad(){
        const dialogRef = this.dialog.open(ModalidadHorarioComponent, {
            width: '500px',
            data: {
                modalidad: this.modalidadControl.value
            },
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.reverseModalidad = false;
                this.setModalidadHorario(confirm);
            }else{
                this.reverseModalidad = true;
                this.grupoAdd.get('paModalidad').setValue(this.modalidadTemp);
            }
        });
    }

    setModalidadHorario(horario){
        this.grupoAdd.removeControl('horario');
        this.grupoAdd.addControl('horario',horario);
        this.modalidadPersonalizada = false;

        this.getComboZona();
    }

    setModalidadPersonalizada(horario){
        this.horariosFormArray = horario;
        this.grupoAdd.removeControl('horarios');
        this.grupoAdd.addControl('horarios',this.horariosFormArray);
        this.modalidadPersonalizada = true;
    }

    restarHoras(horaInicio: any, horaFin: any){
        if(horaInicio && horaFin){
            return this.calculateHours(horaInicio,horaFin);
        }else{
            return '-'
        }
        
    }

    sumarHoras(){
        let total = 0;
        this.grupoAdd.get('horarios').value.forEach(horario =>{
            if(horario.horaInicioString && horario.horaFinString){
              total = Number(total) + this.calculateHoursTotal(horario.horaInicioString,horario.horaFinString);  
            }
        });
        let horas: any = Math.floor(total / 60);
        let minutos: any = total % 60;
        horas = horas < 10 ? '0' + horas : horas;
        minutos = minutos < 10 ? '0' + minutos : minutos;
        return `${horas}:${minutos}`;
    }

    calculateHours(start, end) {
        var tStart = moment(start, "HH:mm");
        var tEnd = moment(end, "HH:mm");
        var duration = moment.duration(tEnd.diff(tStart));
        var mins = duration.asMinutes();
        let h: any = Math.floor(mins / 60);
        let m: any = mins % 60;
        h = h < 10 ? '0' + h : h;
        m = m < 10 ? '0' + m : m;
        return `${h}:${m}`;
    }

    calculateHoursTotal(start, end) {
        var tStart = moment(start, "HH:mm");
        var tEnd = moment(end, "HH:mm");
        var duration = moment.duration(tEnd.diff(tStart));
        var mins = duration.asMinutes();
        return mins;
    }

    fixed1Decimal(valor){
        return Number(valor).toFixed(1);
    }

    parseTime(s) {
       var c = s.split(':');
       return (parseInt(c[0]) * 60 + parseInt(c[1]))/60;
    }

    createHorarioForm(horario: ProgramaGrupoIncompanyHorarioEditarProjection){
        let form = this._formBuilder.group({
            id: [horario.id],
            grupoId: new FormControl(horario.grupoId),
            dia: new FormControl(horario.dia),
            horaInicio: new FormControl(horario.horaInicio),
            horaFin: new FormControl(horario.horaFin),
            horaInicioString: new FormControl(horario.horaInicio?.toString()),
            horaFinString: new FormControl(horario.horaFin?.toString())
        });
        return form;
    }

    async createDiasClases(){
        this.clasesFormArray = new FormArray([]);
        if(!this.modalidadPersonalizada){
            let modalidad = this.grupoAdd.get('paModalidad').value;
            let dias: boolean[] = [!!modalidad?.domingo, !!modalidad?.lunes, !!modalidad?.martes, !!modalidad?.miercoles, !!modalidad?.jueves, !!modalidad?.viernes, !!modalidad?.sabado];
            await this.fechasHabilesService.getFechasHabiles(moment(this.grupoAdd?.get('fechaInicio').value).format('YYYY-MM-DD'), moment(this.grupoAdd?.get('fechaFin').value).format('YYYY-MM-DD'), dias);
            
        }else{
            let modalidadPersonalizada = this.grupoAdd.get('horarios').value;
            let dias: boolean[] = [false,!!modalidadPersonalizada[0].horaInicioString!=null,!!modalidadPersonalizada[1].horaInicioString!=null,!!modalidadPersonalizada[2].horaInicioString!=null,!!modalidadPersonalizada[3].horaInicioString!=null,!!modalidadPersonalizada[4].horaInicioString!=null,!!modalidadPersonalizada[5].horaInicioString!=null];
            await this.fechasHabilesService.getFechasHabiles(moment(this.grupoAdd?.get('fechaInicio').value).format('YYYY-MM-DD'), moment(this.grupoAdd?.get('fechaFin').value).format('YYYY-MM-DD'), dias);
            
        }
        let i=1;
        this.listadoClases.forEach(fecha =>{
            let form = this._formBuilder.group({
                id:[i],
                fecha: new FormControl(moment(fecha).format('YYYY-MM-DD')),
                nivel: new FormControl(this.grupoAdd.get('nivelControl').value.id),
                borrada: new FormControl(false),
                reprogramada: new FormControl(false)
            });
            i = i+1;
            this.clasesFormArray.push(form);
        });
        this.clasesTabla = this.clasesFormArray.value;
        if(this.clasesCanceladasFormArray){
            this.clasesTabla = this.clasesTabla.filter(cla =>{
                return !this.clasesCanceladasFormArray.value.find(x => moment(x.fechaCancelar).format('YYYY-MM-DD') == moment(cla.fecha).format('YYYY-MM-DD'));
            });
        }

        if(this.clasesReprogramadasFormArray){
            let index ;
            this.clasesReprogramadasFormArray.controls.forEach(claseReprogramar =>{
                index = this.clasesFormArray.controls.findIndex(clase =>{
                    return moment(clase.get('fecha').value).format('YYYY-MM-DD') == moment(claseReprogramar.get('fechaReprogramar').value).format('YYYY-MM-DD')
                });
                if(index > -1){
                   this.claseReprogramarSelected = index;
                    this.setClaseReprogramada(claseReprogramar.get('fechaReprogramar').value,claseReprogramar); 
                }
                
            });
        }
        this.profesoresTitularesController = new ProfesoresTitularesIncompanyController(this.listadoClases,this.grupoAdd.value.profesoresTitulares == null ? [] : this.grupoAdd.value.profesoresTitulares,this.listadoClasesProfesores.value);
    }

    cancelarClase(element: any){
        let index = this.clasesFormArray.controls.findIndex(clase =>{
            return moment(clase.get('fecha').value).format('YYYY-MM-DD') == moment(element.fecha).format('YYYY-MM-DD')
        });
        this.clasesFormArray.controls[index].get('borrada').setValue(true);
        this.clasesTabla = this.clasesFormArray.value;

        let form = this._formBuilder.group({
            id: [null],
            grupoId: new FormControl(this.programaIdiomaControl.value.id),
            fechaCancelar: new FormControl(moment(this.clasesFormArray.controls[index].get('fecha').value).format('YYYY-MM-DD'))
        }); 
        this.clasesCanceladasFormArray.push(form);
    }

    createClaseCanceladaForm(clase: ProgramaGrupoIncompanyClaseCanceladaEditarProjection){
        clase = clase ? clase : new ProgramaGrupoIncompanyClaseCanceladaEditarProjection();
        let form = this._formBuilder.group({
            id: [clase.id],
            grupoId: new FormControl(clase.grupoId),
            fechaCancelar: new FormControl(moment(clase.fechaCancelar).format('YYYY-MM-DD'))
        });
        return form;
    }

    createClaseReprogramadaForm(clase: ProgramaGrupoIncompanyClaseReprogramada){
        clase = clase ? clase : new ProgramaGrupoIncompanyClaseReprogramada();
        let form: FormGroup = this._formBuilder.group({
            id:[clase.id],
            grupoId: new FormControl(clase.grupoId),
            fechaReprogramar: new FormControl(moment(clase.fechaReprogramar).format('YYYY-MM-DD')),
            fechaNueva: new FormControl(moment(clase.fechaNueva).format('YYYY-MM-DD')),
            horaInicioActual: new FormControl(null),
            horaFinActual: new FormControl(null),
            horaInicioString: new FormControl(clase.horaInicio),
            horaFinString: new FormControl(clase.horaFin),
            motivo: new FormControl(clase.motivo)
        });
        return form;
    }

    reprogramarClase(element,index:number){
        this.claseReprogramarSelected = index;
        let diaSemana = moment(element.fecha).day();
        let horaActual ;

        if(this.modalidadPersonalizada){
            this.horariosFormArray.value.forEach(horario =>{
                if(horario.dia == 'Domingo' && horario.horaInicio!=null && diaSemana == 0){
                    horaActual =  String(horario.horaInicio+'-'+horario.horaFin)
                }
                if(horario.dia == 'Lunes' && horario.horaInicio!=null && diaSemana == 1){
                    horaActual =  String(horario.horaInicio+'-'+horario.horaFin)
                }
                if(horario.dia == 'Martes' && horario.horaInicio!=null && diaSemana == 2){
                    horaActual =  String(horario.horaInicio+'-'+horario.horaFin)
                }
                if(horario.dia == 'Miercoles' && horario.horaInicio!=null && diaSemana == 3){
                    horaActual =  String(horario.horaInicio+'-'+horario.horaFin)
                }
                if(horario.dia == 'Jueves' && horario.horaInicio!=null && diaSemana == 4){
                    horaActual =  String(horario.horaInicio+'-'+horario.horaFin)
                }
                if(horario.dia == 'Viernes' && horario.horaInicio!=null && diaSemana == 5){
                    horaActual =  String(horario.horaInicio+'-'+horario.horaFin)
                }
                if(horario.dia == 'Sabado' && horario.horaInicio!=null && diaSemana == 6){
                    horaActual =  String(horario.horaInicio+'-'+horario.horaFin)
                }
            })
        }else{
            horaActual = String(this.grupoAdd.get('horario').value).substring(0,5)+':00'+'-'+String(this.grupoAdd.get('horario').value).substring(8,13)+':00';
        }

        const dialogRef = this.dialog.open(ReprogramarClaseComponent, {
            width: '500px',
            data: {
                grupoId: this.grupoAdd.get('id') ? this.grupoAdd.get('id').value: null,
                fechaActual: moment(element.fecha).format('YYYY-MM-DD'),
                horaActual: horaActual
            },
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.setClaseReprogramada(element.fecha,confirm);
            }
        });
    }

    setClaseReprogramada(fechaAntigua: Date, claseReprogramar){
        let indexFechaAplica;
        if(this.criteriosEvaluacionFormArray && this.criteriosEvaluacionFormArray.controls.length >0){
            let fechaAplicacion = moment(this.criteriosEvaluacionFormArray.controls[0].get('fechaAplica').value)
            indexFechaAplica = this.clasesFormArray.controls.findIndex(clase =>{
                return moment(clase.get('fecha').value).format('YYYY-MM-DD') == fechaAplicacion.format('YYYY-MM-DD')
            });
        }
        if(this.clasesFormArray.controls.length > this.claseReprogramarSelected+1 && moment(claseReprogramar.get('fechaNueva').value) >= moment(this.clasesFormArray.controls[this.claseReprogramarSelected+1].get('fecha').value ) ){
            this.clasesFormArray.controls[this.claseReprogramarSelected].get('fecha').setValue(moment(claseReprogramar.get('fechaNueva').value).format('YYYY-MM-DD'));
            this.clasesFormArray.controls[this.claseReprogramarSelected].get('reprogramada').setValue(true);
            var fechaInicio = moment(this.clasesFormArray.controls[this.claseReprogramarSelected].get('fecha').value).add(1,'days');
            var fechaFin = moment(this.grupoAdd.get('fechaFin').value);
            for(var i= this.claseReprogramarSelected+1;i<this.clasesFormArray.controls.length;i++){

                if(!this.modalidadPersonalizada){ 
                    let diaSemana = fechaInicio.day();
                    if(this.grupoAdd.get('paModalidad') && this.grupoAdd.get('paModalidad').value.nombre == 'Intensivo'){
                        if(diaSemana == 6){
                            fechaInicio = moment(fechaInicio).add(2,'days');
                        }else{
                            fechaInicio = moment(fechaInicio).add(1,'days');
                        }
                    } else if(this.grupoAdd.get('paModalidad') && this.grupoAdd.get('paModalidad').value.nombre == 'Semi-Intensivo'){
                       if(diaSemana == 4){
                            fechaInicio = moment(fechaInicio).add(4,'days');
                        } else if(diaSemana == 5){
                            fechaInicio = moment(fechaInicio).add(3,'days');
                        }
                        else if(diaSemana == 6){
                            fechaInicio = moment(fechaInicio).add(2,'days');
                        }else{
                            fechaInicio = moment(fechaInicio).add(1,'days');
                        } 
                    }else if(this.grupoAdd.get('paModalidad') && this.grupoAdd.get('paModalidad').value.nombre == 'Sabatino'){
                        fechaInicio = moment(fechaInicio).add(7,'days');
                    }
                    this.clasesFormArray.controls[i].get('fecha').setValue(moment(fechaInicio).format('YYYY-MM-DD'));
                    this.clasesFormArray.controls[i].get('reprogramada').setValue(true);
                    
                }else{
                    let index = 0;
                    let agregarDias = false;
                    
                    var diaSemana = fechaInicio.day();

                    let sumarDia = true;
                    while(sumarDia){
                        diaSemana = fechaInicio.day();
                        for(var j=0;j<this.grupoAdd.get('horarios').value.length;j++){
                            if(this.grupoAdd.get('horarios').value[j].dia == 'Domingo' && this.grupoAdd.get('horarios').value[j].horaInicio!=null && diaSemana == 0){
                                agregarDias = true;
                                break;
                            }
                            else if(this.grupoAdd.get('horarios').value[j].dia == 'Lunes' && this.grupoAdd.get('horarios').value[j].horaInicio!=null &&  diaSemana == 1){
                                agregarDias = true;
                                break;
                            }
                            else if(this.grupoAdd.get('horarios').value[j].dia == 'Martes' && this.grupoAdd.get('horarios').value[j].horaInicio!=null && diaSemana == 2){
                                agregarDias = true;
                                break;
                            }
                            else if(this.grupoAdd.get('horarios').value[j].dia == 'Miercoles' && this.grupoAdd.get('horarios').value[j].horaInicio!=null && diaSemana == 3){
                                agregarDias = true;
                                break;
                            }
                            else if(this.grupoAdd.get('horarios').value[j].dia == 'Jueves' && this.grupoAdd.get('horarios').value[j].horaInicio!=null && diaSemana == 4){
                                agregarDias = true;
                                break;
                            }
                            else if(this.grupoAdd.get('horarios').value[j].dia == 'Viernes' && this.grupoAdd.get('horarios').value[j].horaInicio!=null && diaSemana == 5){
                                agregarDias = true;
                                break;
                            }
                            else if(this.grupoAdd.get('horarios').value[j].dia == 'Sabado' && this.grupoAdd.get('horarios').value[j].horaInicio!=null && diaSemana == 6){
                                agregarDias = true;
                                break;
                            }
                            else{
                                agregarDias = false;
                            }
                        }
                        if(agregarDias){
                            this.clasesFormArray.controls[i].get('fecha').setValue(moment(fechaInicio).format('YYYY-MM-DD'));
                            this.clasesFormArray.controls[i].get('reprogramada').setValue(true);
                            fechaInicio = moment(fechaInicio).add(1,'days');
                            sumarDia = false;
                        }else{
                            fechaInicio = moment(fechaInicio).add(1,'days');
                        }
                    }
                        
                    
                }
               
            }
        }else{
            this.clasesFormArray.controls[this.claseReprogramarSelected].get('fecha').setValue(moment(claseReprogramar.get('fechaNueva').value).format('YYYY-MM-DD'));
            this.clasesFormArray.controls[this.claseReprogramarSelected].get('reprogramada').setValue(true);
        }
        
        this.clasesReprogramadasFormArray.push(claseReprogramar);

        
        if(indexFechaAplica > -1){
            for(var i=0;i<this.criteriosEvaluacionFormArray.controls.length;i++){
                this.criteriosEvaluacionFormArray.controls[i].get('fechaAplica').setValue(moment(this.clasesFormArray.controls[indexFechaAplica].get('fecha').value).format('YYYY-MM-DD'))
            }
        }
        this.clasesTabla = [...this.clasesFormArray.value];
        
    }

    borrarGrupo(index){
        let json = {
            id: 2000622,
            valor: 'Cancelado'
        }
        this.gruposFormArray.controls[index].get('estatus').setValue(json);
        debugger;
        this.gruposTabla = [...this.gruposFormArray.value];
    }

    unDecimales(numero: number){
        return numero.toFixed(1); 
    }

    markFormGroupTouched(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
          control.markAsTouched();

          if (control.controls) {
            this.markFormGroupTouched(control);
          }
        });
    }

    //Calificaciones
    isNullOrEmpty(array: any[]){
        return !array || (array.length == 0);
    }

    compare(a,b){
        return (a.primerApellido+a.segundoApellido+a.nombre).localeCompare((b.primerApellido+b.segundoApellido+b.nombre))
    }

    isLast(index: number, array: any[]){
        return index == (array.length - 1);
    }

    calculateRow(index){
        let form = this.controls.at(index);
        let total = 0.00;
        this.tableHeaders.forEach( header => {
            let i = ['codigo','udg','nombre','apellido1','apellido2','total'].findIndex(item => item == header.name);
            if(i == -1)
                total += (Number(form.get(header.name).value) * header.puntos);
        });
        form.get('total').setValue(total);
    }

    getControl(index, fieldName) {
        const a  = this.controls.at(index).get(fieldName) as FormControl;
        return this.controls.at(index).get(fieldName) as FormControl;
    }

    //Asistencias
    public direct: number = null;
    changeDate(direction: number){
        let index = this.currentIndex;
        index += direction;
        //Prevent index overflow
        if(index < 0) { index = 0; }
        if(index >= this.fechasAsistencias.length) { index = this.fechasAsistencias.length - 1; }
        this.currentIndex = index;

        this.isReady = false;
        setTimeout(function(){
            this.isReady = true;
            this.direct = 0;
        }.bind(this), 500);
    }

    getDiasSemana(dias: boolean[]): string {
        let aux: string[] = [];
        let diasLetra: string[] = ['D','L','M','Mi','J','V','S'];
        diasLetra.forEach( (diaLetra, i) => {
            if(dias[i]){ aux.push(diaLetra)}
            else {aux.push('-')}
        });
        return aux.join(',');
    }

    getResumen(){
        if(this.resumenes.length > 0)
            this.resumenes = [];
        this.dataSources.forEach( dataSource => {
            dataSource.forEach(item => {
                let index = this.resumenes.findIndex( resumen => resumen.alumnoId == item.alumnoId);
                let r = new Resumen();
                if(index >= 0){
                    r = this.resumenes[index];
                } else {
                    r.alumnoId = item.alumnoId;
                }
                switch(item.tipoAsistenciaId){
                    case ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.ASISTENCIA:
                    case ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.FALTA_JUSTIFICADA:
                        r.asistencias += this.horasDia * 60;
                    break;
                    case ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.FALTA:
                        r.faltas += this.horasDia * 60;
                    break;
                    case ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.RETARDO:
                        r.retardos += item.minutosRetardo;
                        r.asistencias += ((this.horasDia * 60) - item.minutosRetardo);
                    break;
                }
                if(index == -1)
                    this.resumenes.push(r);
            });
        });
    }

    getCondensado(){
        
        this.resumeDataSource = [];
        this.alumnos.forEach(alumno => {
            let obj = {};
            obj['alumno'] = alumno;
            this.dateColumns.forEach( (dateColumn, i) => {
                let item = this.dataSources[i].find((ds) => ds.alumnoId == alumno.id);
                obj[dateColumn.name] = item;
            });
            this.resumeDataSource.push(obj);
        });
    }

    toogleView(){
        this.isReady = false;
        setTimeout(function(){
            this.isReady = true
        }.bind(this), 500);

        if(this.tableMode == 'detail')
            this.tableMode = 'resume';
        else
            this.tableMode = 'detail';
    }

    getColor(alumnoId: number): string{
        let color = "#4caf50";
        let r:Resumen = this.resumenes.find((resumen: Resumen) => resumen.alumnoId == alumnoId);
        if(r != null){
            let size = this.getSize(r.faltas + r.retardos);
            if(size > 60)
                color = "#ff9800";
            if(size > 80)
                color = "#f44336";
        }
        return color;
    }

    getSize(time: number): number {
        let size = Math.ceil((time / ((this.minutosTotal * this.faltasPermitidas) / 100)));
        size = size > 100? 100 : size;
        return size;
    }

    getSizeDisplay(time: number): string {
        let size = Math.ceil((time / (this.minutosTotal / 100)));
        if( size >= 10 )
            return String(size)+'%';
        return '';
    }

    getTooltip(time: number): string {
        let horas = Math.trunc(time/60);
        let minutos = time % 60;

        return horas +(horas != 1? ' horas ':' hora ')+minutos+(minutos != 1? ' minutos':' minuto');
    }

    getEdad(fecha){
        let edadMostrar;
        let duration = moment.duration(Number(moment()) - Number(moment(fecha)));
        edadMostrar = `${duration.years()} años`;
        if(duration.months() > 0){
            edadMostrar += `, ${duration.months()} meses`
        }
        return edadMostrar;
    }

    onCambioProfesor(){
        const dialogRef = this.dialog.open(CambioProfesorTitularIncompanyComponent, {
            width: '1000px',
            data: {
                profesorTitular: this.grupoAdd.get('empleado').value,
                categoriaTitular: this.grupoAdd.get('categoriaProfesor').value,
                sueldoTitular: this.grupoAdd.get('sueldoProfesor').value,
                profesores: this.profesores,
                cursoId: this.grupoAdd.get('programaIdioma').value.id,
                grupoId: this.grupoAdd.value?.id,
                permisoSueldo: this.permisoSueldo,
                fechasHabiles: this.listadoClases
            }
        });
        dialogRef.afterClosed().subscribe(datosAceptar => {
            if (!!datosAceptar) {
                let fechaInicio: moment.Moment = datosAceptar.fechaInicio;
                let profesorTitular: EmpleadoComboProjection = datosAceptar.profesorTitular;
                let sueldo: number = Number(datosAceptar.sueldo);
                let motivo: string = datosAceptar.motivo;
                let categoria: string = datosAceptar.categoria;
                this.profesoresTitularesController.agregarProfesorTitular({
                    empleado: profesorTitular,
                    fechaInicio: fechaInicio.format('YYYY-MM-DD'),
                    grupoId: this.grupoAdd.value?.id,
                    motivo,
                    sueldo
                });
                this.grupoAdd.get('categoriaProfesor').setValue(categoria);
                this.grupoAdd.get('sueldoProfesor').setValue(sueldo); 
                this.nuevoProfesorTitular = profesorTitular;
                let titulares = new FormArray([]);
                try{
                    this.profesoresTitularesController.getProfesoresTitulares().forEach(profesor =>{
                        titulares.push(this.createFormProfesorTitular(profesor));
                    });
                    this.grupoAdd.get('profesoresTitulares').setValue(titulares);    
                }catch(e){
                    this.profesoresTitularesController.getProfesoresTitulares().forEach(profesor =>{
                        titulares.push(this.createFormProfesorTitular(profesor));
                    });
                    this.grupoAdd.addControl('profesoresTitulares',titulares);
                }
                debugger;
                
            }
        });
    }

    createFormProfesorTitular(programaGrupoProfesor : ProgramaGrupoProfesorListadoGrupoProjection){
        let form: FormGroup = this._formBuilder.group({
            id:[programaGrupoProfesor.id],
            grupoId: new FormControl(programaGrupoProfesor.grupoId),
            empleado: new FormControl(programaGrupoProfesor.empleado),
            fechaInicio: new FormControl(programaGrupoProfesor.fechaInicio),
            motivo: new FormControl(programaGrupoProfesor.motivo),
            sueldo: new FormControl(programaGrupoProfesor.sueldo),
            activo: new FormControl(programaGrupoProfesor.activo == null ? true : programaGrupoProfesor.activo)
        });
        return form;
    }

    imageChangedEvent: any = '';
    croppedImage: any = '';

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }

    getComboZona(): void{
        // Si modalidad es personalizado entonces no se carga las zonas
        if(this.grupoAdd.controls?.paModalidad.value?.id != 18){
            let sedeId: number = this.form.controls?.sucursal.value.id,
            programaId: number = this.grupoAdd.controls?.programaIdioma.value?.programaId,
            idiomaId: number = this.grupoAdd.controls?.programaIdioma.value?.idiomaId,
            modalidadId: number = this.grupoAdd.controls?.paModalidad.value?.id,
            modalidadHorarioId: number = this.grupoAdd.controls?.horario.value ? this.grupoAdd.controls?.paModalidad.value?.horarios.find(h => h.nombre == this.grupoAdd.controls.horario.value)?.id : null;
    
            if(sedeId && programaId && idiomaId && modalidadId && modalidadHorarioId){
                this._grupoService.cargando = true;
                let json: any = {
                    sedeId,
                    programaId,
                    idiomaId,
                    modalidadId,
                    modalidadHorarioId
                };
    
                this._grupoService.getComboZona(json);
            }
        }
    }

    getCriteriosEvaluacionActivo(): any{
        return this.criteriosEvaluacionFormArray.value.filter(criterio => criterio.activo== true);
    }

    confirmaBorrarCriterioEvaluacion(element, index): void{
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: this.translate.instant('MENSAJE.CONFIRMACION_BORRAR')
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.borrarCriterioEvaluacion(element, index);
            }
        });
    }

    borrarCriterioEvaluacion(element, index): void{
        let criterio: FormGroup = this.criteriosEvaluacionFormArray.controls.find((c: FormGroup) => c.value.actividadEvaluacion.id == element.actividadEvaluacion.id) as FormGroup;
        if(element.id != null){
            criterio.controls.activo.setValue(false);
        }else{
            this.criteriosEvaluacionFormArray.removeAt(this.criteriosEvaluacionFormArray.controls.findIndex((c: FormGroup) => c.value.actividadEvaluacion.id == element.actividadEvaluacion.id));
        }
    }

    getListaComisionActivo(): ProgramaGrupoIncompanyComisionEditarProjection[]{
        return this.listaComisionFormArray.value.filter(comision => comision.activo == true);
    }

    abrirModalComision(comision: ProgramaGrupoIncompanyComisionEditarProjection, index: number){
        // Verificar si el campo de PrecioIncompanyId ha seleccionado
        if(!this.criterioEconomicoFormGroup.controls.precioIncompany.value){
            this._matSnackBar.open(this.translate.instant('Selecciones la zona en Critericos Económicos, por favor'), 'OK', {
                duration: 5000,
            });
            return;
        }

        let esNuevo: boolean = true, porcentaje: number = 0;
        if(comision)
            esNuevo = false;
        let comisionForm = this.createComisionForm(comision);

        this.getListaComisionActivo().filter(_comision => _comision.id != comisionForm.controls.id.value).map(_comision => {
            porcentaje = porcentaje + _comision.porcentaje;
        });
        // Establecer validar de porcentaje
        comisionForm.controls.porcentaje.setValidators([Validators.required, Validators.max(100 - porcentaje), Validators.min(0)])
        
        const dialogRef = this.dialog.open(ComisionComponent, {
            width: '1000px',
            data: {
                esNuevo: esNuevo,
                comisionForm: comisionForm,
                listaUsuario: this.listaUsuario,
                precioVenta: parseFloat((this.precioDetalle.precioVenta * (this.criterioEconomicoFormGroup.controls.porcentajeComision.value / 100)).toFixed(2))

            },
            disableClose: true
        });
        dialogRef.afterClosed().subscribe((_comisionForm: FormGroup) => {
            if (_comisionForm) {
                if(esNuevo)
                    this.agregarComision(_comisionForm);
                else
                    this.modificarComision(_comisionForm);
                
            }
        });
    }

    agregarComision(comisionForm: FormGroup){
        this.listaComisionFormArray.push(comisionForm);
    }

    modificarComision(comisionForm: FormGroup){
        var comisionActualizar = this.listaComisionFormArray.controls.find((comision: FormGroup) => comision.controls.id.value == comisionForm.controls.id.value);
        comisionActualizar.patchValue(comisionForm.value);
    }

    borrarComision(element, index): void{
        let comisionForm: FormGroup = this.listaComisionFormArray.controls.find((c: FormGroup) => c.value.id == element.id) as FormGroup;
        if(element.id > 0){
            comisionForm.controls.activo.setValue(false);
        }else{
            this.listaComisionFormArray.removeAt(this.listaComisionFormArray.controls.findIndex((c: FormGroup) => c.value.id == element.id));
        }
    }

    createComisionForm(comision: ProgramaGrupoIncompanyComisionEditarProjection): FormGroup {
        comision = comision ? comision : new ProgramaGrupoIncompanyComisionEditarProjection();

        if(comision.id == null){
            comision.id = this.contadorRegistrosNuevos;
            comision.activo = true;

            this.contadorRegistrosNuevos--;
        }

        let form: FormGroup = this._formBuilder.group({
            id: new FormControl(comision.id),
            grupoId: new FormControl(comision.grupoId),
            usuario: new FormControl(comision.usuario, [Validators.required]),
            porcentaje: new FormControl(comision.porcentaje, [Validators.required, Validators.min(0), Validators.max(100)]),
            montoComision: new FormControl(comision.montoComision, [Validators.required, Validators.min(0)]),
            activo: new FormControl(comision.activo)
        })

        return form;
    }

    getPrecioDetalle(grupo: ProgramaGrupoEditarProjection, esDefault: boolean){
        // Obtenemos el precio de detalle
        let precioIncompanyId: number = null;
        if(grupo.precioIncompany?.id)
            precioIncompanyId = grupo.precioIncompany?.id;
        else
            precioIncompanyId = this.criterioEconomicoFormGroup?.controls.precioIncompany?.value?.id;
        const listaPrecioDetalle: PrecioIncompanyDetalleEditarProjection[] = this.listaPrecio.find(_precio => _precio.id == precioIncompanyId)?.detalles;
        
        if(listaPrecioDetalle){
            this.precioDetalle = listaPrecioDetalle.find(detalle => detalle.programa.id == grupo.programaIdioma?.programaId && detalle.idioma.id == grupo.programaIdioma?.idiomaId && detalle.modalidad.id == grupo.paModalidad?.id && detalle.horario.nombre == grupo['horario']);
            // Agregamos dos director y coordinador de la sede
            if(esDefault){
                const precioVenta = parseFloat((this.precioDetalle.precioVenta * (this.criterioEconomicoFormGroup.controls.porcentajeComision.value / 100)).toFixed(2));
                this.sucursales.filter(s => s.id == this.form.controls.sucursal.value.id).map(s => {
                    let comision: ProgramaGrupoIncompanyComisionEditarProjection;
                    // Director
                    if(s.responsable){
                        comision = new ProgramaGrupoIncompanyComisionEditarProjection();
                        comision.id = this.contadorRegistrosNuevos;
                        comision.usuario = s.responsable;
                        comision.activo = true;
                        comision.porcentaje = 60;
                        comision.montoComision = parseFloat((precioVenta * (comision.porcentaje / 100)).toFixed(2));

                        this.listaComisionFormArray.push(this.createComisionForm(comision));

                        this.contadorRegistrosNuevos--;
                    }
                    // Coordinador
                    if(s.coordinador){
                        comision = new ProgramaGrupoIncompanyComisionEditarProjection();
                        comision.id = this.contadorRegistrosNuevos;
                        comision.usuario = s.coordinador;
                        comision.activo = true;
                        comision.porcentaje = 40;
                        comision.montoComision = parseFloat((precioVenta * (comision.porcentaje / 100)).toFixed(2));

                        this.listaComisionFormArray.push(this.createComisionForm(comision));

                        this.contadorRegistrosNuevos--;
                    }
                });
            }
        }
    }

}

interface DiasClase{
    id: number,
    fecha: Date,
    nivel: number,
    borrada: boolean
}