import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener, ChangeDetectorRef, QueryList  } from '@angular/core';
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
import { GruposService } from '../grupos/grupos.service';
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
import { Usuario } from '@models/usuario';
import { ProgramaGrupoEditarProjection, ProgramaGrupo, ProgramaGrupoComboProjection } from '@app/main/modelos/programa-grupo';
import { ProgramaGrupoListadoClase, ProgramaGrupoListadoClaseEditarProjection } from '@app/main/modelos/programa-grupo-listado-clase';
import { ProgramacionAcademicaComercialEditarProjection } from '@app/main/modelos/programacion-academica-comercial';
import { ProgramaIdiomaComboProjection } from '@app/main/modelos/programa-idioma';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { EmpleadoComboProjection } from '@app/main/modelos/empleado';
import { AlumnoAsistencia } from '@app/main/modelos/alumno-asistencia';
import { ControlMaestroMultipleComboProjection, ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { PACicloComboProjection } from '@app/main/modelos/paciclo';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import * as moment from 'moment';
import 'moment/locale/es';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { AddExamenComponent } from './dialogs/add-examen/add-examen.dialog';
import { CambioGrupoComponent, CambioGrupoData } from './dialogs/cambio-grupo/cambio-grupo.dialog';
import { SolicitudPagoProveedoresHistorialComponent } from './solicitud-historial.component';
import { FechasHabilesService } from '@services/fechas-habiles.service';
import { IconSnackBarComponent } from '@pixvs/componentes/snackbars/icon-snack-bar.component';
import { CambioProfesorTitularComponent } from './dialogs/cambio-profesor-titular/cambio-profesor-titular.dialog';
import { ProgramaGrupoProfesorListadoGrupoProjection } from '@app/main/modelos/programa-grupo-profesor';
import { CancelarGrupoComponent } from './dialogs/cancelar-grupo/cancelar-grupo.dialog';
import { EvidenciaDialogComponent, EvidenciaDialogData } from './dialogs/evidencia/evidencia.dialog';
import { ArchivoProjection } from '@models/archivo';
import { ProgramaGrupoEvidencia } from '@app/main/modelos/programa-grupo-evidencia';
import { EvidenciasService } from './evidencias.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { MatTab, MatTabChangeEvent } from '@angular/material/tabs';
import { TabCalificacionesComponent } from './tabs/calificaciones/tab-calificaciones.component';
import { ListadoProgramaGrupoExamenDetalle } from '@app/main/modelos/programa-grupo-examen-detalle';

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

class ProfesoresTitularesController {

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
        this.profesoresSuplentesMap = {};
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
    selector: 'grupos-detalles',
    templateUrl: './grupos-detalles.component.html',
    styleUrls: ['./grupos-detalles.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class GruposDetallesComponent implements ComponentCanDeactivate {

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return this.form.disabled || this.form.pristine;
    }

    @ViewChild(TabCalificacionesComponent) childTabCalificacionesComponent;

    pageType: string = 'ver';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;
    localeEN = english;
    localeES = spanish;

    grupo: ProgramaGrupoEditarProjection;
    form: FormGroup;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */
    plataformas : ControlMaestroMultipleComboProjection[];
    modalidades: PAModalidadComboProjection[];
    profesores: EmpleadoComboProjection[];
    cursos: ProgramaIdiomaComboProjection[];
    sucursales: SucursalComboProjection[];
    tipoGrupo: ControlMaestroMultipleComboProjection[];
    programaciones: ProgramacionAcademicaComercialEditarProjection[];
    formasPago: ControlMaestroMultipleComboProjection[];
    listaExamenDetalle: ListadoProgramaGrupoExamenDetalle[] = [];
    alumnos: any[];
    inscripciones: any[];
    gruposParaCambio: {[tipoGrupoId:string]: ProgramaGrupoComboProjection[]};
    gruposMultisede: {[tipoGrupoId:string]: ProgramaGrupoComboProjection[]};
    ciclos: PACicloComboProjection[];
    modalidad: PAModalidadComboProjection;
    planteles: any[];
    tiposGrupo: ControlMaestroMultipleComboSimpleProjection[];

    activoControl: FormControl = new FormControl();
    @ViewChild('modalidadSelect') modalidadSelect: PixvsMatSelectComponent;
    @ViewChild('programacionSelect') programacionSelect: PixvsMatSelectComponent;
    @ViewChild('cicloSelect') cicloSelect: PixvsMatSelectComponent;
    @ViewChild('plantelSelect') plantelSelect: PixvsMatSelectComponent;


    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;
    tabIndex: number = 0;

    sucursalControl: FormControl = new FormControl();
    cursoControl: FormControl = new FormControl();
    modalidadControl: FormControl = new FormControl();
    plataformaControl: FormControl = new FormControl();   
    programacionComercialControl: FormControl = new FormControl(); 
    modalidadHorarioControl: FormControl = new FormControl();
    tipoGrupoControl: FormControl = new FormControl();
    profesorControl: FormControl = new FormControl();
    cicloControl: FormControl = new FormControl();
    plantelControl: FormControl = new FormControl();
    
    displayedColumns: string[] = ['actividad', 'formato','score','tiempo'];
    displayedColumnsAlumnos: string[] = ['imagen', 'codigo','codigoUDG','primerApellido','segundoApellido','nombre','centroUniversitario','carrera','edad','correoElectronico','telefono','inscripcion','ordenVenta','menu'];
    deshabilitarBotones: boolean = true; // Nota: funciona al revés XD (cuando es true los botones están habilitados)

    fechaInicioFormateada: string;
    fechaFinFormateada: string;

    listadoClases: ListadoClases[];
    fechaActual = moment(new Date()).format('YYYY-MM-DD');

    displayedColumnsClases: string[] = ['numero', 'fechaClase', 'profesor','estatus','acciones'];

    listadoClasesProfesores: FormArray = new FormArray([]);

    historial: any[];

    inscripcionesPagadas: number =0;
    inscripcionesEnProceso: number =0;
    inscripcionesPendientes: number =0;
    codigoGrupo: string;
    esJobs: boolean = false;
    esJobsSems: boolean = false;
    fechasHabiles: any[];

    permisoMultisede: boolean;
    permisoSueldo: boolean;

    dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
    tipoTabla: 'attendance' | 'grades' = 'grades';

    mostrarBtnCambioProfesor: boolean = false;
    profesoresTitularesController: ProfesoresTitularesController;
    nuevoProfesorTitular: EmpleadoComboProjection = null;

    permiteCambioGrupo: boolean = true;

    permisoBajaGrupo: boolean = false;

    // Evidencias
    contadorEvidencias = -1;
    columnasTablaEvidencias: any[] = [
        {
            name: 'nombre',
            title: "Nombre del archivo",
            class: "mat-column-flex flex-40",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'archivo.fechaCreacion',
            title: "Fecha",
            class: "mat-column-flex",
            centrado: false,
            type: 'fecha',
            tooltip: false
        },
        {
            name: 'archivo.creadoPor.nombreCompleto',
            title: "Usuario",
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'borrar',
            title: '',
            class: "mat-column-80",
            centrado: true,
            type: 'delete',
            tooltip: false
        }
    ];
    columnasFechasEvidencias: string[] = ['archivo.fechaCreacion'];
    displayedColumnsEvidencias: string[] = [];

    estatus: string;

    activarEdicion: boolean = false;
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
        public _grupoService: GruposService,
        private el: ElementRef,
        public validatorService: ValidatorService,
        private _historial: MatBottomSheet,
        public fechasHabilesService: FechasHabilesService,
        private cdRef:ChangeDetectorRef,
        private _evidenciasService: EvidenciasService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        //this.curso = new Programa();

        // Set the private defaults
        this._unsubscribeAll = new Subject();

    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = 'ver';
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            

            this.config = {
                rutaAtras: "/app/programacion-academica/grupos",
                rutaBorrar: "/api/v1/grupos/delete/",
                icono: "book"
            }

        });
        // Subscribe to update proveedor on changes
        this._grupoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                this.permisoBajaGrupo = datos.permisoBajaGrupo;
                this.grupo = datos.grupo;
                this.mostrarBtnCambioProfesor = datos.mostrarBtnCambioProfesor;
                this.esJobs = this.grupo.programaIdioma?.esJobs || this.grupo.programaIdioma?.esPcp || this.grupo.programaIdioma?.codigo == 'JBP';
                this.esJobsSems = this.grupo.programaIdioma?.esJobsSems;
                this.permiteCambioGrupo = moment().isBefore(moment(this.grupo.fechaFin)) || this.grupo.estatus.valor =='Activo';
                
                if(this.esJobs && !this.esJobsSems){
                    this.displayedColumnsAlumnos = ['imagen', 'codigo','codigoUDG','primerApellido','segundoApellido','nombre','centroUniversitario','carrera','correoElectronico','telefono','inscripcion','ordenVenta','menu'];
                }else if (!this.esJobs && this.esJobsSems){
                    this.displayedColumnsAlumnos = ['imagen', 'codigo','codigoUDG','primerApellido','segundoApellido','nombre','preparatoria','bachillerato','correoElectronico','telefono','inscripcion','ordenVenta','menu'];
                }else if(!this.esJobs && !this.esJobsSems){
                    this.displayedColumnsAlumnos = ['imagen', 'codigo','codigoUDG','primerApellido','segundoApellido','nombre','edad','correoElectronico','telefono','inscripcion','ordenVenta','menu'];
                }
                this.modalidad = datos?.modalidad;
                let dias: boolean[] = [!!this.modalidad?.domingo, !!this.modalidad?.lunes, !!this.modalidad?.martes, !!this.modalidad?.miercoles, !!this.modalidad?.jueves, !!this.modalidad?.viernes, !!this.modalidad?.sabado];
              
                this.cursos = datos.cursos;
                this.sucursales = datos.sucursales;
                this.alumnos = datos.alumnos.map(a => a.alumno).sort((a,b) => this.compare(a,b));
                this.listaExamenDetalle = datos.listaExamenDetalle;
                this.historial = datos.historial;
                this.plataformas = datos.plataformas;
                this.profesores = datos.profesores;
                this.tipoGrupo = datos.tipoGrupo;
                this.modalidades = datos.modalidades;
                this.historial = datos.historial;
                this.formasPago = datos.formasPago;
                this.inscripciones = datos.inscripciones;
                this.dataSource.data = this.inscripciones || [];
                this.ciclos = datos.paCiclos;
                this.gruposParaCambio = datos.gruposParaCambio;
                this.gruposMultisede = datos.gruposMultisede;
                this.permisoMultisede = datos.permisoMultisede;
                this.permisoSueldo = datos.permisoSueldo;
                this.tiposGrupo = datos.tiposGrupo;
                
                this.estatus = datos.estatus || '';
                this.inscripcionesPendientes = 0;
                this.inscripcionesPagadas = 0;
                this.inscripciones.forEach(ins =>{
                    if(ins.estatus.valor == 'Pagada'){
                        this.inscripcionesPagadas = this.inscripcionesPagadas + 1;
                    }
                    else if(ins.estatus.valor == 'Pendiente de pago'){
                        this.inscripcionesPendientes = this.inscripcionesPendientes + 1;
                    }
                });
                this.form = this.createProgramaForm();
                this.form.get('fechaInicio').disable;
                this.form.get('fechaFin').disable;
                this.fechaInicioFormateada =moment(this.form.get('fechaInicio').value).format('MMMM DD YYYY');
                this.fechaFinFormateada =moment(this.form.get('fechaFin').value).format('MMMM DD YYYY');
                 
                //this.createClases();
                if (this.pageType == 'ver') {
                    this.form.disable();
                    //this.usuarioGroup.disable();
                    this.deshabilitarBotones = false;
                }
                this.setFechasClase(datos?.fechas);

                if (this.grupo?.evidencias) {
                    this.grupo.evidencias = this.grupo.evidencias.filter(x => { return x.vigente });
                }
                
                this._evidenciasService.setDatos(this.grupo?.evidencias);

                if(this.activarEdicion){
                    this.activarEdicion = false;
                    this.form.enable({
                        emitEvent: false
                    });
                    this.deshabilitarBotones = true;
                }

                // setTimeout(() => {
                //     this.tipoTabla = 'grades';
                // }, 10000);
                
            });
        /*this._grupoService.onComboProgramacionChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoProgramaciones => {
            if (listadoProgramaciones) {
                this._grupoService.onComboProgramacionChanged.next(null);
                //this.programaciones = listadoProgramaciones;
                //this.programacionSelect.setDatos(listadoProgramaciones);
            }
        });*/

        this.form?.get('empleado').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.form.get('empleado').value?.nombreCompleto){
                //this.createClases();
                let dias: boolean[] = [!!this.modalidad?.domingo, !!this.modalidad?.lunes, !!this.modalidad?.martes, !!this.modalidad?.miercoles, !!this.modalidad?.jueves, !!this.modalidad?.viernes, !!this.modalidad?.sabado];
                this.fechasHabilesService.getFechasHabiles(moment(this.grupo?.fechaInicio).format('YYYY-MM-DD'), moment(this.grupo?.fechaFin).format('YYYY-MM-DD'), dias);
            }
            if(this.form.get('empleado').value){
                this._grupoService.getDatosSueldo(this.cursoControl.value.id,this.form.get('empleado').value.id,this.grupo.id).then(value =>{
                    try{
                       this.form.get('categoriaProfesor').setValue(value.data.categoria);
                        this.form.get('sueldoProfesor').setValue(value.data.sueldo); 
                    }catch(e){
                        this._matSnackBar.open(this.translate.instant('El curso o el profesor no tienen tabulador'), 'OK', {
                            duration: 5000,
                        });
                    }
                    
                });
            }
        });


        /*this.fechasHabilesService.onDatosChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((datos) => {
            if(!!datos){
                this.fechasHabiles = datos;
                var index = 1;
                let nombreProfesor = '';
                if(this.form.get('empleado').value || this.grupo.empleado){
                   nombreProfesor =  this.grupo.empleado == null ? this.form.get('empleado')?.value?.nombreCompleto.replace(this.form.get('empleado').value?.nombreCompleto.substr(0, this.form.get('empleado').value?.nombreCompleto.indexOf('-')),'').replace('-','') : this.grupo.empleado.nombreCompleto.replace(this.grupo.empleado.nombreCompleto.substr(0, this.grupo.empleado.nombreCompleto.indexOf('-')),'').replace('-','');
                }
                this.listadoClases = [];
                datos.forEach(dato =>{
                    this.listadoClases.push({
                        numeroClase: index,
                        fechaClase: moment(dato).format('YYYY-MM-DD')+' '+this.grupo.modalidadHorario.nombre,
                        soloFecha: moment(dato).format('YYYY-MM-DD'),
                        fechaHarcodeada: this.grupo.modalidadHorario.nombre + ' ' +moment(dato).format('DD/MM/YYYY'),
                        profesor: nombreProfesor,
                        estatus: moment(dato+' '+this.grupo.modalidadHorario.horaFin).isAfter(moment(this.fechaActual)) ? 'Pendiente' : 'Finalizado',
                        historial:null
                    });
                    index = index + 1;
                });
                var a = moment();
                var b = moment(a.toISOString());
                if(this.grupo.listadoClases && this.grupo.listadoClases.length>0){
                    this.listadoClasesProfesores = new FormArray([]);
                    this.grupo.listadoClases.forEach(listado =>{
                        this.listadoClasesProfesores.push(this.createListadoClasesArray(listado,this.grupo.id));
                    });
                    if(this.listadoClases && this.listadoClases.length>0){
                        this.listadoClasesProfesores.value.forEach(clase =>{
                            let index = this.listadoClases.findIndex(listado =>{
                                return listado.fechaClase == (clase.fecha+' '+this.grupo.modalidadHorario.nombre);
                            });
                            if(index > -1){
                                this.listadoClases[index]['referenciaId'] = clase.id;
                                this.listadoClases[index].profesor = clase.empleado.nombreCompleto.replace(clase.empleado.nombreCompleto.substr(0, clase.empleado.nombreCompleto.indexOf('-')),'').replace('-','')
                            }else{
                                this.listadoClases[index]['referenciaId'] = 0;                        
                            }
                        });
                        this.listadoClases.forEach(clase =>{
                            let result = this.historial.filter(a =>{
                                return a.referenciaId == clase['referenciaId'];
                            });
                            clase['historial'] = result;
                        });
                    }
                    
                }

                //Asistencias
                let horasDia: number = this.modalidad.horasPorDia;
                datos.forEach(fecha => {
                    this.fechasAsistencias.push(moment(fecha).toDate());
                });
                let prevIndex = this.currentIndex;
                this.editableIndex = null;
                this.minutosTotal = horasDia * this.fechas.length * 60;
                this.dataSources = [];
                
                this.fechasAsistencias.forEach((fecha, i) => {
                    let source: any[] = [];

                    this.alumnos.forEach(alumno => {
                        
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

                //Consultar permiso

                this.getResumen();

                this.dateColumns = [];
                
                this.fechasAsistencias.forEach((fecha,i) => {
                    this.dateColumns.push({name: 'fecha'+i, label: moment(fecha).format('YYYY-MM-DD')});
                    this.resumeColumns.push('fecha'+i);
                });

                this.getCondensado();

                this.profesoresTitularesController = new ProfesoresTitularesController(this.fechasHabiles,this.grupo.profesoresTitulares,this.listadoClasesProfesores.value);

                this.isReady = true;
            }
        });*/
        
    }

    setFechasClase(f: any[]){
        this.fechasHabiles = [];
        f.forEach(dia =>{
            this.fechasHabiles.push(dia.fecha);
        });
        var index = 1;
        let nombreProfesor = '';
        if(this.form.get('empleado').value || this.grupo.empleado){
           nombreProfesor =  this.grupo.empleado == null ? this.form.get('empleado')?.value?.nombreCompleto.replace(this.form.get('empleado').value?.nombreCompleto.substr(0, this.form.get('empleado').value?.nombreCompleto.indexOf('-')),'').replace('-','') : this.grupo.empleado.nombreCompleto.replace(this.grupo.empleado.nombreCompleto.substr(0, this.grupo.empleado.nombreCompleto.indexOf('-')),'').replace('-','');
        }
        this.listadoClases = [];
        this.fechasHabiles.forEach(dato =>{
            this.listadoClases.push({
                numeroClase: index,
                fechaClase: moment(dato).format('YYYY-MM-DD')+' '+this.grupo.modalidadHorario.nombre,
                soloFecha: moment(dato).format('YYYY-MM-DD'),
                fechaHarcodeada: this.grupo.modalidadHorario.nombre + ' ' +moment(dato).format('DD/MM/YYYY'),
                profesor: nombreProfesor,
                estatus: moment(dato+' '+this.grupo.modalidadHorario.horaFin).isAfter(moment(this.fechaActual)) ? 'Pendiente' : 'Finalizado',
                historial:null
            });
            index = index + 1;
        });
        var a = moment();
        var b = moment(a.toISOString());
        this.listadoClasesProfesores = new FormArray([]);
        if(this.grupo.listadoClases && this.grupo.listadoClases.length>0){
            this.grupo.listadoClases.forEach(listado =>{
                this.listadoClasesProfesores.push(this.createListadoClasesArray(listado,this.grupo.id));
            });
            if(this.listadoClases && this.listadoClases.length>0){
                this.listadoClasesProfesores.value.forEach(clase =>{
                    let index = this.listadoClases.findIndex(listado =>{
                        return listado.fechaClase == (clase.fecha+' '+this.grupo.modalidadHorario.nombre);
                    });
                    if(index > -1){
                        this.listadoClases[index]['referenciaId'] = clase.id;
                        this.listadoClases[index].profesor = clase.empleado.nombreCompleto.replace(clase.empleado.nombreCompleto.substr(0, clase.empleado.nombreCompleto.indexOf('-')),'').replace('-','')
                    }else{
                        this.listadoClases[index]['referenciaId'] = 0;                        
                    }
                });
                this.listadoClases.forEach(clase =>{
                    let result = this.historial.filter(a =>{
                        return a.referenciaId == clase['referenciaId'];
                    });
                    clase['historial'] = result;
                });
            }
            
        }
        this.profesoresTitularesController = new ProfesoresTitularesController(this.fechasHabiles,this.grupo.profesoresTitulares,this.listadoClasesProfesores.value);
    }

    ngAfterViewInit(){
        this.cdRef.detectChanges();
        if(this.esJobs || this.esJobsSems){
            this.ciclos = [].concat(this.grupo.paCiclo);
            this.cicloSelect.setDatos(this.ciclos);
            if(this.grupo.sucursalPlantel){
                this.planteles = [].concat(this.grupo.sucursalPlantel);
                try{
                    this.plantelSelect.setDatos(this.planteles);
                }catch(e){}
                
            }
            
        }else if(!this.esJobs && !this.esJobsSems){
            this.programaciones = [...[].concat(this.grupo.programacionAcademicaComercial)];
            this.programacionSelect.setDatos(this.programaciones);
            this.plantelControl = new FormControl(this.grupo.sucursalPlantel);
        }
        if(!this.grupo.categoriaProfesor && !this.grupo.sueldoProfesor && this.grupo.empleado){
            this._grupoService.getDatosSueldo(this.grupo.programaIdioma.id,this.form.get('empleado').value.id,this.grupo.id).then(value =>{
                try{
                   this.form.get('categoriaProfesor').setValue(value.data.categoria);
                    this.form.get('sueldoProfesor').setValue(value.data.sueldo); 
                }catch(e){
                    
                }
                
            });
        }
        this.cdRef.detectChanges();
    }

    createProgramaForm(): FormGroup {
        if(this.esJobs || this.esJobsSems){
            this.cicloControl = new FormControl(this.grupo.paCiclo, [Validators.required]);
            this.programacionComercialControl = new FormControl(this.grupo.programacionAcademicaComercial);
            if(this.grupo.programaIdioma.esPcp){
                this.plantelControl = new FormControl(this.grupo.sucursalPlantel);
            }else {
                this.plantelControl = new FormControl(this.grupo.sucursalPlantel, [Validators.required]);
            }
        }else if(!this.esJobs && !this.esJobsSems){
            this.programacionComercialControl = new FormControl(this.grupo.programacionAcademicaComercial, [Validators.required]);
            this.cicloControl = new FormControl(this.grupo.paCiclo);
            this.plantelControl = new FormControl(this.grupo.sucursalPlantel);
        }
        this.cursoControl = new FormControl(this.grupo.programaIdioma, [Validators.required]);
        this.sucursalControl = new FormControl(this.grupo.sucursal, [Validators.required]);
        //this.sucursales = [].concat(this.grupo.sucursal);
        this.modalidadControl = new FormControl(this.grupo.paModalidad, [Validators.required]);
        this.modalidades = [].concat(this.grupo.paModalidad);
        
        this.modalidadHorarioControl = new FormControl(this.grupo.modalidadHorario, [Validators.required]);
        this.plataformaControl = new FormControl(this.grupo.plataforma, [Validators.required]);
        this.plataformas = [].concat(this.grupo.plataforma);
        
        
        this.tipoGrupoControl = new FormControl(this.grupo.tipoGrupo, [Validators.required]);
        this.profesorControl = new FormControl(this.grupo.empleado);
        this.codigoGrupo = this.grupo.codigo;
        let nombreGrupo = this.grupo.programaIdioma.codigo+' '+(this.grupo.sucursalPlantel ? this.grupo.sucursalPlantel.nombre : '')+' '+this.grupo.programaIdioma.idioma.valor+' Nivel '+("0" + this.grupo.nivel).slice(-2)+' Horario '+(this.grupo.modalidadHorario.nombre)+' Grupo '+("0" + this.grupo.grupo).slice(-2);
        if(this.grupo.empleado && this.grupo.empleado.nombreCompleto){
            this.titulo = nombreGrupo +' '+this.grupo.empleado.nombreCompleto.replace(this.grupo.empleado.nombreCompleto.substr(0, this.grupo.empleado.nombreCompleto.indexOf('-')),'').replace('-','');
            //this.createClases();
        }else{
            this.titulo = nombreGrupo;
        }
        
        
        if (this.cursoControl.value) {
            /*this._grupoService.getComboProgramacion(this.cursoControl.value.programaId,this.modalidadControl.value.id,this.cursoControl.value.idiomaId).then(value =>{
                this.programaciones = value.data;
            });*/
            /*this._grupoService.getComboTest(this.cursoControl.value.id,this.grupo.paModalidad.id).then(value =>{
                this.tests = value.data;
            });*/
        }

         let form: FormGroup = this._formBuilder.group({
            id:[this.grupo.id],
            codigoGrupo:new FormControl(this.codigoGrupo),
            nombreGrupo: new FormControl(nombreGrupo),
            sucursal: this.sucursalControl,
            programaIdioma: this.cursoControl,
            paModalidad:this.modalidadControl,
            programacionAcademicaComercial: this.programacionComercialControl,
            fechaInicio: new FormControl(moment(this.grupo.fechaInicio).format('YYYY-MM-DD')),
            fechaFin: new FormControl(moment(this.grupo.fechaFin).format('YYYY-MM-DD')),
            nivel: new FormControl(this.grupo.nivel),
            grupo: new FormControl(this.grupo.grupo),
            plataforma: this.plataformaControl,
            modalidadHorario: this.modalidadHorarioControl,
            tipoGrupo: this.tipoGrupoControl,
            empleado: this.profesorControl,
            cupo: new FormControl(this.grupo.cupo),
            multisede: new FormControl(this.grupo.multisede),
            estatus: new FormControl(this.grupo.estatus),
            listadoClases: this.listadoClasesProfesores,
            paCiclo: this.cicloControl,
            sucursalPlantel: this.plantelControl,
            calificacionMinima: new FormControl(this.grupo.calificacionMinima),
            faltasPermitidas: new FormControl(this.grupo.faltasPermitidas),
            categoriaProfesor: new FormControl(this.grupo.categoriaProfesor),
            sueldoProfesor: new FormControl(this.grupo.sueldoProfesor),
            aula: new FormControl(this.grupo.aula),
            comentarios: new FormControl(this.grupo.comentarios),
            fechaModificacion: this.grupo.fechaModificacion,
            fechaFinInscripcionesFormat: new FormControl(this.grupo.fechaFinInscripciones == null ? null : moment(this.grupo.fechaFinInscripciones).format('MMMM DD YYYY')),
            fechaFinInscripcionesBecasFormat: new FormControl(this.grupo.fechaFinInscripcionesBecas == null ? null : moment(this.grupo.fechaFinInscripcionesBecas).format('MMMM DD YYYY')),
            fechaFinInscripciones: new FormControl(this.grupo.fechaFinInscripciones),
            fechaFinInscripcionesBecas: new FormControl(this.grupo.fechaFinInscripcionesBecas)
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    isRequired(campo: string, form: FormGroup) {
        let form_field = form.get(campo);
        if (!form_field.validator)
            return false;
        let validator = form_field.validator({} as AbstractControl);
        return !!(validator && validator.required);
    }

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }

    guardar() {
        if(this.inscripciones && this.inscripciones.length > this.form.get('cupo').value){
            this._matSnackBar.open(this.translate.instant('El cupo no puede ser menor a los alumnos ya inscritos'), 'OK', {
                duration: 5000,
            });
            return true;
        }
        if (this.croppedImage) {
            this.form.get('img64').setValue(this.croppedImage);
        }
        if (this.form.valid) {
            this.form.removeControl('listadoClases');
            this.form.addControl('listadoClases',this.listadoClasesProfesores);
            //this.form.get('programacionAcademicaComercial').setValue(null);
            //this.form.addControl('programacionAcademicaComercialId',this.programacionComercialControl?.value?.id);
            this._grupoService.cargando = true;

            this.form.disable();
            let requestBody: ProgramaGrupoEditarProjection = this.form.getRawValue();
            requestBody.profesoresTitulares = this.profesoresTitularesController.getProfesoresTitulares();
            requestBody.nuevoProfesorTitular = this.nuevoProfesorTitular;
            requestBody.evidencias = this.grupo.evidencias;

            this._grupoService.guardar(JSON.stringify(requestBody), '/api/v1/grupos/save').then(
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

            /*for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {                          
                        invalidControl.focus();
                        break;
                    }

                }
            }*/
            this.markFormGroupTouched(this.form);

            this._grupoService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }

    markFormGroupTouched(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
          control.markAsTouched();

          if (control.controls) {
            this.markFormGroupTouched(control);
          }
        });
    }

    deshabilitarCampos(event){
        this.deshabilitarBotones = true;
    }

    abrirModal(index){
        let profesorTemp = null;
        if(this.listadoClasesProfesores && this.listadoClasesProfesores.length >0){
            let indexBuscar = this.listadoClasesProfesores.value.findIndex(x =>{
                    let fecha = this.listadoClases[index].fechaClase.match(/(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g)[0];
                    return moment(x.fecha).format('YYYY-MM-DD') == moment(fecha).format('YYYY-MM-DD');
                });
            if(indexBuscar > -1){
                profesorTemp = this.listadoClasesProfesores.controls[indexBuscar].value;
            }
            
        }
        const dialogRef = this.dialog.open(AddExamenComponent, {
            width: '1000px',
            data: {
                clases: this.listadoClases,
                nombreProfesor: this.grupo.empleado == null ? this.form.get('empleado')?.value?.nombreCompleto.replace(this.form.get('empleado').value?.nombreCompleto.substr(0, this.form.get('empleado').value?.nombreCompleto.indexOf('-')),'').replace('-','') : this.grupo.empleado.nombreCompleto.replace(this.grupo.empleado.nombreCompleto.substr(0, this.grupo.empleado.nombreCompleto.indexOf('-')),'').replace('-',''),
                profesores: this.profesores,
                fechaSelected: index,
                formasPago: this.formasPago,
                profesorSustituto: profesorTemp,
                idCurso: this.cursoControl.value.id,
                idGrupo: this.grupo.id,
                idIdioma: this.cursoControl.value.idiomaId,
                idHorario: this.grupo.modalidadHorario.id
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                //this.guardar();
                this.addProfesorSustituto(confirm);
            }
        });
    }

    addProfesorSustituto(profesor){
        profesor.controls.forEach(profesorSustituto =>{
            if(this.listadoClasesProfesores && this.listadoClasesProfesores.length >0){
                let index = this.listadoClasesProfesores.value.findIndex(x =>{
                    let fecha = profesorSustituto.value.fecha;
                    return moment(x.fecha).format('YYYY-MM-DD') == moment(fecha).format('YYYY-MM-DD');
                });
                if(index > -1){
                    this.listadoClasesProfesores.controls[index].get('empleado').setValue(profesorSustituto.value.empleado);
                    this.listadoClasesProfesores.controls[index].get('sueldoProfesor').setValue(profesorSustituto.value.sueldoProfesor);
                }else{
                    this.listadoClasesProfesores.push(profesorSustituto);
                }
            }else{
                this.listadoClasesProfesores.push(profesorSustituto);
            }
            this.listadoClasesProfesores.value.forEach(clase =>{
                let index = this.listadoClases.findIndex(listado =>{
                    return listado.fechaClase == (clase.fecha+' '+this.grupo.modalidadHorario.nombre);
                });
                if(index > -1){
                    this.listadoClases[index].profesor = clase.empleado.nombreCompleto.replace(clase.empleado.nombreCompleto.substr(0, clase.empleado.nombreCompleto.indexOf('-')),'').replace('-','')
                }
            });
        })        
        this.listadoClases = [...this.listadoClases];
        this.profesoresTitularesController.setProfesoresSuplentes(this.listadoClasesProfesores.value);
    }

    createListadoClasesArray(clase: ProgramaGrupoListadoClaseEditarProjection, grupoId: number){
        let form: FormGroup = this._formBuilder.group({
            id: [clase.id],
            grupoId: new FormControl(grupoId),
            fecha: new FormControl(moment(clase.fecha).format('YYYY-MM-DD')),
            empleado: new FormControl(clase.empleado),
            formaPago: new FormControl(clase.formaPago),
            comentario: new FormControl(clase.comentario),
            categoriaProfesor: new FormControl(clase.categoriaProfesor),
            sueldoProfesor: new FormControl(clase.sueldoProfesor),
            fechaPago: new FormControl(clase.fechaPago),
            fechaDeduccion: new FormControl(clase.fechaDeduccion)
        });
        return form;
    }

    sePuedeCambiarProfesor(){
        return moment(this.grupo.fechaInicio).isBefore(moment(this.fechaActual)) && this.grupo.empleado;
    }

    abrirHistorial(historial){
        let historialTemp ={
            creadoPor: this.grupo.creadoPor.nombreCompleto,
            fechaCreacion: this.grupo.fechaCreacion,
            id: 0,
            proceso: {id: 7, nombre: "ProgramasGruposCambioProfesor", icono: null},
            texto: "Grupo creado",
            tipo: {id: 1, nombre: "Creado", icono: "add", colorFondo: "#28a745"},
            tipoId: 1,
            usuarioId: 1,
        }
        const historialMostrar = [].concat(historialTemp).concat(historial);
        this._historial.open(SolicitudPagoProveedoresHistorialComponent, {
            data: historialMostrar,
        });
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

    confirmarBaja(element){
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: 'El alumno ' +element.alumno.nombre+' '+element.alumno.primerApellido + ' ' + element.alumno.segundoApellido +' se dará de baja'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.darBajaInscripcion(element.id);
            }
        });
    }

    posponerCurso(element){
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: '¿Deséas posponerse el curso para el alumno ' +element.alumno.nombre+' '+element.alumno.primerApellido + ' ' + element.alumno.segundoApellido +'?'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.darPosponerInscripcion(element.id);
            }
        });
    }

    confirmBorrarInscripcion(element, index){
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: '¿Deséas eliminar la inscripción?'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.borrarInscripcion(element, index);
            }
        });
    }

    borrarInscripcion(grupo, index){
        this._grupoService.cargando = true;
        const json: any = {
            grupoId: grupo.grupoId,
            alumnoId: grupo.alumno.id
        }
        this._grupoService.post(JSON.stringify(json), '/api/v1/grupos/borrar-inscripcion', true).then(
            function (result: JsonResponse) {
                this._grupoService.cargando = false;
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('La inscripción ha sido eliminado.'), 'OK', {
                        duration: 5000,
                    });
                    let data: any = this.dataSource.data;
                    data.splice(index, 1);
                    this.dataSource.data = data;
                } else {
                    this._matSnackBar.open(this.translate.instant('No se puede borrar la inscrpción porque tiene liga de pagos.'), 'OK', {
                        duration: 5000,
                    });
                }
            }.bind(this)
        );
    }

    darPosponerInscripcion(idInscripcion){
        this._grupoService.posponerGrupo(idInscripcion).then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('Datos actualizados'), 'OK', {
                        duration: 5000,
                    });
                    this.getInscripciones();
                } else {
                    this._grupoService.cargando = false;
                }
            }.bind(this)
        );
    }

    darBajaInscripcion(idInscripcion){
        this._grupoService.bajaGrupo(idInscripcion).then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('Datos actualizados'), 'OK', {
                        duration: 5000,
                    });
                    this.getInscripciones();
                } else {
                    this._grupoService.cargando = false;
                }
            }.bind(this)
        );
    }

    getInscripciones(){
        this._grupoService.getInscripciones(this.grupo.id).then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this.inscripciones = [...result.data];
                    this.dataSource.data = [...result.data];
                    this.inscripcionesPagadas = 0;
                    this.inscripcionesPendientes = 0;
                    this.inscripciones.forEach(ins =>{
                        if(ins.estatus.valor == 'Pagada'){
                            this.inscripcionesPagadas = this.inscripcionesPagadas + 1;
                        }
                        else if(ins.estatus.valor == 'Pendiente de pago'){
                            this.inscripcionesPendientes = this.inscripcionesPendientes + 1;
                        }
                    });
                } else {
                    this._grupoService.cargando = false;
                }
            }.bind(this)
        );
    }

    abrirModalCambioGrupo(element){
        let alumno = element.alumno.codigo+'-'+element.alumno.nombre;

        let data: CambioGrupoData = {
            sucursales: this.sucursales,
            tiposGrupo: this.tiposGrupo,
            grupos: this.gruposParaCambio,
            alumno: alumno,
            grupoActual: this.codigoGrupo,
            gruposMultisede: this.gruposMultisede,
            esJobs: (this.esJobsSems || this.esJobs) && !this.grupo.programaIdioma?.esPcp ? true : false,
            grupoId: this.grupo.id,
            alumnoId: element.alumno.id
        }

        const dialogRef = this.dialog.open(CambioGrupoComponent, {
            width: '500px',
            data
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.cambioGrupo(confirm,element.id);
            }
        });
    }

    cambioGrupo(guardarDatos,idInscripcion){
        let json = {
            comentario: guardarDatos.comentario,
            idNuevoGrupo: guardarDatos.idNuevoGrupo,
            idInscripcion: idInscripcion,
            grupoActual: this.grupo.id,
        }
        this._grupoService.cambioGrupo(json).then(
            (result: JsonResponse) => {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('Datos actualizados'), 'OK', {
                        duration: 5000,
                    });
                    this.getInscripciones();
                } else {
                    this._matSnackBar.open(result.message, 'OK', { duration: 5000 });
                    this._grupoService.cargando = false;
                }
            }
        );
    }

    compare(a,b){
        return (a.primerApellido+a.segundoApellido+a.nombre).localeCompare((b.primerApellido+b.segundoApellido+b.nombre))
    }

    imageChangedEvent: any = '';
    croppedImage: any = '';

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }

    imprimirKarddexAlumno(alumno) {
        this._grupoService.imprimirPDFConFiltros('/api/v1/kardex-alumno/pdf', {codigoAlumno: alumno.codigo});

        this._matSnackBar.openFromComponent(IconSnackBarComponent, {
            data: {
                message: 'Descargando...',
                icon: 'cloud_download',
            },
            duration: 1 * 1000, horizontalPosition: 'right'
        });
    }

    onCambioProfesor(){
        const dialogRef = this.dialog.open(CambioProfesorTitularComponent, {
            width: '1000px',
            data: {
                profesorTitular: this.form.get('empleado').value,
                categoriaTitular: this.form.get('categoriaProfesor').value,
                sueldoTitular: this.form.get('sueldoProfesor').value,
                profesores: this.profesores,
                cursoId: this.cursoControl.value.id,
	            grupoId: this.grupo.id,
                permisoSueldo: this.permisoSueldo,
                fechasHabiles: this.fechasHabiles
            }
        });
        dialogRef.afterClosed().subscribe(fAceptar => {
            if (!!fAceptar) {
                let fechaInicio: moment.Moment = fAceptar.fechaInicio;
                let profesorTitular: EmpleadoComboProjection = fAceptar.profesorTitular;
                let sueldo: number = Number(fAceptar.sueldo);
                let motivo: string = fAceptar.motivo;
                let categoria: string = fAceptar.categoria;
                this.profesoresTitularesController.agregarProfesorTitular({
                    empleado: profesorTitular,
                    fechaInicio: fechaInicio.format('YYYY-MM-DD'),
                    grupoId: this.grupo.id,
                    motivo,
                    sueldo
                });
                this.form.get('categoriaProfesor').setValue(categoria);
                this.form.get('sueldoProfesor').setValue(sueldo); 
                this.nuevoProfesorTitular = profesorTitular;
            }
        });
    }

    onBorrarPersonalizado(){
        const dialogRef = this.dialog.open(CancelarGrupoComponent, {
            width: '400px',
            data: {
                fechaInicioGrupo: this.grupo.fechaInicio,
	            fechaFinGrupo: this.grupo.fechaFin
            }
        });
        dialogRef.afterClosed().subscribe(datosAceptar => {
            if (!!datosAceptar) {
                this._grupoService.cancelarGrupo(this.grupo.id,datosAceptar.fechaCancelacion);
            }
        });
    }

    getBoleta(data){
        let alumno = this.alumnos.find(item => item.codigo === data.codigo);
        alumno?.id;
        this.currentId;
        this._grupoService.imprimirPDFConFiltros('/api/v1/captura_calificaciones/boleta',{'alumnoId': alumno?.id, 'grupoId': this.currentId});
    }

    getOrdenVenta(data){
        this._grupoService.imprimirPDFConFiltros('/api/v1/punto-venta/imprimir/nota-venta',{'ordenesVentaIdsStr': String(data?.turnoId), 'sucursalId': this.grupo.sucursal.id});
    }

    copiarLiga(liga: string) {

       /* Copy the text inside the text field */
      navigator.clipboard.writeText(liga);

      /* Alert the copied text */
      alert("Liga copiada");
    }

    getDisplayedColumnsEvidencias() {
        if (this.form.disabled) {
            this.displayedColumnsEvidencias = ['nombre', 'archivo.fechaCreacion', 'archivo.creadoPor.nombreCompleto'];
        } else {
            this.displayedColumnsEvidencias = ['nombre', 'archivo.fechaCreacion', 'archivo.creadoPor.nombreCompleto', 'borrar'];
        }

        return this.displayedColumnsEvidencias;
    }

    abrirEvidenciasModal(): void {
        let dialogData: EvidenciaDialogData = {
            grupoCodigo: this.grupo?.codigo,
            onAceptar: this.aceptarEvidenciasModal.bind(this)
        };

        const dialogRef = this.dialog.open(EvidenciaDialogComponent, {
            width: '600px',
            data: dialogData,
            autoFocus: true
        });
    }

    aceptarEvidenciasModal(nombre: string, archivo: ArchivoProjection) {
        let datos: any[] = this._evidenciasService.getDatos();

        if (archivo) {
            let evidencia: ProgramaGrupoEvidencia = {
                id: this.contadorEvidencias,
                archivoId: archivo.id,
                archivo: archivo,
                nombre: nombre,
                vigente: true
            };

            datos.push(evidencia);
            
            this.contadorEvidencias -= 1;
        }
        
        this._evidenciasService.setDatos(datos);
    }

    onSelectedTabChange(event: MatTabChangeEvent){
        if(event.tab.textLabel == 'Calificaciones y Asistencias'){
            if(this.tipoTabla == 'grades'){
                this.actualizaStickyTablaCalificaciones();
            }
        }
    }

    actualizaStickyTablaCalificaciones(){
        let table: MatTable<any> = this.childTabCalificacionesComponent.tables.first;
        table.updateStickyColumnStyles();
        table.updateStickyHeaderRowStyles();
    }

    confirmarCancelarProfesorSustituto(clase: ProgramaGrupoListadoClaseEditarProjection, obj: ListadoClases){
        if(!!clase.id){
            const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                width: '400px',
                data: {
                    mensaje: 'La sustitución del día ' + moment(clase.fecha).format('DD/MM/YYYY') +' será cancelada'
                }
            });
    
            dialogRef.afterClosed().subscribe(confirm => {
                if (confirm) {
                    this.cancelarProfesorSustituto(clase.id,obj);
                }
            });
        }else{
            let indexBorrar: number = this.listadoClasesProfesores.value.findIndex((claseComparar: ProgramaGrupoListadoClaseEditarProjection) => {
                return claseComparar.fecha == clase.fecha;
            });
            this.listadoClasesProfesores.removeAt(indexBorrar);
            this.profesoresTitularesController.setProfesoresSuplentes(this.listadoClasesProfesores.value);
        }
    }

    cancelarProfesorSustituto(programaGrupoListadoClaseId: number, obj: ListadoClases){
        this._grupoService.cancelarProfesorSustituto(programaGrupoListadoClaseId).then(
            ((result: JsonResponse) => {
                if (result.status == 200) {
                    this.profesoresTitularesController.profesoresSuplentesMap[obj.soloFecha] = null;
                    this.activarEdicion = true;
                    this._grupoService.getDatos();
                } else {
                    this._grupoService.cargando = false;
                }
            }).bind(this)
        );
    }
}

export interface ListadoClases {
    numeroClase: number;
    fechaClase: string;
    soloFecha: string;
    fechaHarcodeada: string;
    profesor: string;
    estatus: string;
    historial: any[];
}