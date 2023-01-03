import { Component, HostListener, ViewChild } from '@angular/core';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FormControl, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { InscripcionesService } from './inscripciones.service';
import { FichasDataService } from '@services/fichas-data.service';
import * as moment from 'moment';
import { ListadoFiltradoSidebarComponent } from '@pixvs/componentes/fichas/ficha-listado/sidebars/main/listado-filtrado-sidebar.component';
import { ArchivoProjection } from '@models/archivo';
import { JsonResponse } from '@models/json-response';

@Component({
    selector: 'inscripciones',
    templateUrl: './inscripciones.component.html',
    styleUrls: ['./inscripciones.component.scss']
})
export class InscripcionesComponent {
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean { return !this.isLoading; }

    @ViewChild('filtrado') ficha: ListadoFiltradoSidebarComponent;

    private _unsubscribeAll: Subject<any>;
    regConfig: FieldConfig[];
    isLoading: boolean = false;

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "book",
        columnaId: 'inscripcionId',
        rutaDestino: null,
        ocultarBotonNuevo: true,
        ocultarBotonRefrescar: true,
        columns: [
            { name: 'sedeInscripcion', title: 'Sede Inscripción', class: "mat-column-160", centrado: false, type: null },
            { name: 'fechaInscripcion', title: 'Fecha Inscripción', class: "mat-column-160", centrado: false, type: 'fecha' },
            { name: 'notaVenta', title: 'Nota de Venta', class: "mat-column-160", centrado: false, type: null },
            { name: 'alumno', title: 'Alumno', class: "mat-column-flex", centrado: false, type: null },
            { name: 'grupo', title: 'Grupo', class: "mat-column-160", centrado: false, type: null },
            { name: 'total', title: 'Total', class: "mat-column-100", centrado: false, type: 'money' },
            { name: 'acciones', title: 'Acciones', class: "mat-column-80", centrado: false, type: 'acciones' }
        ],
        displayedColumns: ['sedeInscripcion', 'fechaInscripcion', 'notaVenta', 'alumno', 'grupo', 'total', 'acciones'],
        columasFechas: ['fechaInscripcion'],
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
        { title: 'Exportar a excel', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/inscripciones/xlsx' }
    ];

    mySubscription;

    constructor(
        public _reporteService: InscripcionesService,
        public _fichasDataService: FichasDataService,
        private router: Router,
        private _matSnackBar: MatSnackBar
    ) {
        this._unsubscribeAll = new Subject();
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
        if (this.mySubscription) { this.mySubscription.unsubscribe(); }
    }

    ngOnInit(): void {
        this._fichasDataService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos?.sedes) {
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
                            label: "Año",
                            name: "anio",
                            formControl: new FormControl(null),
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
                            type: "input",
                            label: "Nota de Venta",
                            inputType: "text",
                            name: "notaVenta",
                            formControl: new FormControl(null),
                            validations: [{ "name": "maxlength", "validator": Validators.maxLength(15), "message": "Máximo 15 caracteres" }]
                        },
                        {
                            type: "input",
                            label: "Alumno",
                            inputType: "text",
                            name: "alumno",
                            formControl: new FormControl(null),
                            validations: [{ "name": "maxlength", "validator": Validators.maxLength(100), "message": "Máximo 100 caracteres" }]
                        },
                        {
                            type: "pixvsMatSelect",
                            label: "Estatus",
                            name: "estatus",
                            formControl: new FormControl(null),
                            validations: [],
                            multiple: true,
                            selectAll: true,
                            list: datos?.estatus,
                            campoValor: 'valor',
                        }
                    ];
                }
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

        this._reporteService.onFechaChange.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            if (!!data?.fechas) {
                if (data?.fechas.length == 0) {
                    this._matSnackBar.open('No hay fechas para el año y modalidad seleccionados.', 'OK', { duration: 5000, });
                } else {
                    this.updateFechas(data.fechas.map(item => { return { id: moment(item).format('DDMMYYYY'), fecha: moment(item).format('DD/MM/YYYY') }; }));
                }
            }
        });
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

        this.updateFilters(3, "fechas", field);
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
        if (archivosDescargar.id != 4) {
            this._fichasDataService.cargando = true;

            this._reporteService.imprimirArchivo(id, archivosDescargar.id).then(
                function (result: JsonResponse) {
                    this._fichasDataService.cargando = false;
                }.bind(this)
            );
        } else {
            // window.open(archivosDescargar.rutaFisica, "_blank");
            navigator.clipboard.writeText(archivosDescargar.rutaFisica);
            alert("Liga copiada: " + archivosDescargar.rutaFisica);
        }
    }
}