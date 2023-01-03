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
import { VentasService } from './ventas-listado.service';
import { FichasDataService } from '@services/fichas-data.service';
import { ArchivoProjection } from '@models/archivo';
import { JsonResponse } from '@models/json-response';

@Component({
    selector: 'ventas-listado',
    templateUrl: './ventas-listado.component.html',
    styleUrls: ['./ventas-listado.component.scss']
})
export class VentasListadoComponent {
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean { return !this.isLoading; }

    private _unsubscribeAll: Subject<any>;
    regConfig: FieldConfig[];
    isLoading: boolean = false;

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "book",
        columnaId: 'detalleId',
        rutaDestino: null,
        ocultarBotonNuevo: true,
        ocultarBotonRefrescar: true,
        columns: [
            { name: 'sede', title: 'Sede', class: "mat-column-160", centrado: false, type: null },
            { name: 'nombreArticulo', title: 'Articulo', class: "mat-column-flex", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null },
            { name: 'codigoGrupo', title: 'Codigo Grupo', class: "mat-column-140", centrado: false, type: null },
            { name: 'inscripcion', title: 'Inscripción', class: "mat-column-80", centrado: false, type: null, tooltip: true },
            { name: 'fechaOV', title: 'Fecha', class: "mat-column-80", centrado: false, type: 'fecha', tooltip: true },
            { name: 'notaVenta', title: 'Nota Venta', class: "mat-column-120", centrado: false, type: null },
            { name: 'total', title: 'Total', class: "mat-column-100", centrado: true, type: 'money' },
            { name: 'acciones', title: 'Acciones', class: "mat-column-80", centrado: false, type: 'acciones' }
        ],
        displayedColumns: ['sede', 'nombreArticulo', 'nombre', 'codigoGrupo', 'inscripcion', 'fechaOV', 'notaVenta', 'total', 'acciones'],
        columasFechas: ['fechaOV'],
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
        { title: 'Descargar Reporte', icon: 'play_for_work', tipo: FichaListadoConfig.EXCEL, url: "/api/v1/reporte-ventas/exportar/xlsx" }
    ];

    mySubscription;

    constructor(
        public _reporteGrupoService: VentasService,
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
                if (datos?.sucursales) {
                    this.regConfig = [
                        {
                            type: "input",
                            label: "Orden de Venta",
                            name: "ordenVenta",
                            formControl: new FormControl(null),
                            validations: [],
                            multiple: false,
                            selectAll: false
                        },
                        {
                            type: "pixvsMatSelect",
                            label: "Sede",
                            name: "sede",
                            formControl: new FormControl(null, [Validators.required]),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: datos?.sucursales,
                            campoValor: 'nombre',
                        },
                        {
                            type: "input",
                            label: 'Fecha Inicio',
                            inputType: "date",
                            name: "fechaInicio",
                            formControl: new FormControl(null, [Validators.required]),
                            validations: [{"name": "required","validator": Validators.required,"message": "Este campo es requerido"}]
                        },
                        {
                            type: "input",
                            label: 'Fecha Fin',
                            inputType: "date",
                            name: "fechaFin",
                            formControl: new FormControl(null, [Validators.required]),
                            validations: [{"name": "required","validator": Validators.required,"message": "Este campo es requerido"}]
                        }
                    ];
                }
            });
    }

    onDescargarArchivo(archivosDescargar: ArchivoProjection, event, id) {
        if (archivosDescargar.id != 4) {
            this._fichasDataService.cargando = true;

            this._reporteGrupoService.imprimirArchivo(id, archivosDescargar.id).then(
                function (result: JsonResponse) {
                    this._fichasDataService.cargando = false;
                }.bind(this)
            );
        } else {
            let liga = archivosDescargar.rutaFisica;

            if (liga) {
                // navigator clipboard api needs a secure context (https)
                if(navigator.clipboard && window.isSecureContext)
                    navigator.clipboard.writeText(liga);
                else{
                    var textArea = document.createElement("textarea");
                    textArea.value = liga;
                    textArea.style.position = "fixed";  //avoid scrolling to bottom
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea)
                }
                
                alert("Liga copiada: " + liga);
            } else {
                this._matSnackBar.open('El registro no cuenta con liga de pago', 'OK', { duration: 5000 });
            }
        }
    }
}