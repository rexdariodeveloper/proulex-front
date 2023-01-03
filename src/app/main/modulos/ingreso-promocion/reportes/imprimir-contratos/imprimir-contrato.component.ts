import { Component, OnInit, HostListener } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { FormControl, Validators } from '@angular/forms';
import { Router, RoutesRecognized, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import { ImprimirContratosService } from './imprimir-contrato.service';
import { HttpService } from '@services/http.service';
import { FichasDataService } from '@services/fichas-data.service';
import { JsonResponse } from '@models/json-response';
import * as moment from 'moment';

@Component({
    selector: 'imprimir-contratos',
    templateUrl: './imprimir-contrato.component.html',
    styleUrls: ['./imprimir-contrato.component.scss']
})
export class ImprimirContratosComponent {
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return !this.isLoading;
    }
    //selection = new SelectionModel<any>(true, []);
    private _unsubscribeAll: Subject < any > ;
    regConfig: FieldConfig[];
    isLoading: boolean = false;

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "folder_open",
        columnaId: 'id',
        rutaDestino: null,
        ocultarBotonNuevo:true,
        columns: [
            { name: 'entidadNombre', title: 'Entidad', class: "mat-column-280", centrado: false, type: null,tooltip: true  },
            { name: 'codigoEmpleado', title: 'Código de empleado', class: "mat-column-flex", centrado: false, type: null },
            { name: 'nombreApellidos', title: 'Nombre del empleado', class: "mat-column-flex", centrado: false, type: null,tooltip: true  },
            { name: 'fechaAlta', title: 'Fecha de alta', class: "mat-column-flex", centrado: false, type: 'fecha',tooltip: true  },
            { name: 'tipoContrato', title: 'Tipo de contrato', class: "mat-column-flex", centrado: false, type: null},
            { name: 'fechaInicio', title: 'Fecha inicio', class: "mat-column-flex", centrado: false, type: 'fecha',tooltip: true  },
            { name: 'fechaFin', title: 'Fecha fin', class: "mat-column-flex", centrado: false, type: 'fecha',tooltip: true  },
            { name: 'sueldoMensual', title: 'Sueldo Mensual', class: "mat-column-flex", centrado: false, type: 'cantidad',tooltip: true  },
            { name: 'ver', title: 'Ver', class: "mat-column-flex", centrado: false, type: 'acciones'  },
        ],
        displayedColumns: ['entidadNombre', 'codigoEmpleado', 'nombreApellidos', 'fechaAlta', 'tipoContrato','fechaInicio','fechaFin','sueldoMensual', 'ver'],
        columasFechas: ['fechaAlta', 'fechaInicio', 'fechaFin'],
        listadoMenuOpciones: [
            {
                title: 'Descargar ZIP(PDF)',
                icon: 'receipt',
                tipo: FichaListadoConfig.PERSONALIZADO,
                url: '/api/v1/contratos-empleados/imprimir/zip/pdf'
            },
            {
                title: 'Descargar ZIP(WORD)',
                icon: 'receipt',
                tipo: FichaListadoConfig.PERSONALIZADO,
                url: '/api/v1/contratos-empleados/imprimir/zip/docx'
            }
        ],
        listadoAcciones: [
            {
                title: 'Ver PDF',
                tipo: null,
                icon: 'pageview',
                columnaOpcionesMenu: 'Contrato',
                columnaMostrarOpcionMenu: '',
                accion: this.showDocument.bind(this)
            },
            {
                title: 'Documento de word',
                tipo: null,
                icon: 'cloud_download',
                columnaOpcionesMenu: 'descargarWord',
                columnaMostrarOpcionMenu: '',
                accion: this.descargarWord.bind(this)
            }
    ]

    };

    fechaInicio: any;
    fechaFin: string;
    datos: any[];
    sucursalId: number = null;
    modalidadId: number = null;
    cicloId: number = null;
    programacionId: number = null;
    idiomaId: number = null;
    mySubscription;
    constructor(public imprimirContratosService: ImprimirContratosService,
                public _fichasDataService: FichasDataService,
                private _httpClient: HttpService,
                private translate: TranslateService,
                private router: Router,
                private _matSnackBar: MatSnackBar,
                public dialog: MatDialog
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
        if (this.mySubscription) {
         this.mySubscription.unsubscribe();
        }
    }

    ngOnInit(): void {
        this._fichasDataService.cargando = false;
        this._fichasDataService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos?.empleados) {
                    let entidades = datos.entidades;
                    let empleados = datos.empleados;
                    this.regConfig = [
                        {
                            type: "pixvsMatSelect",
                            label: "Año",
                            name: "anio",
                            formControl: new FormControl(null),
                            validations: [],
                            multiple: false,
                            selectAll: false,
                            list: this.getAnios()
                        },{
                            type: "pixvsMatSelect",
                            label: "Entidades",
                            name: "entidad",
                            showToolTip: true,
                            formControl: new FormControl(null,[Validators.required]),
                            validations: [],
                            multiple: false,
                            selectAll: false,
                            list: entidades,
                            campoValor: 'nombre',
                        },{
                            type: "pixvsMatSelect",
                            label: "Empleados",
                            name: "empleados",
                            //showToolTip: true,
                            formControl: new FormControl(null,[]),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: empleados,
                            campoValor: 'nombreCompleto',
                        }
                    ];
                    
                    var anio = (new Date()).getFullYear();
                    let regAnio = this.regConfig.find(item => item.name == 'anio');
                    regAnio.formControl.setValue(anio);
                }else if(datos?.url){
                    this.abrirModalDocumento(datos.url);
                }
            });

            this._fichasDataService.cargando = false;
            // ----------------------------------------------------------------
            this.regConfig[1]?.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                
                let entidadId = this.regConfig[1].formControl.value.id;
                if(!!!entidadId)
                    return
                
                this.actualizarFiltros(entidadId);
            });
            // ----------------------------------------------------------------
            
    }

    actualizarFiltros(entidadId: number){
        this._fichasDataService.cargando = false;
        this.imprimirContratosService.getEmpleadosByEntidadId(entidadId).then(value =>{
            
            if(!!value.data.empleadosEntidad){ 
                let empleados = value.data.empleadosEntidad;
                let existeEmpleados = this.regConfig.findIndex(objecto =>{
                    return objecto?.label == 'Empleados';
                });
                
                let empleadosInput: FieldConfig = {
                    type: "pixvsMatSelect",
                    label: "Empleados",
                    name: "empleados",
                    //showToolTip: true,
                    formControl: new FormControl(null,[]),
                    validations: [],
                    multiple: true,
                    selectAll: false,
                    list: empleados,
                    campoValor: 'nombreCompleto',
                }
                
                if(existeEmpleados == -1){
                    this.regConfig.push(empleadosInput); 
                }else{
                    this.regConfig[existeEmpleados] = empleadosInput;
                }
                this.regConfig = [...this.regConfig]
                  
            }
            this._fichasDataService.cargando = false;
        })
    }

    // Boton de acciones
    generarReporte(event){
        if(this.regConfig[0]?.formControl?.value == null){
            let message = 'Debe seleccionar una entidad';
            this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
            return;
        }

        let json = {
            entidad: this.regConfig[0]?.formControl?.value,
            empleado: this.regConfig[1]?.formControl?.value
        }
        this.imprimirContratosService.getZip(event.url, json).then(
        function (result: JsonResponse) {
            if (result.status == 200) {
                let message = 'Contratos generados';
                this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
            } else {
                let message = result.message;
                this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
            }
        }.bind(this));

        
        //this._fichasDataService.getArchivoURL('/api/v1/contratos/preview',json);
    }


    click(event){
        this.getZip();
        console.log(event);
    }

    getZip(){
        /*let json = {
            entidad: this.regConfig[0]?.formControl?.value,
            empleado: this.regConfig[1]?.formControl?.value
        }
        this.imprimirContratosService.getZip(json).then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    let message = 'Contratos generados';
                    this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
                } else {
                    let message = result.message;
                    this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
                }
            }.bind(this));*/
    }

    showDocument(data){
        this._fichasDataService.getArchivoURL('/api/v1/empleados-contratos/preview',data)
    }


    abrirModalDocumento(url: any): void {
        let iframe =  document.createElement('iframe');
        document.body.appendChild(iframe);
        iframe.style.display = 'none';
        iframe.src = url;
        iframe.onload = function() {
            setTimeout(function() {
                iframe.focus();
                iframe.contentWindow.print();
            }, 1);
        };
	}

    descargarWord(data){
        this._fichasDataService.getArchivo('/api/v1/contratos/download/docx/'+data.id)
    }

    getAnios(){
        let anios = []
        let startYear = 2020,
            endYear = (new Date()).getFullYear()
            //currentYear = (new Date()).getFullYear()
            ;
        for (var i = endYear; i >= startYear; i--) {
            anios.push(endYear);
            endYear-=1;
        }

        return anios;
    }
}