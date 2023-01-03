import { Component, HostListener } from '@angular/core';
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

@Component({
    selector: 'reporte-listado',
    templateUrl: './reporte-listado.component.html',
    styleUrls: ['./reporte-listado.component.scss']
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
        columnaId: 'Grupo',
        rutaDestino: null,
        ocultarBotonNuevo: true,
        columns: [
            { name: "sede", title: "Sede", class: "mat-column-240", centrado: false, type: null, tooltip: true },
            { name: "inscripciones", title: "Inscripciones", class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: "ingresos", title: "Ingresos", class: "mat-column-flex", centrado: false, type: 'money', tooltip: true },
            { name: "meta", title: "Meta", class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: "avance", title: "% Avance", class: "mat-column-flex", centrado: false, type: null, tooltip: true }
        ],
        displayedColumns: ['sede', 'inscripciones', 'ingresos', 'meta', 'avance'],
        columasFechas: [],
        listadoMenuOpciones: [],
        listadoAcciones: []

    };

    opciones: ListadoMenuOpciones[] = [
        { title: 'Descargar Reporte', icon: 'play_for_work', tipo: FichaListadoConfig.EXCEL, url: "/api/v1/avance-inscripciones/exportar/xlsx" }
    ];

    sedes: any[] = [];
    programaciones: any[] = [];
    ciclos: any[] = [];
    modalidades: any[] = [];
    fechas: any[] = [];

    subscripcionesFiltros: Subject<any>;

    mySubscription;
    constructor(public _reporteGrupoService: ReporteGrupoService,
        public _fichasDataService: FichasDataService,
        private router: Router,
        private _matSnackBar: MatSnackBar
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
                            multiple: false,
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
                            multiple: false,
                            selectAll: false,
                            list: [],
                            campoValor: 'fecha'
                        }
                    ];
                }
            });

        var sede = null;
        var anio = new Date().getFullYear();
        var modalidad = null;

        let regSede = this.regConfig.find(item => item.name == 'sede');
    
        regSede.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            this.updateFechas([]);

            sede = regSede.formControl.value;

            if (anio && modalidad && sede && sede.length) {
                var json = {
                    anio: anio,
                    modalidad: modalidad,
                    sede: sede
                };

                this._reporteGrupoService.getFechas(json);
            }
        });

        let regAnio = this.regConfig.find(item => item.name == 'anio');

        regAnio.formControl.setValue(anio);

        regAnio.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            this.updateFechas([]);

            anio = regAnio.formControl.value;

            if (anio && modalidad && sede && sede.length) {
                var json = {
                    anio: anio,
                    modalidad: modalidad,
                    sede: sede
                };

                this._reporteGrupoService.getFechas(json);
            }
        });

        let regModalidad = this.regConfig.find(item => item.name == 'modalidad');

        regModalidad.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            this.updateFechas([]);

            modalidad = regModalidad.formControl.value?.id;

            if (anio && modalidad && sede && sede.length) {
                var json = {
                    anio: anio,
                    modalidad: modalidad,
                    sede: sede
                };

                this._reporteGrupoService.getFechas(json);
            }
        });

        this._reporteGrupoService.onFechasChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
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
            multiple: false,
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
}