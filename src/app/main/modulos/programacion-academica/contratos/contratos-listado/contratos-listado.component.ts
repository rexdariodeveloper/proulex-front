import { Component, OnInit, HostListener } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
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
import { ContratosService } from './contratos-listado.service';
import { HttpService } from '@services/http.service';
import { FichasDataService } from '@services/fichas-data.service';
import { JsonResponse } from '@models/json-response';
import * as moment from 'moment';

@Component({
    selector: 'contratos-listado',
    templateUrl: './contratos-listado.component.html',
    styleUrls: ['./contratos-listado.component.scss']
})
export class ContratosListadoComponent {
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
            { name: 'nombreProfesor', title: 'Profesor', class: "mat-column-280", centrado: false, type: null,tooltip: true  },
            { name: 'codigoProfesor', title: 'Código de Profesor', class: "mat-column-flex", centrado: false, type: null },
            { name: 'sueldoProfesor', title: 'Sueldo', class: "mat-column-flex", centrado: false, type: null,tooltip: true  },
            { name: 'fechaInicio', title: 'Fecha Inicio', class: "mat-column-flex", centrado: false, type: 'fecha',tooltip: true  },
            { name: 'fechaFin', title: 'Fecha Fin', class: "mat-column-flex", centrado: false, type: 'fecha'},
            { name: 'idioma', title: 'Idioma', class: "mat-column-flex", centrado: false, type: null,tooltip: true  },
            { name: 'plantel', title: 'Plantel', class: "mat-column-flex", centrado: false, type: null,tooltip: true  },
            { name: 'modalidad', title: 'Modalidad', class: "mat-column-flex", centrado: false, type: null,tooltip: true  },
            { name: 'grupos', title: 'Grupos', class: "mat-column-80", centrado: false, type: null,tooltip: true  },
            { name: 'ver', title: 'Ver', class: "mat-column-flex", centrado: false, type: 'acciones'  }
        ],
        displayedColumns: ['nombreProfesor', 'codigoProfesor', 'sueldoProfesor', 'fechaInicio', 'fechaFin','idioma','plantel','modalidad','grupos','ver'],
        columasFechas: ['fechaInicio', 'fechaFin'],
        listadoMenuOpciones: [{ title: 'Generar Contratos', icon: 'receipt', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/prenomina/save' }],
        listadoAcciones: [{
            title: 'Contrato',
            tipo: null,
            icon: 'drafts',
            accion: this.showDocument.bind(this)
        }]

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
    fechas: any[] = [];
    constructor(public _contratosGrupoService: ContratosService,
                public _fichasDataService: FichasDataService,
                private _httpClient: HttpService,
                private translate: TranslateService,
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
        if (this.mySubscription) {
         this.mySubscription.unsubscribe();
        }
    }

    ngOnInit(): void {
        this._fichasDataService.cargando = false;
        this._fichasDataService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos?.datos) {
                    let sucursales = datos.sucursales;
                    let modalidades = datos.modalidades;
                    let profesores = datos.profesores;
                    let idiomas = datos.idiomas;
                    this.regConfig = [{
                            type: "pixvsMatSelect",
                            label: "Sede",
                            name: "sede",
                            formControl: new FormControl(null,[Validators.required]),
                            validations: [],
                            multiple: false,
                            selectAll: false,
                            list: sucursales,
                            campoValor: 'nombre',
                        },{
							type: "pixvsMatSelect",
							label: "Año",
							name: "anio",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: datos?.anios
						},{
                            type: "pixvsMatSelect",
                            label: "Modalidades",
                            name: "modalidades",
                            formControl: new FormControl(null,[Validators.required]),
                            validations: [],
                            multiple: false,
                            selectAll: false,
                            list: modalidades,
                            campoValor: 'nombre',
                        },{
                            type: "pixvsMatSelect",
                            label: "Idioma",
                            name: "idioma",
                            formControl: new FormControl(null,[Validators.required]),
                            validations: [],
                            multiple: false,
                            selectAll: false,
                            list: idiomas,
                            campoValor: 'valor',
                        },{
                            type: "pixvsMatSelect",
                            label: "Profesores",
                            name: "profesores",
                            formControl: new FormControl(null),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: profesores,
                            campoValor: 'nombreCompleto',
                        }
                    ];

                    var anio = new Date().getFullYear();
            
                    let regAnio = this.regConfig.find(item => item.name == 'anio');
                    regAnio.formControl.setValue(anio);
                    
                }else if(datos?.url){
                    this.abrirModalDocumento(datos.url);
                }
            });

            
            this._fichasDataService.cargando = false;
            this.regConfig[0]?.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                //if(this.regConfig[0].formControl.value && this.regConfig[0].formControl.value.nombre == 'JOBS SEMS'){
                    this.isLoading = true;
                    for (let k = 2, tfc = this.regConfig.length; k < tfc; k++) {
                        this.regConfig[k].formControl.setValue(null);
                        this.regConfig[k].formControl.markAsUntouched();
                    }
                    this.regConfig[1]?.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                        
                        let anio = this.regConfig[1].formControl.value;
                        let idSucursal = this.regConfig[0].formControl.value.id;
                        let idModalidad = this.regConfig[2].formControl.value.id;
                        if(!!!anio || !!!idSucursal || !!!idModalidad)
                            return
                        
                        this.actualizarFiltros(anio, idSucursal, idModalidad);
                    });

                    //let indexModalidad = this.regConfig.findIndex(objecto =>{ return objecto.label == 'Modalidades'; });
                    this.regConfig[2]?.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    //this.regConfig[1]?.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                        let anio = this.regConfig[1].formControl.value;
                        let idSucursal = this.regConfig[0].formControl.value.id;
                        let idModalidad = this.regConfig[2].formControl.value.id;
                        if(!!!anio || !!!idSucursal || !!!idModalidad)
                            return
                        
                        this.actualizarFiltros(anio, idSucursal, idModalidad);
                        
                        
                    });
                    this.isLoading = false;
                    
                
            });

            this._contratosGrupoService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(enviar => {
                if(enviar){
                    this._fichasDataService.cargando = false;
                    this._fichasDataService.getDatos();
                }
            })
    }

    actualizarFiltros(anio, idSucursal, idModalidad){
        this.isLoading = true;
        this._contratosGrupoService.getFechasInicioByAnioAndSucursalAndModalidad(anio, idSucursal, idModalidad).then(value =>{
            
            for (let k = 3, tfc = this.regConfig.length; k < tfc; k++) {
                this.regConfig[k].formControl.setValue(null);
                this.regConfig[k].formControl.markAsUntouched();
            }


            if(!value.data.esJobs){
                this.regConfig = this.regConfig.filter(objecto =>{
                    return objecto?.label != 'Programación académica' && objecto?.label != 'Fecha de inicio' && objecto?.label != 'Programa' && objecto?.label != 'Ciclo';
                }); 
                    
                    let existeFecha = this.regConfig.findIndex(objecto =>{
                        return objecto?.label == 'Fecha de inicio';
                    });
                    
                    let fechaInicioInput: FieldConfig = {
                        type: "pixvsMatSelect",
                        label: "Fecha de inicio",
                        name: "fechaInicio",
                        formControl: new FormControl(null,[Validators.required]),
                        validations: [],
                        multiple: false,
                        selectAll: false,
                        list: value.data.fechas,
                        //campoValor: 'fechaInicio',
                        hidden:false
                    }
                    
                    if(existeFecha == -1){
                        this.regConfig.push(fechaInicioInput); 
                    }else{
                        this.regConfig[existeFecha] = fechaInicioInput;
                    }
                    this.regConfig = [...this.regConfig]
                  
            } else{
                
                this.regConfig = this.regConfig.filter(objecto =>{
                    return objecto?.label != 'Ciclo' && objecto?.label != 'Fecha de inicio' && objecto?.label != 'Programa';
                });    
                    
                        
                let existeFecha = this.regConfig.findIndex(objecto =>{
                    return objecto?.label == 'Fecha de inicio';
                });

                //fechas = fechas.sort((a, b) =>{ return (new Date(a.fechaInicio)).getTime() - (new Date(b.fechaInicio)).getTime(); });*/

                let fechaInicioInput: FieldConfig = {
                    type: "pixvsMatSelect",
                    label: "Fecha de inicio",
                    name: "fechaInicio",
                    formControl: new FormControl(null,[Validators.required]),
                    validations: [],
                    multiple: false,
                    selectAll: false,
                    list: value.data.fechas,
                    //campoValor: 'fechaInicio',
                    hidden:false
                }
                if(existeFecha == -1){
                    this.regConfig.push(fechaInicioInput); 
                }else{
                    this.regConfig[existeFecha] = fechaInicioInput;
                }
                this.regConfig = [...this.regConfig]
            }
            this.isLoading = false;
        })
        this.isLoading = false;
    }

    generarReporte(event){

        if(event.title == 'Generar Contratos' && this.regConfig.length > 4){
            
            let json = {};
            let invalid = false
            for (let index = 0, total = this.regConfig.length; index < total; index++) {
                let element = this.regConfig[index];
                json[element.name] = element.formControl.value;
                if(!!!element.formControl.valid)
                    invalid = true
            }
            if(invalid){
                this._matSnackBar.open('Llenar los campoos requeridos', 'OK', { duration: 5000 });
                return;
            }

            this._contratosGrupoService.getZip(json).then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        let message = 'Contratos generados';
                        this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
                    } else {
                        let message = result.message;
                        this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
                    }
                }.bind(this));
        }
        else{
            if(this.regConfig[0]?.formControl?.value != null){
                let message = 'No existen contratos para esta sede';
                this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
            } else{
               let message = 'Selecciona una sede';
               this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 }); 
            }
             
               
        }
    }

    moveArrayItemToNewIndex(arr, old_index, new_index) {
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; 
    };

    click(event){
        console.log(event);
    }

    showDocument(data){
        this._fichasDataService.getArchivoURL('/api/v1/contratos/preview',data)
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
}