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
import { CriteriosGrupoService } from './criterios-listado.service';
import { HttpService } from '@services/http.service';
import { FichasDataService } from '@services/fichas-data.service';
import { JsonResponse } from '@models/json-response';
import * as moment from 'moment';

@Component({
    selector: 'criterios-listado',
    templateUrl: './criterios-listado.component.html',
    styleUrls: ['./criterios-listado.component.scss']
})
export class CriteriosListadoComponent {
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
        columnaId: null,
        rutaDestino: null,
        ocultarBotonNuevo:true,
        columns: [
            { name: 'nombreEmpleado', title: 'Profesor', class: "mat-column-280", centrado: false, type: null,tooltip: true  },
            { name: 'codigoGrupo', title: 'Código de Grupo', class: "mat-column-flex", centrado: false, type: null },
            { name: 'horario', title: 'Horario', class: "mat-column-flex", centrado: false, type: null,tooltip: true  },
            { name: 'nivel', title: 'Nivel', class: "mat-column-flex", centrado: false, type: null,tooltip: true  },
            { name: 'aula', title: 'Aula', class: "mat-column-flex", centrado: false, type: null},
        ],
        displayedColumns: ['nombreEmpleado', 'codigoGrupo', 'horario', 'nivel', 'aula'],
        columasFechas: [],
        listadoMenuOpciones: [{ title: 'Generar Asignación de Clases', icon: 'receipt', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/prenomina/save' }]

    };

    fechaInicio: any;
    fechaFin: string;
    datos: any[];
    sucursalId: number = null;
    modalidadId: number = null;
    cicloId: number = null;
    programacionId: number = null;
    mySubscription;
    ciclos:[];
    programacionAcademicaComercial:[];
    constructor(public _criteriosGrupoService: CriteriosGrupoService,
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
                            label: "Profesores",
                            name: "profesores",
                            formControl: new FormControl(null),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: profesores,
                            campoValor: 'nombreCompleto',
                        }
                    ]
                }
            });

            
            this._fichasDataService.cargando = false;
            this.regConfig[0]?.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                if(this.regConfig[0].formControl.value){
                    this.isLoading = true;
                    try{
                        this.regConfig[1].formControl.reset();
                    }catch(e){}
                    this._criteriosGrupoService.getComboProgramacionCiclo(this.regConfig[0].formControl.value.id).then(value =>{
                        let ciclos = value.data.ciclos;
                        let programacionAcademicaComercial = [...new Map(value.data.programacion.map(item => [item.nombre, item])).values()];
                        let fechas = [];

                        if(ciclos.length > 0){
                            fechas = [...new Map(value.data.fechasGrupos.map(item => [item.fechaInicio, item])).values()];
                            this.regConfig = this.regConfig.filter(objecto =>{
                                return objecto?.label != 'Programación académica' && objecto?.label != 'Fecha de inicio';
                            }); 
                            let existeCiclo = this.regConfig.findIndex(objecto =>{
                                return objecto.label == 'Ciclo';
                            });
                            if(existeCiclo == -1){
                               this.regConfig = this.regConfig.concat({
                                    type: "pixvsMatSelect",
                                    label: "Ciclo",
                                    name: "ciclo",
                                    formControl: new FormControl(null,[Validators.required]),
                                    validations: [],
                                    multiple: false,
                                    selectAll: false,
                                    list: ciclos,
                                    campoValor: 'nombre',
                                    hidden:false
                                });
                                let indexCiclo = this.regConfig.findIndex(objecto =>{
                                    return objecto.label == 'Ciclo';
                                });  
                                
                                if(indexCiclo > -1){
                                    this.regConfig = this.moveArrayItemToNewIndex(this.regConfig,indexCiclo,1);    
                                }

                                this.regConfig = this.regConfig.concat({
                                    type: "pixvsMatSelect",
                                    label: "Fecha de inicio",
                                    name: "fechaInicio",
                                    formControl: new FormControl(null,[Validators.required]),
                                    validations: [],
                                    multiple: false,
                                    selectAll: false,
                                    list: fechas,
                                    campoValor: 'fechaInicio',
                                    hidden:false
                                }); 
                            }
                        }
                        if(programacionAcademicaComercial.length > 0){
                            this.regConfig = this.regConfig.filter(objecto =>{
                                return objecto?.label != 'Ciclo' && objecto?.label != 'Fecha de inicio';
                            });
                            let existeProgramacion = this.regConfig.findIndex(objecto =>{
                                return objecto?.label == 'Programación académica';
                            }); 
                            if(existeProgramacion == -1){
                                this.regConfig = this.regConfig.concat({
                                    type: "pixvsMatSelect",
                                    label: "Programación académica",
                                    name: "programacion",
                                    formControl: new FormControl(null,[Validators.required]),
                                    validations: [],
                                    multiple: false,
                                    selectAll: false,
                                    list: programacionAcademicaComercial,
                                    campoValor: 'nombre',
                                    hidden:false
                                });
                                let indexPrograma = this.regConfig.findIndex(objecto =>{
                                    return objecto?.label == 'Programación académica';
                                });    
                                
                                if(indexPrograma > -1){
                                    this.regConfig = this.moveArrayItemToNewIndex(this.regConfig,indexPrograma,1);    
                                }
                                this.regConfig[1].formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                                    //console.log("Cambié de programación");
                                    if(this.regConfig[1].formControl.value){
                                        fechas = [];
                                        this.regConfig[1].formControl.value.detalles.forEach(detalle =>{
                                            fechas.push({fechaInicio: moment(detalle.fechaInicio).format('YYYY-MM-DD'), fechaFin: moment(detalle.fechaFin).format('YYYY-MM-DD')});
                                        });
                                        fechas = [...new Map(fechas.map(item => [item.fechaInicio, item])).values()]; //fechaInicio
                                        debugger;
                                        let existeFecha = this.regConfig.findIndex(objecto =>{
                                            return objecto?.label == 'Fecha de inicio';
                                        });  
                                        this.regConfig = this.regConfig.filter(objecto =>{
                                            return objecto?.label != 'Fecha de inicio';
                                        });
                                        this.regConfig = this.regConfig.concat({
                                            type: "pixvsMatSelect",
                                            label: "Fecha de inicio",
                                            name: "fechaInicio",
                                            formControl: new FormControl(null,[Validators.required]),
                                            validations: [],
                                            multiple: false,
                                            selectAll: false,
                                            list: fechas,
                                            campoValor: 'fechaInicio'
                                         })
                                    }
                                    
                                })
                            }
                            
                        }
                        if(ciclos.length == 0 && programacionAcademicaComercial.length ==0){
                            let message = 'No existen ciclos o programaciones académicas asociadas a esta sede';
                            this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
                        }
                        
                        this.isLoading = false;
                    });

                    
                }
            });

            this._criteriosGrupoService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(enviar => {
                if(enviar){
                    console.log("Chalecito");
                    this._fichasDataService.cargando = false;
                    this._fichasDataService.getDatos();
                }
            })
    }

    generarReporte(event){

        if(event.title == 'Generar Asignación de Clases' && this.regConfig.length > 4){
            let profesoresSeleccionados = [];
            //this.isLoading = true;
            let indexSucursal = this.regConfig.findIndex(dato =>{
                if(dato.label == 'Sede'){
                    return dato;
                }
            });
            let indexModalidad = this.regConfig.findIndex(dato =>{
                if(dato.label == 'Modalidades'){
                    return dato;
                }
            });
            let indexCiclo = this.regConfig.findIndex(dato =>{
                if(dato.label == 'Ciclo'){
                    return dato;
                }
            });
            let indexProgramacion = this.regConfig.findIndex(dato =>{
                if(dato.label == 'Programación académica'){
                    return dato;
                }
            });
            let indexProfesores = this.regConfig.findIndex(dato =>{
                if(dato.label == 'Profesores'){
                    return dato;
                }
            });
            let indexFecha = this.regConfig.findIndex(dato =>{
                if(dato.label == 'Fecha de inicio'){
                    return dato;
                }
            });

            if(indexSucursal > -1){
                try{
                    this.sucursalId = this.regConfig[indexSucursal].formControl.value.id;    
                }catch(e){this.sucursalId = null}
                
            }
            if(indexModalidad > -1){
                try{
                    this.modalidadId = this.regConfig[indexModalidad].formControl.value.id    
                }catch(e){this.modalidadId = null}
                
            }
            if(indexCiclo > -1){
                this.cicloId = this.regConfig[indexCiclo].formControl.value.id;
            }
            if(indexProgramacion > -1){
                this.programacionId = this.regConfig[indexProgramacion].formControl.value.id;
            }
            if(indexProfesores > -1 && this.regConfig[indexProfesores].formControl.value){
                try{
                    this.regConfig[indexProfesores].formControl.value.forEach(profesor =>{
                        profesoresSeleccionados.push(profesor.id);
                    });
                }catch(e){
                    profesoresSeleccionados = null;
                }
            }
            if(indexFecha > -1){
                this.fechaInicio = this.regConfig[indexFecha].formControl.value;
            }
            let json = {
                sucursalId: this.sucursalId, 
                modalidadId: this.modalidadId, 
                cicloId: this.cicloId, 
                programacionId: this.programacionId, 
                fechaInicio: this.fechaInicio, 
                profesores: profesoresSeleccionados
            }
            this._criteriosGrupoService.getZip(json).then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        let message = 'Reportes generados';
                        this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
                    } else {
                        let message = result.message;
                        this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
                    }
                }.bind(this));
        }
        else{
            if(this.regConfig[0].formControl.value != null){
                let message = 'No existen ciclos o programaciones académicas asociadas a esta sede';
                this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
            }else{
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
}