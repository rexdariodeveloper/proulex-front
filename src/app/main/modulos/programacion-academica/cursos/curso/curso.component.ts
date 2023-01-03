import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener, IterableDiffers, ChangeDetectorRef, AfterContentChecked, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, FormArray } from '@angular/forms';
import { Subject, ReplaySubject, Observable, merge, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { CursoService } from './curso.service';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take, startWith, map, switchMap, tap } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { Usuario } from '@models/usuario';
import { ProgramaEditarProjection, Programa, ProgramaComboProjection } from '@app/main/modelos/programa';
import { PAActividadEvaluacionComboProjection } from '@app/main/modelos/paactividad';
import { ProgramaIdiomaEditarProjection, ProgramaIdioma } from '@app/main/modelos/programa-idioma';
import { ProgramaIdiomaCertificacionEditarProjection, ProgramaIdiomaCertificacion } from '@app/main/modelos/programa-idioma-certificacion';
import { ProgramaIdiomaModalidadEditarProjection, ProgramaIdiomaModalidad } from '@app/main/modelos/programa-idioma-modalidad';
import { ProgramaIdiomaSucursalEditarProjection, ProgramaIdiomaSucursal } from '@app/main/modelos/programa-idioma-sucursal';
import { ProgramaIdiomaLibroMaterialEditarProjection, ProgramaIdiomaLibroMaterial } from '@app/main/modelos/programa-idioma-libro-material';
import { ProgramaIdiomaExamenDetalleEditarProjection } from '@app/main/modelos/programa-idioma-examen-detalle';
import { ProgramaIdiomaNivelEditarProjection } from '@app/main/modelos/programa-idioma-nivel';
import { ProgramaIdiomaExamenEditarProjection } from '@app/main/modelos/programa-idioma-examen';
import { ProgramaIdiomaLibroMaterialReglaEditarProjection } from '@app/main/modelos/programa-idioma-libro-material-regla';
import { ProgramaIdiomaExamenUnidadEditarProjection } from '@app/main/modelos/programa-idioma-examen-unidad';
import { ProgramaIdiomaExamenModalidadEditarProjection } from '@app/main/modelos/programa-idioma-examen-modalidad';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { TabuladorComboProjection } from '@app/main/modelos/tabulador';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import * as moment from 'moment';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { AddExamenComponent } from './dialogs/add-examen/add-examen.dialog';
import { AddQuizzComponent } from './dialogs/add-quizz/add-quizz.dialog';
import { AddTareaComponent } from './dialogs/add-tarea/add-tarea.dialog';
import { EditarQuizzComponent } from './dialogs/editar-quizz/editar-quizz.dialog';
import { PonderarTareasComponent } from './dialogs/ponderar-tareas/ponderar-tareas.dialog';
import { ProgramacionAcademicaComercialCursoProjection } from '@app/main/modelos/programacion-academica-comercial';
import { MatTableDataSource } from '@angular/material/table';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ProgramacionAcademicaComercialDetalleCursoProjection } from '@app/main/modelos/programacion-academica-comercial-detalle';
import CalendarDataSourceElement from 'js-year-calendar/dist/interfaces/CalendarDataSourceElement';
import { AddlibroComponent, AddlibroData } from './dialogs/add-libro/add-libro.dialog';
import { VerreglasComponent, VerreglasData } from './dialogs/ver-reglas/ver-reglas.dialog';
import { AgrupadorListadoPrecio, EnumAgrupadoresListadosPrecios } from './curso.extra';
import { CdkDrag, CdkDragDrop, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { $ } from 'protractor';
import { bound } from './functions/bound';
//import { VerificarRfcComponent, VerificarRfcData } from './dialogs/verificar-rfc/verificar-rfc.dialog';

const speed = 10;

@Component({
    selector: 'curso',
    templateUrl: './curso.component.html',
    styleUrls: ['./curso.component.scss'],
    animations: [fuseAnimations],
    encapsulation: ViewEncapsulation.None
})
export class CursoComponent implements ComponentCanDeactivate {

    @ViewChild('scrollEl')
    scrollEl:ElementRef<HTMLElement>;

    @ViewChildren(CdkDrag)
    dragEls:QueryList<CdkDrag>;

    subs = new Subscription();

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	CMM_CXPP_FormaPago = ControlesMaestrosMultiples.CMM_CXPP_FormaPago;

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    curso: ProgramaIdiomaEditarProjection;
    form: FormGroup;

    idiomaProgramaCertificacionForm: FormArray;
    idiomaProgramaCertificacion: ProgramaIdiomaCertificacionEditarProjection;

    idiomaProgramaExamenModalidadForm: FormArray;
    idiomaProgramaExamenUnidadForm: FormArray;

    idiomaProgramaLibroMaterialForm: FormArray;
    idiomaProgramaLibroMaterial: ProgramaIdiomaLibroMaterialEditarProjection;

    idiomaProgramaModalidadForm: FormArray;
    idiomaProgramaLibroModalidad: ProgramaIdiomaLibroMaterialEditarProjection;

    idiomaProgramaSucursalForm: FormArray;
    idiomaProgramaLibroSucursal: ProgramaIdiomaLibroMaterialEditarProjection;

    idiomaNivelesForm: FormArray;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */
    idiomas : ControlMaestroMultipleComboProjection[];
    modalidadesDatos: PAModalidadComboProjection[];
    unidadesMedidas: UnidadMedidaComboProjection[];
    articulos: ArticuloComboProjection[];
    sucursales: SucursalComboProjection[];
    programas: ProgramaComboProjection[];
    test: PAActividadEvaluacionComboProjection[];
    testFormat: ControlMaestroMultipleComboProjection[];
    plataformas: ControlMaestroMultipleComboProjection[];
    certificaciones: ArticuloComboProjection[];
    examenes: ArticuloComboProjection[];
    carreras: ControlMaestroMultipleComboProjection[];
    objetosImpuestoSAT: ControlMaestroMultipleComboProjection[];
    activoControl: FormControl = new FormControl();
	@ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;
    @ViewChild('nivelInicialSelect') nivelInicialSelect: PixvsMatSelectComponent;
    @ViewChild('nivelFinalSelect') nivelFinalSelect: PixvsMatSelectComponent;
    @ViewChild('certificacionSelect') certificacionSelect: PixvsMatSelectComponent;

    idiomaControl: FormControl = new FormControl();

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;

    public patternRFC = { 'A': { pattern: new RegExp('^[a-z0-9]$') } };

    fechaActual = moment(new Date()).format('YYYY-MM-DD');


    sucursalesChipsArray: string[] = [];
    sucursalesSelected: string[] = [];

    modalidadControl: FormControl = new FormControl();
    examenModalidadControl: FormControl = new FormControl();
    sucursalControl: FormControl = new FormControl();
    programaControl: FormControl = new FormControl();
    plataformaControl: FormControl = new FormControl();
    nivelInicialControl: FormControl = new FormControl();
    nivelFinalControl: FormControl = new FormControl();
    objetoImpuestoControl: FormControl = new FormControl();
    //tabuladorControl: FormControl = new FormControl();

    certificacionNivel: string = '';
    certificacionNombre: string = '';
    certificacionPrecio: number = 0;

    nivelDesde: number = 1;
    nivelHasta: number = 0;
    nivelMinimo: number = 0;
    nivelesComboArray = [];

    displayedColumns: string[] = ['nivel', 'certificacion', 'borrar'];
    displayedColumnsArticulo: string[] = ['nivel', 'nombreArticulo','borrar'];
    displayedColumnsNivel: string[] = ['nivelInicial', 'nivelFinal','borrar'];
    displayedColumnsExamen: string[] = ['actividadEvaluacion.actividad', 'modalidades','test.valor','diasAplica','score','time','borrar'];

    tabNivel: number = 0;
    articuloNivel: number = 0;
    articuloControl: FormControl = new FormControl();
    certificacionControl: FormControl = new FormControl();

    tempIdiomasForm: FormArray = new FormArray([]);

    tabIndex: number;

    deshabilitarBotones: boolean = true;

    programacionAcademicaComercial: ProgramacionAcademicaComercialCursoProjection[];

    datosTablaLibro = [];
    datosTablaCertificaciones = [];

    nivelSelected: string;
    nivelIndexSelected: number;

    mostrarExamenes: boolean = false;

    @ViewChild('myPanel') myPanel: MatExpansionPanel;

    matIcon = 'keyboard_arrow_up';

    tiposCertificaciones =[
        {
            id: 0,
            nombre: 'Certificación'
        },
        {
            id: 1,
            nombre: 'Examen de ubicación'
        }
    ]

    tiposCertificacionesControl: FormControl = new FormControl({
            id: 0,
            nombre: 'Certificación'
    });

    iterableDiffer: any;

    cambioCriteriosEvaluacion: boolean = false;
    inicial: boolean = true;
    actualizarGrupos: boolean = false;

    agrupadoresListadosPrecios: AgrupadorListadoPrecio[] = [
        { id: EnumAgrupadoresListadosPrecios.MODALIDAD, nombre: 'Modalidad' },
        { id: EnumAgrupadoresListadosPrecios.MODALIDAD_Y_TIPO_GRUPO, nombre: 'Modalidad y tipo de grupo' }
    ];
    agrupadorListadosPreciosControl: FormControl = new FormControl(this.agrupadoresListadosPrecios[EnumAgrupadoresListadosPrecios.MODALIDAD],[]);

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
        public _cursoService: CursoService,
        private el: ElementRef,
        public validatorService: ValidatorService,
        private iterableDiffers: IterableDiffers,
        private cdref: ChangeDetectorRef
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.curso = new ProgramaIdiomaEditarProjection();

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.tabIndex = 0;

        this.iterableDiffer = iterableDiffers.find([]).create(null);
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
                this.curso = new ProgramaIdioma();
            }

            this.config = {
                rutaAtras: "/app/programacion-academica/cursos",
                rutaBorrar: "/api/v1/cursos/delete/",
                icono: "book"
            }

        });
        // Subscribe to update proveedor on changes
        this._cursoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos && datos.curso) {
                    this.curso = datos.curso;
                    this.titulo = this.curso.programa.codigo+this.curso.idioma.referencia;
                } else {
                    this.curso = new ProgramaIdiomaEditarProjection();
                }
                this.idiomas = datos.idiomas;
                this.modalidadesDatos = datos.modalidades;
                this.unidadesMedidas = datos.unidadesMedidas;
                this.articulos = datos.articulos;
                this.sucursales = datos.sucursales;
                this.programas = datos.programas;
                this.test = datos.test;
                this.carreras = datos.carreras;
                this.carreras.forEach(carrera =>{
                    carrera.referencia = carrera.cmmReferencia == null ? carrera.valor : (carrera.cmmReferencia.referencia + ' ' + carrera.valor)
                });
                this.testFormat = datos.testFormat;
                this.plataformas = datos.plataformas;
                this.certificaciones = datos.certificaciones;
                this.examenes = datos.examenes;
                this.objetosImpuestoSAT = datos.objetosImpuestoSAT;
                //this.tabuladores = datos.tabuladores;
                
                this.initProgramacionAcademicaComercial(datos.programacionAcademicaComercial)

                this.sucursales.forEach(sucursal =>{
                    this.sucursalesChipsArray.push(sucursal.nombre);
                });
                this.form = this.createProgramaForm();
                if (this.pageType == 'ver') {
                    this.form.disable();
                    //this.usuarioGroup.disable();
                    this.deshabilitarBotones = false;
                    this.form.get('programaNombre').setValue(this.curso.programa.codigo+' '+this.curso.idioma.valor);
                    this.form.get('codigo').setValue(this.curso.programa.codigo+this.curso.idioma.referencia);
                } else {
                    this.form.enable();
                    //this.usuarioGroup.enable();
                }

                /*if(this.curso.niveles && this.curso.niveles.length >0){
                    this.nivelDesde = this.curso.niveles[this.curso.niveles.length-1].nivelFinal;
                }*/

                this.form.get('numeroNiveles').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    this.nivelesComboArray = [];
                    for(var i=0;i<this.form.get('numeroNiveles').value;i++){
                        this.nivelesComboArray.push({
                            id:i+1,
                            nombre: 'Nivel '+(i+1)
                        });
                    }
                    this.nivelInicialSelect.setDatos(this.nivelesComboArray);
                    this.nivelFinalSelect.setDatos(this.nivelesComboArray);
                });


                this.programaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    let t=this;
                    this.form.get('programaNombre').setValue(this.programaControl?.value?.codigo+this.idiomaControl.value? this.idiomaControl.value?.valor: '');
                    this.form.get('codigo').setValue(this.programaControl?.value?.codigo+this.idiomaControl.value? this.idiomaControl.value?.referencia: '');
                    this.form.get('programaId').setValue(this.programaControl?.value.id);
                    /*this._cursoService.guardar(null, '/api/v1/cursos/existente-idioma/'+this.programaControl.value.id).then(
                        function (result: JsonResponse) {
                            if (result.status == 200) {
                            } else {
                                
                            }
                        }.bind(this)
                    );*/
                });

                this.idiomaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    this.form.get('programaNombre').setValue(this.programaControl?.value?.codigo+this.idiomaControl?.value?.valor);
                    this.form.get('codigo').setValue(this.programaControl?.value?.codigo+this.idiomaControl?.value?.referencia);
                });

                this.tiposCertificacionesControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    if(this.tiposCertificacionesControl.value.id == 0){
                        this.certificacionSelect.setDatos(this.certificaciones);
                    }else{
                        this.certificacionSelect.setDatos(this.examenes);
                    }
                });

                this.form.get('calificacionMinima').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    this.actualizarGrupos = true;
                });

                this.form.get('faltasPermitidas').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    this.actualizarGrupos = true;
                });
                

            });
        
    }

    ngAfterViewInit(){
        const onMove$ = this.dragEls.changes.pipe(
            startWith(this.dragEls)
            , map((d: QueryList<CdkDrag>) => d.toArray())
            , map(dragels => dragels.map(drag => drag.moved))
            , switchMap(obs => merge(...obs))
            , tap(this.triggerScroll)
        );

        this.subs.add(onMove$.subscribe());

        const onDown$ = this.dragEls.changes.pipe(
            startWith(this.dragEls)
            , map((d: QueryList<CdkDrag>) => d.toArray())
            , map(dragels => dragels.map(drag => drag.ended))
            , switchMap(obs => merge(...obs))
            , tap(this.cancelScroll)
        );

        this.subs.add(onDown$.subscribe());
    }

    ngAfterContentChecked() {

        this.cdref.detectChanges();

    }

    tabClick(event){
        let el = event.srcElement;
        const attr = el.attributes.getNamedItem('class');
        if (attr.value.indexOf('mat-tab-label-content') >= 0) {
          el = el.parentElement;
        }
        const tabIndex = el.id.substring(el.id.length - 1);
        if(parseInt(tabIndex) == 2){
            this.inicial = false;
        }
      }

    ngDoCheck() {
        if(this.idiomaNivelesForm.value != null){
            let changes = this.iterableDiffer.diff(this.idiomaNivelesForm.value);
            if (changes && !this.inicial) {
                this.cambioCriteriosEvaluacion = true;
            }
        }
    }

    expandPannel(expand: AbstractControl) {
        expand.setValue(!expand.value);
        // this.myPanel.expanded = !this.myPanel.expanded;
        // if(this.myPanel.expanded){
        //     this.matIcon = 'keyboard_arrow_up';
        // }else{
        //     this.matIcon = 'keyboard_arrow_down';
        // } 
     }

    createProgramaForm(): FormGroup {
       

        let modalidadesSelected = [];
        let sucursalSelected = [];
        let groups: any;
        this.idiomaProgramaCertificacionForm = new FormArray([]);
        this.idiomaNivelesForm = new FormArray([]);
        this.idiomaProgramaExamenModalidadForm = new FormArray([]);
        this.idiomaProgramaExamenUnidadForm = new FormArray([]);
        this.idiomaProgramaLibroMaterialForm = new FormArray([]);
        this.idiomaProgramaModalidadForm = new FormArray([]);
        this.idiomaProgramaSucursalForm = new FormArray([]);
        this.modalidadControl = new FormControl([], [Validators.required]);
        this.sucursalControl = new FormControl([], [Validators.required]);
        this.idiomaControl = new FormControl(this.curso.idioma, [Validators.required]);
        this.programaControl = new FormControl(this.curso.programa, [Validators.required]);
        this.plataformaControl = new FormControl(this.curso.plataforma, [Validators.required]);
        this.objetoImpuestoControl = new FormControl(this.curso.objetoImpuesto);

        if(this.curso.agruparListadosPreciosPorTipoGrupo){
            this.agrupadorListadosPreciosControl.setValue(this.agrupadoresListadosPrecios[EnumAgrupadoresListadosPrecios.MODALIDAD_Y_TIPO_GRUPO]);
        }

        if(this.curso.librosMateriales){
            this.curso.librosMateriales.forEach(libroMaterial =>{
                this.idiomaProgramaLibroMaterialForm.push(this.createIdiomaLibrosMaterialesForm(libroMaterial,this.curso));
            });
            this.datosTablaLibro = [...this.idiomaProgramaLibroMaterialForm.value];
            var group_to_values = this.datosTablaLibro.reduce(function (obj, item) {
                    if(!item.borrado){
                    obj[item.nivel] = obj[item.nivel] || [];
                    obj[item.nivel].push(item);
                    return obj;
                }
            }, {});

            groups = Object.keys(group_to_values).map(function (key) {
                return {nivel: key, articulo: group_to_values[key]};
            });
        }

        if(this.curso.certificaciones){
            this.curso.certificaciones.forEach(certificacion =>{
                this.idiomaProgramaCertificacionForm.push(this.createIdiomaCertificacionForm(certificacion,this.curso));
            });
            this.datosTablaCertificaciones = [...this.idiomaProgramaCertificacionForm.value];
        }

        if(this.curso.numeroNiveles){
            this.nivelesComboArray = [];
            for(var i=0;i<this.curso.numeroNiveles;i++){
                this.nivelesComboArray.push({
                    id:i+1,
                    nombre: 'Nivel '+(i+1)
                });
            }
        }
        if(this.curso.niveles && this.curso.niveles.length > 0){
            this.curso.niveles.forEach(nivel =>{
                // Ordenes
                nivel.examenes.sort((a,b) => {
                    if (a.orden > b.orden) 
                        return 1;
                    
                    if (a.orden < b.orden) 
                        return -1;
                    
                    // a must be equal to b
                    return 0;
                });

                this.idiomaNivelesForm.push(this.createNivelFormArray(nivel,this.curso.id));
            });
            this.nivelSelected = 'Desde '+this.curso.niveles[0].nivelInicial+' Hasta '+this.curso.niveles[0].nivelFinal;
            this.nivelIndexSelected = 0;
            this.mostrarExamenes = true;
        }/*
        if(this.curso.examenes){
            this.curso.examenes.forEach(examen =>{
                this.idiomaProgramaExamenForm.push(this.createIdiomaExamenForm(examen,this.curso));
            });
        }*/
        /*if(this.curso.librosMateriales){
            this.curso.librosMateriales.forEach(libroMaterial =>{
                this.idiomaProgramaLibroMaterialForm.push(this.createIdiomaLibrosMaterialesForm(libroMaterial,this.curso));
            });
            this.datosTablaLibro = [...this.idiomaProgramaLibroMaterialForm.value];
        }*/

        if(this.curso.modalidades){
            this.curso.modalidades.forEach(modalidad =>{
                this.idiomaProgramaModalidadForm.push(this.createIdiomaModalidadForm(modalidad,this.curso,null));
                modalidadesSelected.push(modalidad.modalidad);
            });
            this.modalidadControl = new FormControl(modalidadesSelected, [Validators.required]);
        }

        if(this.curso.sucursales){
            this.curso.sucursales.forEach(sucursal =>{
               this.idiomaProgramaSucursalForm.push(this.createIdiomaSucursalForm(sucursal,this.curso,null));
                sucursalSelected.push(sucursal.sucursal);
            });
            this.sucursalControl = new FormControl(sucursalSelected, [Validators.required]);
        }

        this.idiomaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(idioma => {
            this.setFiltrosProgramacionAcademicaComercial(idioma?.id,this.programaControl?.value?.id);
        });
        this.programaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(programa => {
            this.setFiltrosProgramacionAcademicaComercial(this.idiomaControl?.value?.id,programa?.id);
        });

        let form: FormGroup = this._formBuilder.group({
            id: [this.curso.id],
            programaId: new FormControl(this.curso.programaId),
            programa: this.programaControl,
            programaNombre: new FormControl(null),
            codigo: new FormControl(null),
            horasTotales: new FormControl(this.curso.horasTotales, [Validators.required]),
            idioma: this.idiomaControl,
            modalidadesControl: this.modalidadControl,
            modalidades: this.idiomaProgramaModalidadForm,
            numeroNiveles: new FormControl(this.curso.numeroNiveles, [Validators.required]),
            mcer: new FormControl(this.curso.mcer, [Validators.required]),
            unidadMedida: new FormControl(this.curso.unidadMedida, [Validators.required]),
            calificacionMinima: new FormControl(this.curso.calificacionMinima, [Validators.required]),
            clave: new FormControl(this.curso.clave, [Validators.required]),
            descripcion: new FormControl(this.curso.descripcion, [Validators.required]),
            activo: new FormControl(this.curso.activo ? this.curso.activo : false),
            examenEvaluacion: new FormControl(this.curso.examenEvaluacion ? this.curso.examenEvaluacion : false),
            certificaciones: this.idiomaProgramaCertificacionForm,
            niveles: this.idiomaNivelesForm,
            //examenes: this.idiomaProgramaExamenForm,
            librosMaterialesTemp: new FormControl(groups),
            librosMateriales: this.idiomaProgramaLibroMaterialForm,
            sucursales: this.idiomaProgramaSucursalForm,
            sucursalesControl: this.sucursalControl,
            botonAgregarCertificacion: null,
            articuloControl: null, 
            certificacionControl: null,
            plataforma: this.plataformaControl,
            iva: new FormControl(this.curso.iva, [Validators.required]),
            ivaExento: new FormControl(this.curso.ivaExento),
            ieps: new FormControl(this.curso.ieps, [Validators.required]),
            cuotaFija: new FormControl(this.curso.cuotaFija),
            faltasPermitidas: new FormControl(this.curso.faltasPermitidas, [Validators.required]),
            objetoImpuesto: this.objetoImpuestoControl,
            agrupadorListadosPrecios: this.agrupadorListadosPreciosControl
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }


    createIdiomaCertificacionForm(certificacion: ProgramaIdiomaCertificacionEditarProjection, idioma: ProgramaIdiomaEditarProjection): FormGroup {
        certificacion = certificacion ? certificacion : new ProgramaIdiomaCertificacionEditarProjection;

        let form: FormGroup = this._formBuilder.group({
            id: [certificacion.id],
            programaIdiomaId: new FormControl(idioma.id),
            nivel: new FormControl(certificacion.nivel),
            certificacion: new FormControl(certificacion.certificacion),
            precio: new FormControl(certificacion.precio),
            borrado: new FormControl(certificacion.borrado != null ? certificacion.borrado : false)
        })

        return form;
    }

    createIdiomaLibrosMaterialesForm(libroMaterial: ProgramaIdiomaLibroMaterialEditarProjection, idioma: ProgramaIdiomaEditarProjection): FormGroup {
        libroMaterial = libroMaterial ? libroMaterial : new ProgramaIdiomaLibroMaterialEditarProjection;
        let reglasArray = new FormArray([]);
        if(libroMaterial.reglas){
            libroMaterial.reglas.forEach(regla =>{
                reglasArray.push(this.createIdiomaLibrosMaterialesReglaForm(regla,libroMaterial))
            });
        }

        let form: FormGroup = this._formBuilder.group({
            id: [libroMaterial.id],
            programaIdiomaId: new FormControl(idioma.id),
            nivel: new FormControl(libroMaterial.nivel),
            articulo: new FormControl(libroMaterial.articulo),
            borrado: new FormControl(libroMaterial.borrado != null ? libroMaterial.borrado : false),
            reglas: reglasArray
        })
        return form;
    }

    createIdiomaLibrosMaterialesReglaForm(libroMaterialRegla: ProgramaIdiomaLibroMaterialReglaEditarProjection, libroMaterial: ProgramaIdiomaLibroMaterialEditarProjection): FormGroup {
        libroMaterialRegla = libroMaterialRegla ? libroMaterialRegla : new ProgramaIdiomaLibroMaterialReglaEditarProjection;
        
        
        let form: FormGroup = this._formBuilder.group({
            id: [libroMaterialRegla.id],
            programaLibroMateriallId: new FormControl(libroMaterial.id),
            carrera: new FormControl(libroMaterialRegla.carrera),
            borrado: new FormControl(false),
        })
        return form;
    }

    createIdiomaModalidadForm(modalidad: ProgramaIdiomaModalidadEditarProjection, idioma: ProgramaIdiomaEditarProjection, modalidadCMM: PAModalidadComboProjection): FormGroup {
        modalidad = modalidad ? modalidad : new ProgramaIdiomaModalidadEditarProjection;

        let form: FormGroup = this._formBuilder.group({
            id: null,
            programaIdiomaId: new FormControl(idioma.id),
            modalidad: new FormControl(modalidad.modalidad ? modalidad.modalidad : modalidadCMM)
        })

        return form;
    }

    createIdiomaSucursalForm(sucursal: ProgramaIdiomaSucursalEditarProjection, idioma: ProgramaIdiomaEditarProjection, sucursalEdit: SucursalComboProjection): FormGroup {
        sucursal = sucursal ? sucursal : new ProgramaIdiomaSucursalEditarProjection;

        let form: FormGroup = this._formBuilder.group({
            id: [sucursal.id],
            programaIdiomaId: new FormControl(idioma.id),
            sucursal: new FormControl(sucursal.sucursal ? sucursal.sucursal: sucursalEdit)
        })

        return form;
    }



    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        this.subs.unsubscribe();
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
        if(this.actualizarGrupos){
            const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                    width: '400px',
                    data: {
                        mensaje: this.translate.instant('¿Quieres actualizar los grupos activos?')
                    }
                });

                dialogRef.afterClosed().subscribe(confirm => {
                    if (confirm) {
                        this.form.addControl("actualizarGrupos",new FormControl(true));
                    }else{
                        this.form.addControl("actualizarGrupos",new FormControl(false));
                    }

                    if(this.cambioCriteriosEvaluacion){
                        this.avisoCriteriosEvaluacion();
                    }else{
                        this.guardar();    
                    }
                    
                });
            }else{
                this.guardar();
            }
    }

    avisoCriteriosEvaluacion(){
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: this.translate.instant('Los criterios de evaluación han cambiado, los grupos asociados a este programa serán actualizados')
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if(confirm){
                this.guardar();    
            }
            
        });
    }

    guardar() {
        if (this.croppedImage) {
            this.form.get('img64').setValue(this.croppedImage);
        }

        let scoreSuperado = false;
        /*for(var i=0;i<this.form.get('examenes').value.length;i++){
            let score = this.getTotalScore(this.form.get('examenes').value[i].titulo);
            if(score > 100){
                this._matSnackBar.open(this.translate.instant('El score en el test '+this.form.get('examenes').value[i].titulo+' supero el número 100'), 'OK', {
                    duration: 5000,
                });
                scoreSuperado = true;
                break;
            }
        }*/

        if(!scoreSuperado){
            /*this.form.get('examenes').value.forEach(examen =>{
                let score = this.getTotalScore(examen.titulo);
                if(score > 100){
                    this._matSnackBar.open(this.translate.instant('El score en el test '+examen.titulo+' supero el número 100'), 'OK', {
                        duration: 5000,
                    });
                    
                }
            });*/
            
            let idiomaProgramaModalidadForm = new FormArray([]);
            this.form.get('modalidadesControl').value.forEach(modalidad =>{
                idiomaProgramaModalidadForm.push(this.createIdiomaModalidadForm(null,this.form.value,modalidad));
            });
            (this.form as FormGroup).removeControl('modalidades');
            (this.form as FormGroup).addControl('modalidades',idiomaProgramaModalidadForm);

            let idiomaProgramaSucursalForm = new FormArray([]);
            this.form.get('sucursalesControl').value.forEach(sucursal =>{
               idiomaProgramaSucursalForm.push(this.createIdiomaSucursalForm(null,this.form.value,sucursal));
            });
            (this.form as FormGroup).removeControl('sucursales');
            (this.form as FormGroup).addControl('sucursales',idiomaProgramaSucursalForm);

            if (this.form.valid) {
                this._cursoService.cargando = true;

        		this.form.disable();
                let formRaw: any = this.form.getRawValue();
                if(this.agrupadorListadosPreciosControl.value.id == EnumAgrupadoresListadosPrecios.MODALIDAD_Y_TIPO_GRUPO){
                    formRaw.agruparListadosPreciosPorTipoGrupo = true;
                }else{
                    formRaw.agruparListadosPreciosPorTipoGrupo = false;
                }
                this._cursoService.guardar(JSON.stringify(formRaw), '/api/v1/cursos/save').then(
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

                for (const key of Object.keys(this.form.controls)) {
                    if (this.form.controls[key].invalid) {
                        const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                        if (invalidControl) {                          
                            invalidControl.focus();
                            break;
                        }

                    }
                }

                this._cursoService.cargando = false;
                this.form.enable();

                this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                    duration: 5000,
                });

            }
        }

    }


    addCertificacion(form: FormGroup ){
        if(!form.get('numeroNiveles')?.value && this.tiposCertificacionesControl.value.nombre != 'Examen de ubicación'){
            this._matSnackBar.open(this.translate.instant('Selecciona un nivel antes de agregar un libro'), 'OK', {
                duration: 5000,
            });
        }
        else if(form.get('numeroNiveles')?.value < Number(this.certificacionNivel) && this.tiposCertificacionesControl.value.nombre != 'Examen de ubicación'){
            this._matSnackBar.open(this.translate.instant('Selecciona un nivel menor al nivel máximo'), 'OK', {
                duration: 5000,
            });
        }
        else if( (this.certificacionNivel == '' && this.tiposCertificacionesControl.value.nombre != 'Examen de ubicación') || !this.certificacionControl ){
            this._matSnackBar.open(this.translate.instant('Datos faltantes'), 'OK', {
                duration: 5000,
            });
        }
        else{
            let certificacion : ProgramaIdiomaCertificacionEditarProjection = new ProgramaIdiomaCertificacionEditarProjection();    
            let certificacionArray: ProgramaIdiomaCertificacionEditarProjection[] = form.get('certificaciones').value   ;
            this.idiomaProgramaCertificacionForm = new FormArray([]);
            certificacion.nivel = this.certificacionNivel;
            certificacion.certificacion = this.certificacionControl.value;
            certificacion.precio = 0;
            certificacionArray.push(certificacion);
            certificacionArray.forEach(cert =>{
                this.idiomaProgramaCertificacionForm.push(this.createIdiomaCertificacionForm(cert,form.getRawValue()));
            });
            form.removeControl('certificaciones');
            form.addControl('certificaciones',this.idiomaProgramaCertificacionForm);
            this.datosTablaCertificaciones = [...this.idiomaProgramaCertificacionForm.value];
            this.certificacionNivel = '';
            this.certificacionNombre = '';
            this.certificacionPrecio = 0;
            this.certificacionControl.reset();
        }
        
    }

    borrarCertificacion(index: number){
        (this.form.get('certificaciones') as FormArray).controls[index].get('borrado').setValue(true);
        this.datosTablaCertificaciones = [...this.idiomaProgramaCertificacionForm.value];  
    }

    addLibros(form: FormArray, formIdioma){
        this.idiomaProgramaLibroMaterialForm = new FormArray([]);
        let articulosArray: ProgramaIdiomaLibroMaterialEditarProjection[] = this.form.get('librosMateriales').value ;
        form.controls.forEach(libro =>{
            let libroGuardar = libro.value;
            let articulo : ProgramaIdiomaLibroMaterialEditarProjection = new ProgramaIdiomaLibroMaterialEditarProjection();
            articulo.articulo = libroGuardar.articulo;
            articulo.nivel = libroGuardar.nivel;
            articulo.reglas = libroGuardar.reglas;
            articulosArray.push(articulo);
        });
        articulosArray.forEach(libro =>{
            this.idiomaProgramaLibroMaterialForm.push(this.createIdiomaLibrosMaterialesForm(libro,this.form.getRawValue()));
        });
        this.form.removeControl('librosMateriales');
        this.form.addControl('librosMateriales',this.idiomaProgramaLibroMaterialForm);
        this.datosTablaLibro = [...this.idiomaProgramaLibroMaterialForm.value];
        var group_to_values = this.datosTablaLibro.reduce(function (obj, item) {
            obj[item.nivel] = obj[item.nivel] || [];
            if(!item.borrado){
                obj[item.nivel].push(item);
            }
            return obj;
        }, {});
        let groups: any;
        groups = Object.keys(group_to_values).map(function (key) {
            return {nivel: key, articulo: group_to_values[key]};  
        });
        groups.forEach(grupo =>{
            if(grupo.articulo.length == 0){
                grupo['borrado'] = true;
            }
        });
        this.form.removeControl('librosMaterialesTemp');
        this.form.addControl('librosMaterialesTemp',new FormControl(groups));
        
    }

    borrarLibro(form: FormGroup, nivel: number){
        (form.get('librosMateriales') as FormArray).controls.forEach(libro =>{
            if(libro.get('nivel').value == nivel){
                libro.get('borrado').setValue(true)
            }
        });
        var group_to_values = (form.get('librosMateriales') as FormArray).value.reduce(function (obj, item) {
                if(!item.borrado){
                    obj[item.nivel] = obj[item.nivel] || [];
                    obj[item.nivel].push(item);
                }
                return obj;
            
        }, {});
        let groups: any;
        groups = Object.keys(group_to_values).map(function (key) {
            return {nivel: key, articulo: group_to_values[key]};
        });
        form.removeControl('librosMaterialesTemp');
        form.addControl('librosMaterialesTemp',new FormControl(groups));
    }

    abrirModalAgregarLibro(formIdioma){
        this.carreras.sort(function(a, b){
            if(a.referencia < b.referencia) { return -1; }
            if(a.referencia > b.referencia) { return 1; }
            return 0;
        });
        if(formIdioma.get('numeroNiveles').value){
            const dialogRef = this.dialog.open(AddlibroComponent, {
                width: '500px',
                data: {
                    articulos: this.articulos,
                    nivel: formIdioma.get('numeroNiveles').value,
                    carreras: this.carreras
                }
            });
            dialogRef.afterClosed().subscribe(confirm => {
                if (confirm) {
                    this.addLibros(confirm, formIdioma);
                }
            });
        }else{
            this._matSnackBar.open(this.translate.instant('Selecciona un nivel de programa antes de agregar un libro'), 'OK', {
                duration: 5000,
            });
        }
        
    }

    tieneReglas(element){
        let tieneReglas = false;
        for(var i=0;i<element.articulo.length;i++){
            if(element.articulo[i].reglas && element.articulo[i].reglas.length >0 ){
                tieneReglas = true;
                break;
            }
        }

        return tieneReglas;
    }

    abrirVerReglas(element){
        const dialogRef = this.dialog.open(VerreglasComponent, {
            width: '1000px',
            data: {
                datos: element,
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
            }
        });
    }


    deshabilitarCampos(event){
        this.deshabilitarBotones = true;
    }


    addNewExamen(examen: any){
        //this.idiomaProgramaExamenForm.push(examen);
    }


    getTotalMinutos(titulo: string){
        let minutos = 0;

        this.form.get('examenes').value.forEach(examen =>{
            if(!examen.borrar && examen.titulo == titulo){
               minutos = Number(minutos) + Number(examen.time); 
            }
            
        });
        return minutos;
    }

    getTotalScore(titulo: string){
        let score = 0;
        this.form.get('examenes').value.forEach(examen =>{
            if(!examen.borrar && examen.titulo == titulo){
                score = Number(score) + Number(examen.score);
            }
        });
        return score;
    }

    borrarModal(i: number){
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: 'Al borrar el nivel se perderán todos los exámenes asociados a él.'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.borrarNivel(i);
            }
        });
    }

    borrarNivel(i: number){
        this.idiomaNivelesForm.controls[i].get("activo").setValue(false);
        this.mostrarExamenes = false;
    }

    borrarExamen(titulo: string){
        let index = this.form.get('examenes').value.findIndex(examen =>{
            return examen.titulo == titulo;
        });
        if(index > -1){
           (this.form.get('examenes') as FormArray).controls[index].get('borrar').setValue(true); 
        }

    }

    borrarExamenPorIndex(index: number){
        (this.form.get('examenes') as FormArray).controls[index].get('borrar').setValue(true);
    }

    imageChangedEvent: any = '';
    croppedImage: any = '';

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }

    dataSourceDetalles: {[programacionAcademicaComercialId:string]: MatTableDataSource<ProgramacionAcademicaComercialDetalleCursoProjection>} = {};
	displayedColumnsDetalles: string[] = [
		'modalidad',
		'programas',
		'fechaInicio',
		'fechaFin'
	];
    programacionAcademicaComercialExpansionPanelMap: {[programacionAcademicaComercialId:string]: boolean} = {};
    fechaInicioCalendarioMap: {[programacionAcademicaComercialId:string]: Date} = {};
    fechaFinCalendarioMap: {[programacionAcademicaComercialId:string]: Date} = {};
    datasourceCalendarioMap: {[programacionAcademicaComercialId:string]: CalendarDataSourceElement[]} = {};

    initProgramacionAcademicaComercial(programacionAcademicaComercial: ProgramacionAcademicaComercialCursoProjection[]){
        this.programacionAcademicaComercial = programacionAcademicaComercial;
        this.programacionAcademicaComercial?.sort((pac1,pac2) => {
            return pac1.paCiclo.fechaInicio < pac2.paCiclo.fechaInicio ? 1 : -1;
        });

        this.programacionAcademicaComercial?.forEach(pac => {
            this.dataSourceDetalles[pac.id] = new MatTableDataSource(pac.detalles);
            this.dataSourceDetalles[pac.id].filterPredicate = this.filtrarDatasourceDetalles.bind(this);
            this.fechaInicioCalendarioMap[pac.id] = new Date(pac.paCiclo.fechaInicio);
            this.fechaFinCalendarioMap[pac.id] = new Date(pac.paCiclo.fechaFin);
            this.datasourceCalendarioMap[pac.id] = pac.detalles.map(detalle => {
                return {
                    startDate: new Date(detalle.fechaInicio),
                    endDate: new Date(detalle.fechaInicio),
                    color: detalle.paModalidad.color
                };
            });
        });
    }

    filtrarDatasourceDetalles(detalle: ProgramacionAcademicaComercialDetalleCursoProjection, filtro: string): boolean{
		let filtrosArr: string[] = (filtro || '|').split('|');
        if(!filtrosArr.length){
            return false;
        }

		let idiomaFiltrarId: Number = !!filtrosArr[0] ? Number(filtrosArr[0]) : null;
		let programaFiltrarId: Number = !!filtrosArr[1] ? Number(filtrosArr[1]) : null;
        
		if(detalle.idioma.id != idiomaFiltrarId){
            return false;
		}
		if(programaFiltrarId){
            let programaIncluido: boolean = false;
			for(let programa of detalle.programas){
                if(programa.id == programaFiltrarId){
                    programaIncluido = true;
					break;
				}
			}
			if(!programaIncluido){
                return false;
			}
		}

		return true;
	}

    setFiltrosProgramacionAcademicaComercial(idiomaId: number, programaId: number){
        let idiomaIdStr: string = '';
        let programaIdStr: string = '';
        if(!!idiomaId){
            idiomaIdStr = String(idiomaId);
        }
        if(!!programaId){
            programaIdStr = String(programaId);
        }
        this.programacionAcademicaComercial?.forEach(pac => {
            this.dataSourceDetalles[pac.id].filter = idiomaIdStr + '|' + programaIdStr;
        });
    }

    setExpansionPanelProgramacionOpened(programacion: ProgramacionAcademicaComercialCursoProjection){
        this.programacionAcademicaComercialExpansionPanelMap[programacion.id] = true;
    }

    setExpansionPanelProgramacionClosed(programacion: ProgramacionAcademicaComercialCursoProjection){
        this.programacionAcademicaComercialExpansionPanelMap[programacion.id] = false;
    }

    createNivelFormArray(nivel: ProgramaIdiomaNivelEditarProjection, idCurso: number){
        let examenArray = new FormArray([]);
        if(nivel.examenes){
            nivel.examenes.forEach(examen =>{
                examenArray.push(this.createExamenFormArray(examen));
            });
        }

        let form: FormGroup = this._formBuilder.group({
            id: [nivel.id],
            programaIdiomaId: new FormControl(nivel.programaIdiomaId),
            nivelInicial: new FormControl(nivel.nivelInicial),
            nivelFinal: new FormControl(nivel.nivelFinal),
            activo: new FormControl(nivel.activo),
            examenes: examenArray
        });
        return form;
    }

    createExamenFormArray(examen: ProgramaIdiomaExamenEditarProjection){
        let detallesFormArray = new FormArray([]);
        if(examen.detalles){
            examen.detalles.forEach(detalle =>{
                detallesFormArray.push(this.createExamenDetalleArray(detalle));
            });
        }

        let form: FormGroup = this._formBuilder.group({
            id: [examen.id],
            programaIdiomaNivelId: new FormControl(examen.programaIdiomaNivelId),
            nombre: new FormControl(examen.nombre),
            porcentaje: new FormControl(examen.porcentaje),
            activo: new FormControl(examen.activo),
            orden: new FormControl(examen.orden),
            expand: new FormControl(true),
            detalles: detallesFormArray
        });
        return form;
    }

    createExamenDetalleArray(detalle: ProgramaIdiomaExamenDetalleEditarProjection){
        let modalidadesArray = new FormArray([]);
        if(detalle.modalidades){
            detalle.modalidades.forEach(modalidad =>{
                modalidadesArray.push(this.createModalidadesForm(modalidad));
            });
        }
        let unidadesFormArray = new FormArray([]);
        if(detalle.unidades){
            detalle.unidades.forEach(unidad =>{
                unidadesFormArray.push(this.createUnidadesForm(unidad));
            });
        }

        let form: FormGroup = this._formBuilder.group({
            id: [detalle.id],
            programaIdiomaExamenId: new FormControl(detalle.programaIdiomaExamenId),
            actividadEvaluacion: new FormControl(detalle.actividadEvaluacion),
            test: new FormControl(detalle.test),
            time: new FormControl(detalle.time),
            puntaje: new FormControl(detalle.puntaje),
            continuos: new FormControl(detalle.continuos),
            activo: new FormControl(detalle.activo),
            modalidades: modalidadesArray,
            unidades: unidadesFormArray
        });
        return form;
    }

    createModalidadesForm(modalidad: ProgramaIdiomaExamenModalidadEditarProjection){
        let form: FormGroup = this._formBuilder.group({
            id: [modalidad.id],
            examenDetalleId: new FormControl(modalidad.examenDetalleId),           
            modalidad: new FormControl(modalidad.modalidad),
            dias: new FormControl(modalidad.dias, [Validators.required])
        })
        return form;
    }

    createUnidadesForm(unidad: ProgramaIdiomaExamenUnidadEditarProjection){
        let form: FormGroup = this._formBuilder.group({
            id:[unidad.id],
            examenDetalleId: new FormControl(unidad.examenDetalleId),
            libroMaterial: new FormControl(unidad.libroMaterial),
            descripcion: new FormControl(unidad.descripcion, [Validators.required])
        });
        return form;
    }

    addNivel(){
        let agregar : boolean = true;
        for(var i=0;i<this.idiomaNivelesForm.value.length;i++){
            if(this.idiomaNivelesForm.value[i].activo){
                if(this.inRange(this.nivelInicialControl.value.id,this.idiomaNivelesForm.value[i].nivelInicial,this.idiomaNivelesForm.value[i].nivelFinal) || this.inRange(this.nivelFinalControl.value.id,this.idiomaNivelesForm.value[i].nivelInicial,this.idiomaNivelesForm.value[i].nivelFinal)){                
                    agregar = false; 
                    break;
                }
            }
        }
        if(!agregar){
            this._matSnackBar.open(this.translate.instant('El nivel seleccionado ya se encuentra agregado'), 'OK', {
                duration: 5000,
            });
        }
        else if(this.nivelInicialControl.value == null || this.nivelFinalControl.value == null){
            this._matSnackBar.open(this.translate.instant('Tanto el nivel inicial y final son obligatorios'), 'OK', {
                duration: 5000,
            });
        }
        else if(this.nivelInicialControl.value.id <= this.nivelFinalControl.value.id){
            let examenesArray = new FormArray([]);
            let form: FormGroup = this._formBuilder.group({
                id: [null],
                programaIdiomaId: new FormControl(this.curso.id == null ? null :  this.curso.id),
                nivelInicial: new FormControl(this.nivelInicialControl.value.id),
                nivelFinal: new FormControl(this.nivelFinalControl.value.id),
                activo: new FormControl(true),
                examenes: examenesArray
            });
            this.idiomaNivelesForm.push(form);
            this.nivelInicialControl.reset();
            this.nivelFinalControl.reset();
        }else{
            this._matSnackBar.open(this.translate.instant('El nivel inicial debe ser menor al final'), 'OK', {
                duration: 5000,
            });
        }
    }

    selectNivel(nivel){
        this.nivelSelected = 'Desde '+nivel.nivelInicial+' Hasta '+nivel.nivelFinal;
        this.mostrarExamenes = true;
        let index = this.idiomaNivelesForm.value.findIndex(nivel =>{
            let nivelString = 'Desde '+nivel.nivelInicial+' Hasta '+nivel.nivelFinal;
            return nivelString == this.nivelSelected
        });
        this.nivelIndexSelected = index;
    }

    abrirModalNuevoQuizz(){
        let porcentajeTotal = 0, orden: number = 0;
        this.getExamenes(this.nivelIndexSelected).map((examen: FormGroup) =>{
            // Obtenemos el porcentaje total de los examenes
            porcentajeTotal = porcentajeTotal + Number(examen.controls.porcentaje.value);
            // Obtenemos el orden (ultimo)
            orden++;
        });

        const dialogRef = this.dialog.open(AddQuizzComponent, {
            width: '500px',
            data: {
                porcentajeTotal: porcentajeTotal,
                orden: orden
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                //this.guardar();
                this.agregarQuizz(confirm);
            }
        });
    }

    agregarQuizz(form: FormGroup){
        let index = this.idiomaNivelesForm.value.findIndex(nivel =>{
            let nivelString = 'Desde '+nivel.nivelInicial+' Hasta '+nivel.nivelFinal;
            return nivelString == this.nivelSelected
        });

        ((this.idiomaNivelesForm.controls[index] as FormGroup).controls.examenes as FormArray).push(form);
        //(form.controls.detalles as FormArray).push(this._formBuilder.group(this.getExamenes(index)[0].get('detalles').value[0]))
        //let examenesArray = new FormArray([]);
        //((this.idiomaNivelesForm.controls[index] as FormGroup).controls.examenes as FormArray).updateValueAndValidity();
        //examenesArray = (this.idiomaNivelesForm.controls[index].get('examenes') as FormArray);
        //examenesArray.push(form);
        //(this.idiomaNivelesForm.controls[index] as FormGroup).removeControl('examenes');
        //(this.idiomaNivelesForm.controls[index] as FormGroup).addControl('examenes',examenesArray);
    }

    abrirModalTest(examenes, indexExamen, titulo){
        let idiomaProgramaModalidadForm = new FormArray([]);
        let modalidadesEnviar = [];
        this.modalidadControl.value.forEach(moda =>{
            modalidadesEnviar.push(moda);
        });
        const uniqueObjects = [...new Map(modalidadesEnviar.map(item => [item.nombre, item])).values()];
        modalidadesEnviar = uniqueObjects;

        let articulos = [] 
        this.form.get('librosMateriales').value.forEach(item =>{
            if(item.nivel >=examenes.value.nivelInicial && item.nivel <=examenes.value.nivelFinal){
                articulos.push(item);
            }
        });

        const dialogRef = this.dialog.open(AddTareaComponent, {
            width: '1000px',
            panelClass: 'custom-dialog-container',
            data: {
                detalle: new ProgramaIdiomaExamenDetalleEditarProjection(),
                idCurso: this.curso.id,
                titulo: titulo,
                test: this.test,
                testFormat: this.testFormat,
                modalidades: modalidadesEnviar,
                unidades: articulos
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                //this.guardar();
                this.agregarTest(examenes,indexExamen,confirm);
            }
        });
    }

    onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    agregarTest(data,index,detalleAgregar){
        data.get('examenes').controls[index].get('detalles').push(detalleAgregar);
    }

    ponderarTareas(examenes){
        let examenesPonderar = [];
        examenes.forEach(examen =>{
            if(examen.activo){
                examenesPonderar.push({
                    nombre: examen.nombre,
                    porcentaje: examen.porcentaje
                });
            }
        });
        const dialogRef = this.dialog.open(PonderarTareasComponent, {
            width: '500px',
            panelClass: 'custom-dialog-container',
            data: {
                examenes: examenesPonderar
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                //this.guardar();
                this.actualizarExamenes(confirm);
            }
        });
    }

    actualizarExamenes(examenesActualizados){
        examenesActualizados.forEach(examen =>{
           let index = this.idiomaNivelesForm.controls[this.nivelIndexSelected].value.examenes.findIndex(ex =>{
               return ex.nombre == examen.nombre;
           });
           (this.idiomaNivelesForm.controls[this.nivelIndexSelected].get('examenes') as FormArray).controls[index].get('porcentaje').setValue(Number(examen.porcentaje)); 
        });
    }

    abrirModalEditarTest(examenes, indexExamen, titulo,indexDetalle){
        let idiomaProgramaModalidadForm = new FormArray([]);
        let modalidadesEnviar = [];
        this.modalidadControl.value.forEach(moda =>{
            modalidadesEnviar.push(moda);
        });
        modalidadesEnviar = modalidadesEnviar.filter(this.onlyUnique);
        const dialogRef = this.dialog.open(AddTareaComponent, {
            width: '1000px',
            panelClass: 'custom-dialog-container',
            data: {
                detalle: examenes.get('examenes').controls[indexExamen].get('detalles').controls[indexDetalle].value,
                idCurso: this.curso.id,
                titulo: titulo,
                test: this.test,
                testFormat: this.testFormat,
                modalidades: modalidadesEnviar,
                unidades: this.form.get('librosMateriales').value
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                //this.guardar();
                this.editarDetalle(examenes,indexExamen,confirm,indexDetalle);
            }
        });
    }

    editarDetalle(data,index,detalleAgregar,indexDetalle){
        (data.get('examenes').controls[index].get('detalles') as FormArray).removeAt(indexDetalle);
        data.get('examenes').controls[index].get('detalles').push(detalleAgregar);
    }

    borrarDetalle(examenes,indexExamen,indexDetalle){
        (examenes.get('examenes').controls[indexExamen].get('detalles') as FormArray).controls[indexDetalle].get('activo').setValue(false);
    }

    abrirModalEditarQuizz(nombre,porcentaje,indexExamen){
        let porcentajeTotal = 0;
        this.idiomaNivelesForm.controls[this.nivelIndexSelected].value.examenes.forEach(examen =>{
            if(examen.nombre != nombre && examen.activo){
                porcentajeTotal = porcentajeTotal + Number(examen.porcentaje);
            }
        });
        const dialogRef = this.dialog.open(EditarQuizzComponent, {
            width: '500px',
            data: {
                nombre: nombre,
                porcentaje: porcentaje,
                porcentajeTotal: porcentajeTotal
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                //this.guardar();
                this.editarExamen(confirm,indexExamen);
            }
        });
    }

    editarExamen(json,index){
         (this.idiomaNivelesForm.controls[this.nivelIndexSelected].get('examenes') as FormArray).controls[index].get('nombre').setValue(json.nombre);
         (this.idiomaNivelesForm.controls[this.nivelIndexSelected].get('examenes') as FormArray).controls[index].get('porcentaje').setValue(json.porcentaje);  
    }

    borrarExamenQuizz(index){
        var examen: FormGroup = this.getExamenes(this.nivelIndexSelected)[index] as FormGroup,
        orden:number = examen.controls.orden.value;
        examen.controls.activo.setValue(false);
        // Reordenar
        this.getExamenes(this.nivelIndexSelected).filter((e: FormGroup) => e.controls.orden.value > examen.controls.orden.value).map((e: FormGroup) => {
            e.controls.orden.setValue(orden);
            orden++;
        });
        //(this.idiomaNivelesForm.controls[this.nivelIndexSelected].get('examenes') as FormArray).controls[index].get('activo').setValue(false);
    }

    inRange(x, min, max) {
        return ((x-min)*(x-max) <= 0);
    }

    drop(event: CdkDragDrop<string[]>) {
        this.moveItemInFormArray(event.previousIndex,  event.currentIndex)
    }

    getExamenes(nivelIndexSelected: number): AbstractControl[]{
        return ((this.idiomaNivelesForm.controls[nivelIndexSelected] as FormGroup).controls.examenes as FormArray).controls.filter((examen: FormGroup) => examen.controls.activo.value == true);
    }

    getExamenesNoActivo(nivelIndexSelected: number): AbstractControl[]{
        return ((this.idiomaNivelesForm.controls[nivelIndexSelected] as FormGroup).controls.examenes as FormArray).controls.filter((examen: FormGroup) => examen.controls.activo.value == false);
    }

    moveItemInFormArray(fromIndex: number, toIndex: number): void {
        if (fromIndex == toIndex) {
            return;
        }
        const esSuperior: boolean = fromIndex < toIndex ? true : false;

        var listaExamen: any = [];
        this.getExamenes(this.nivelIndexSelected).map((examen: FormGroup) => listaExamen.push(examen.value));
        //const temp = this.getExamenes(nivelIndexSelected)[fromIndex] as FormGroup;
        let temp: any = listaExamen[fromIndex];
        temp.orden = toIndex;
        var _temp = Object.assign({}, temp);
      
        // Asignamos al superior o anterior
        for (let i = fromIndex; esSuperior ? i < toIndex : i > toIndex; esSuperior ? i++ : i--) {
            const _i: number = esSuperior ? i + 1 : i - 1;
            //const previous = this.getExamenes(nivelIndexSelected)[_i] as AbstractControl;
            let previous: any = listaExamen[_i];
            previous.orden = i;
            var _previous = Object.assign({}, previous);
            listaExamen[i] = _previous;
        }
        // Asignamos al examen el ultimo (selecciono)
        listaExamen[toIndex] = _temp;

        var _listaExamen: FormArray = new FormArray([]);
        listaExamen.map(examen => {
            _listaExamen.push(this.createExamenFormArray(examen));
        });

        this.getExamenesNoActivo(this.nivelIndexSelected).map((examen: FormGroup) => {
            _listaExamen.push(this.createExamenFormArray(examen.value));
        });

        (this.idiomaNivelesForm.controls[this.nivelIndexSelected] as FormGroup).removeControl('examenes');
        (this.idiomaNivelesForm.controls[this.nivelIndexSelected] as FormGroup).addControl('examenes', _listaExamen);
    }

    // ** DRAD y DROP **//
    private animationFrame: number | undefined;
      
    @bound
    public triggerScroll($event: CdkDragMove) {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = undefined;
        }
        this.animationFrame = requestAnimationFrame(() => this.scroll($event));
    }

    @bound
    private cancelScroll() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = undefined;
        }
    }

    private scroll($event: CdkDragMove) {
        const { y } = $event.pointerPosition;
        const baseEl = this.scrollEl.nativeElement;
        const box = baseEl.getBoundingClientRect();
        const scrollTop = baseEl.scrollTop;
        const top = box.top + - y ;
        if (top > 0 && scrollTop !== 0) {
            const newScroll = scrollTop - speed * Math.exp(top / 50);
            baseEl.scrollTop = newScroll;
            this.animationFrame = requestAnimationFrame(() => this.scroll($event));
            return;
        }

        const bottom = y - box.bottom ;
        if (bottom > 0 && scrollTop < box.bottom) {
            const newScroll = scrollTop + speed * Math.exp(bottom / 50);
            baseEl.scrollTop = newScroll;
            this.animationFrame = requestAnimationFrame(() => this.scroll($event));
        }
    }
    //////////////////////
}