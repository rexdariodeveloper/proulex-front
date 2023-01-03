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
            { name: "codigobecaudg", title: "CODIGOBECAUDG", class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: "codigoempleadoudg", title: "CODIGOEMPLEADOUDG", class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: "paterno", title: "PATERNO", class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: "materno", title: "MATERNO", class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: "nombre", title: "NOMBRE", class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: "descuentoudg", title: "DESCUENTOUDG", class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: "fechaaltabecaudg", title: "FECHAALTABECAUDG", class: "mat-column-flex", centrado: true, type: 'fecha', tooltip: true },
            { name: "codcurudg", title: "CODCURUDG", class: "mat-column-flex", centrado: false, type: null, tooltip: true },
            { name: "estatusudg", title: "ESTATUSUDG", class: "mat-column-flex", centrado: false, type: null, tooltip: true }
        ],
        displayedColumns: ['codigobecaudg', 'codigoempleadoudg', 'paterno', 'materno', 'nombre', 'descuentoudg', 'fechaaltabecaudg', 'codcurudg', 'estatusudg'],
        columasFechas: ['fechaaltabecaudg'],
        listadoMenuOpciones: [],
        listadoAcciones: []

    };

    opciones: ListadoMenuOpciones[] = [
        { title: 'Descargar Reporte', icon: 'play_for_work', tipo: FichaListadoConfig.EXCEL, url: "/api/v1/becas-sindicato/exportar/xlsx" }
    ];

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
                if (datos?.entidades) {
                    this.regConfig = [
                        {
                            type: "pixvsMatSelect",
                            label: "Entidad",
                            name: "entidades",
                            formControl: new FormControl(null, [Validators.required]),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: datos.entidades,
                            campoValor: 'entidad',
                        },
                        {
                            type: "input",
                            label: "Fecha Inicio",
                            inputType: "date",
                            name: "fechaInicio",
                            validations: [{ name: 'required', message: "Campo requerido", validator: Validators.required }],
                            value: moment(new Date()).format('YYYY-MM-DD')
                        },
                        {
                            type: "input",
                            label: "Fecha Fin",
                            inputType: "date",
                            name: "fechaFin",
                            validations: [{ name: 'required', message: "Campo requerido", validator: Validators.required }],
                            value: moment(new Date()).format('YYYY-MM-DD')
                        }
                    ];
                }
            });
    }
}