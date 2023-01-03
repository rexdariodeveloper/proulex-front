import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FormControl, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { ReporteGrupoService } from './reporte-listado.service';
import { FichasDataService } from '@services/fichas-data.service';
import * as moment from 'moment';
import { ArchivoProjection } from '@models/archivo';
import { JsonResponse } from '@models/json-response';
import { DialogComponent, DialogData } from './dialogs/calificaciones-asistencias.dialog';
import { MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'reporte-listado',
    templateUrl: './reporte-listado.component.html',
    styleUrls: ['./reporte-listado.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ReporteListadoComponent {
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return !this.isLoading;
    }
    
    private _unsubscribeAll: Subject<any>;
    regConfig: FieldConfig[] = [];
    isLoading: boolean = false;

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "folder_open",
        columnaId: 'inscripcionId',
        rutaDestino: null,
        ocultarBotonNuevo: true,
        columns: [
            { name: 'alumnoCodigo', title: 'Código', class: "mat-column-100", centrado: true, type: null, tooltip: true },
            { name: 'alumno', title: 'Alumno', class: "mat-column-160", centrado: false, type: null, tooltip: true },
            { name: 'sedeInscripcion', title: 'Sede inscripción', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: 'notaVenta', title: 'Nota venta', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: 'tipoInscripcion', title: 'Tipo inscripción', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: 'sedeGrupo', title: 'Sede grupo', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: 'grupo', title: 'Código de grupo', class: "mat-column-160", centrado: true, type: null, tooltip: true },
            { name: 'fechaInicio', title: 'Fecha inicio', class: "mat-column-100", centrado: true, type: 'fecha', tooltip: true },
            { name: 'fechaFin', title: 'Fecha fin', class: "mat-column-100", centrado: true, type: 'fecha', tooltip: true },
            { name: 'estatusAlumno', title: 'Estatus', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: 'acciones', title: 'Acciones', class: "mat-column-80", centrado: false, type: 'acciones' }
        ],
        displayedColumns: ['alumnoCodigo', 'alumno', 'sedeInscripcion', 'notaVenta', 'tipoInscripcion', 'sedeGrupo', 'grupo', 'fechaInicio', 'fechaFin', 'estatusAlumno', 'acciones'],
        columasFechas: ['fechaInicio', 'fechaFin'],
        listadoMenuOpciones: [],
        listadoAcciones: [
            {
                title: 'Documentos',
                tipo: 'menu',
                icon: 'more_vert',
                ocultarBotonTodo: true,
                columnaOpcionesMenu: 'archivos',
                columnaMostrarOpcionMenu: 'nombreOriginal',
                accion: this.onDescargarArchivo.bind(this),
            }
        ]
    };

    opciones: ListadoMenuOpciones[] = [
        { title: 'Descargar Reporte', icon: 'play_for_work', tipo: FichaListadoConfig.EXCEL, url: "/api/v1/reporte-alumnos/exportar/xlsx" },
        { title: 'Reporte de asistencias', icon: 'play_for_work', tipo: 'download_zip', url: "/api/v1/reporte-alumnos/exportar/asistencias" },
        { title: 'Reporte de calificaciones', icon: 'play_for_work', tipo: 'download_zip', url: "/api/v1/reporte-alumnos/exportar/calificaciones" },
    ];

    planteles: any[] = [];
    datos: any[] = [];

    subscripcionesFiltros: Subject<any>;

    mySubscription;
    constructor(public _reporteService: ReporteGrupoService,
        public _fichasDataService: FichasDataService,
        private router: Router,
        private _matSnackBar: MatSnackBar,
        public dialog: MatDialog,
    ) {
        this._unsubscribeAll = new Subject();
        this.subscripcionesFiltros = new Subject();
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.mySubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                // Trick the Router into believing it's last link wasn't previously loaded
                this.router.navigated = false;
            }
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        if (this.mySubscription) {
            this.mySubscription.unsubscribe();
        }
        this.subscripcionesFiltros.next();
        this.subscripcionesFiltros.complete();
    }

    ngOnInit(): void {
        this._fichasDataService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos?.sedes) {
                    this.planteles = datos?.planteles || [];

                    var tiposInscripciones = [];
                    tiposInscripciones.push({ id: 1, nombre: "Local" });
                    tiposInscripciones.push({ id: 2, nombre: "Multisede envía" });
                    tiposInscripciones.push({ id: 3, nombre: "Multisede recibe" });

                    this.regConfig = [
                        {
                            type: "pixvsMatSelect",
                            label: "Sede",
                            name: "sede",
                            formControl: new FormControl(null, [Validators.required]),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: datos?.sedes,
                            campoValor: 'nombre',
                        },
                        {
                            type: "pixvsMatSelect",
                            label: "Plantel",
                            name: "plantel",
                            formControl: new FormControl(null, []),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: [],
                            campoValor: 'nombre',
                        },
                        {
                            type: "pixvsMatSelect",
                            label: "Año",
                            name: "anio",
                            formControl: new FormControl(null, [Validators.required]),
                            validations: [],
                            multiple: false,
                            selectAll: false,
                            list: datos?.anios
                        },
                        {
                            type: "pixvsMatSelect",
                            label: "Modalidad",
                            name: "modalidad",
                            formControl: new FormControl(null, [Validators.required]),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: datos?.modalidades,
                            campoValor: 'nombre',
                            values: ['codigo', 'nombre'],
                        },
                        {
                            type: "pixvsMatSelect",
                            label: "Fecha de inicio",
                            name: "fechas",
                            formControl: new FormControl(null, [Validators.required]),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: [],
                            campoValor: 'fecha'
                        },
                        {
                            type: "pixvsMatSelect",
                            label: "Tipo de inscripción",
                            name: "tiposInscripciones",
                            formControl: new FormControl(null, [Validators.required]),
                            validations: [],
                            multiple: true,
                            selectAll: true,
                            list: tiposInscripciones,
                            campoValor: 'nombre',
                        },
                        {
                            type: "input",
                            label: "Alumno",
                            inputType: "text",
                            name: "alumno",
                            formControl: new FormControl(null),
                            validations: [{ "name": "maxlength", "validator": Validators.maxLength(100), "message": "Máximo 100 caracteres" }]
                        }
                    ];
                } else {
                    this.datos = datos || [];
                }
            });

        let regSede = this.regConfig.find(item => item.name == 'sede');

        regSede.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            var sedes = regSede.formControl.value;
            var planteles = [];

            sedes.forEach(sede => {
                planteles = planteles.concat(this.planteles.filter(x => { return x.sucursalId === sede.id; }));
            });

            this.updatePlanteles(planteles);
        });

        var anio = new Date().getFullYear();
        var modalidad = null;

        let regAnio = this.regConfig.find(item => item.name == 'anio');

        regAnio.formControl.setValue(anio);

        regAnio.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            this.updateFechas([]);

            anio = regAnio.formControl.value;

            if (anio && modalidad) {
                var json = {
                    anio: anio,
                    modalidad: modalidad
                };

                this._reporteService.getFechas(json);
            }
        });

        let regModalidad = this.regConfig.find(item => item.name == 'modalidad');

        regModalidad.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            this.updateFechas([]);

            modalidad = regModalidad.formControl.value;

            if (anio && modalidad && modalidad.length) {
                var json = {
                    anio: anio,
                    modalidad: modalidad
                };

                this._reporteService.getFechas(json);
            }
        });

        this._reporteService.onFechasChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            if (!!data?.fechas) {
                if (data?.fechas.length == 0) {
                    this._matSnackBar.open('No hay fechas para el año y modalidad seleccionados.', 'OK', { duration: 5000, });
                } else {
                    this.updateFechas(data.fechas.map(item => { return { id: moment(item).format('DDMMYYYY'), fecha: moment(item).format('DD/MM/YYYY') }; }));
                }
            }
        });
    }

    updatePlanteles(planteles) {
        let field: FieldConfig = {
            type: "pixvsMatSelect",
            label: "Plantel",
            name: "plantel",
            formControl: new FormControl(null, []),
            validations: [],
            multiple: true,
            selectAll: false,
            list: planteles,
            campoValor: 'nombre',
        };

        this.updateFilters(1, "plantel", field);
    }

    updateFechas(fechas) {
        let field: FieldConfig = {
            type: "pixvsMatSelect",
            label: "Fecha de inicio",
            name: "fechas",
            formControl: new FormControl(null, [Validators.required]),
            validations: [],
            multiple: true,
            selectAll: false,
            list: fechas,
            campoValor: 'fecha'
        };

        this.updateFilters(4, "fechas", field);
    }

    updateFilters(index: number, name: string, field: FieldConfig) {
        let regIndex = this.regConfig.findIndex(item => item.name == name);

        if (regIndex != -1) {
            this.regConfig.splice(regIndex, 1);
        }

        this.regConfig.splice(index, 0, field);
        this.regConfig = [...this.regConfig];
    }

    onDescargarArchivo(archivosDescargar: ArchivoProjection, event, id) {
        if (archivosDescargar.id > 2) {
            this._fichasDataService.cargando = true;

            this._reporteService.imprimirArchivo(id, archivosDescargar.id).then(
                function (result: JsonResponse) {
                    this._fichasDataService.cargando = false;
                }.bind(this)
            );
        } else {
            this.getCalificacionesAsistencias(id, archivosDescargar.id);
        }
    }

    getCalificacionesAsistencias(inscripcionId, tipoId) {
        var registro = this.datos.find(x => x.inscripcionId === inscripcionId);

        let dialogData: DialogData = {
            registro: registro,
            mostrarAsistencias: tipoId === 1,
            mostrarCalificaciones: tipoId === 2
        };

        const dialogRef = this.dialog.open(DialogComponent, {
            width: '1000px',
            data: dialogData
        });
    }
}