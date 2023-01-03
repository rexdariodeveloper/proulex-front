import { Component, OnInit, HostListener } from '@angular/core';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FormControl, Validators } from '@angular/forms';
import { Router, RoutesRecognized, ActivatedRoute, NavigationEnd } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import { ReporteGrupoService } from './reporte-listado.service';
import { HttpService } from '@services/http.service';
import { FichasDataService } from '@services/fichas-data.service';
import { JsonResponse } from '@models/json-response';
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
    //selection = new SelectionModel<any>(true, []);
    private _unsubscribeAll: Subject <any>;
    regConfig: FieldConfig[] = [];
    isLoading: boolean = false;

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "folder_open",
        columnaId: 'id',
        rutaDestino: null,
        ocultarBotonNuevo:true,
        columns: [
            { name: 'codigoGrupo', title: 'Código de Grupo', class: "mat-column-180", centrado: false, type: null },
            { name: 'grupoNombre', title: 'Grupo', class: "mat-column-220", centrado: false, type: null,tooltip: true  },
            { name: 'plantel', title: 'Plantel', class: "mat-column-220", centrado: false, type: null,tooltip: true  },
            { name: 'fechaInicio', title: 'Fecha inicio', class: "mat-column-100", centrado: false, type: 'fecha'},
            { name: 'fechaFin', title: 'Fecha fin', class: "mat-column-100", centrado: false, type: 'fecha' },
            { name: 'nivel', title: 'Nivel', class: "mat-column-40", centrado: false, type: null},
            { name: 'horario', title: 'Horario', class: "mat-column-120", centrado: true, type: null },
            { name: 'cupo', title: 'Cupo', class: "mat-column-40", centrado: false, type: null },
            { name: 'totalInscritos', title: 'Total de inscritos', class: "mat-column-80", centrado: true, type: null },
            { name: 'profesor', title: 'Profesor', class: "mat-column-280", centrado: false, type: null,tooltip: true  },
            { name: 'acciones', title: 'Acciones', class: "mat-column-40", centrado: false, type: 'acciones' }
        ],
        displayedColumns: ['codigoGrupo', 'grupoNombre', 'plantel', 'fechaInicio', 'fechaFin','nivel', 'horario', 'cupo', 'totalInscritos', 'profesor', 'acciones'],
        columasFechas: ['fechaInicio', 'fechaFin'],
        listadoMenuOpciones: [],
        listadoAcciones: [
            { title: 'Descargar Resumen', icon: 'play_for_work', tipo: 'download', url: "/api/v1/reporte-grupos/exportar/resumen/pdf/" }
        ]

    };

    opciones: ListadoMenuOpciones[] = [
        { title: 'Descargar Reporte', icon: 'play_for_work', tipo: FichaListadoConfig.EXCEL, url: "/api/v1/reporte-grupos/exportar/xlsx" },
        { title: 'Descargar Resumenes', icon: 'play_for_work', tipo: 'download_zip', url: "/api/v1/reporte-grupos/exportar/resumen/zip" }
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
    
                    this._reporteGrupoService.getFechas(json);
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
}