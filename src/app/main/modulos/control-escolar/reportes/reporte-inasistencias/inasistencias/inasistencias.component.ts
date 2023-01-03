import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FormControl, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { TranslateService } from '@ngx-translate/core';
import { InasistenciasService } from './inasistencias.service';
import { HttpService } from '@services/http.service';
import { FichasDataService } from '@services/fichas-data.service';
import * as moment from 'moment';
import { FichaListadoComponent } from '@pixvs/componentes/fichas/ficha-listado/listado.component';
import { ListadoFiltradoSidebarComponent } from '@pixvs/componentes/fichas/ficha-listado/sidebars/main/listado-filtrado-sidebar.component';

@Component({
    selector: 'inasistencias',
    templateUrl: './inasistencias.component.html',
    styleUrls: ['./inasistencias.component.scss']
})
export class InasistenciasComponent {
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return !this.isLoading;
    }

    @ViewChild('filtrado') ficha: ListadoFiltradoSidebarComponent;

    private _unsubscribeAll: Subject < any > ;
    regConfig: FieldConfig[];
    isLoading: boolean = false;

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "assignment_turned_in",
        columnaId: null,
        rutaDestino: null,
        ocultarBotonNuevo:true,
        ocultarBotonRefrescar:true,
        columns: [
            { name: 'id', title: 'Código UDG', class: "mat-column-140", centrado: false, type: null },
            { name: 'codigo', title: 'Código Proulex', class: "mat-column-140", centrado: false, type: null  },
            { name: 'nombre', title: 'Nombre', class: "mat-column-220", centrado: false, type: null,tooltip: true  },
            { name: 'grupo', title: 'Grupo', class: "mat-column-220", centrado: false, type: 'null', tooltip: true},
            { name: 'faltas', title: 'Faltas', class: "mat-column-100", centrado: false, type: 'null'},
            { name: 'asistencias', title: 'Asistencias', class: "mat-column-100", centrado: false, type: 'null'},
            { name: 'estatus', title: 'Estatus', class: "mat-column-100", centrado: false, type: 'null'}
        ],
        displayedColumns: ['id', 'codigo', 'nombre', 'grupo', 'faltas','asistencias', 'estatus'],
        columasFechas: [],
        listadoMenuOpciones: []

    };

    opciones: ListadoMenuOpciones[] = [];

    fechaInicio: string;
    fechaFin: string;
    datos: any[];
    sucursalId: number = null;
    modalidadId: number = null;
    cicloId: number = null;
    programacionId: number = null;

    mySubscription;
    constructor(public _reporteGrupoService: InasistenciasService,
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
        this._fichasDataService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
                if (datos?.sucursales) {
                    let sucursales = datos.sucursales;
                    let estatus = datos.estatus;
                    this.regConfig = [{
                            type: "pixvsMatSelect",
                            label: "Sede",
                            name: "sede",
                            formControl: new FormControl(null, [Validators.required]),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: sucursales,
                            campoValor: 'nombre',
                        },
                        {
                            type: "pixvsMatSelect",
                            label: "Estatus",
                            name: "estatus",
                            formControl: new FormControl(null),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: estatus,
                            campoValor: 'valor',
                        }
                    ];
                    if(!!datos?.permiso)
                        this.opciones.push({ title: 'Exportar a excel', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/inasistencias/xlsx' });
                }
            });

            let reg = this.regConfig.find(item => item.name == 'sede');
            if(!!reg){
                reg.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
                    this._reporteGrupoService.getCiclos(data);
                });
            }

            this._reporteGrupoService.onComboSedeChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
                if(!!data?.ciclos || !!data?.programaciones){
                    if(!!data?.programas){
                        let regIndex = this.regConfig.findIndex(item => item.name == 'programa');
                        if(regIndex != -1)
                            this.regConfig.splice(regIndex, 1);
                        this.regConfig.splice(1,0,
                            {
                                type: "pixvsMatSelect",
                                label: "Programa",
                                name: "programa",
                                formControl: new FormControl(null, Validators.required),
                                validations: [],
                                multiple: true,
                                selectAll: false,
                                list: data.programas,
                                campoValor: 'nombre',
                            }
                        );
                        this.regConfig = [...this.regConfig];
                    }
                    if(!!data?.ciclos && data.ciclos.length > 0){
                        let regIndex = this.regConfig.findIndex(item => item.name == 'ciclos');
                        if(regIndex != -1)
                            this.regConfig.splice(regIndex, 1);
                        this.regConfig.splice(1,0,
                            {
                                type: "pixvsMatSelect",
                                label: "Ciclos",
                                name: "ciclos",
                                formControl: new FormControl(null),
                                validations: [],
                                multiple: false,
                                selectAll: false,
                                list: data.ciclos,
                                campoValor: 'nombre',
                            }
                        );
                        let reg = this.regConfig.find(item => item.name == 'ciclos');
                        reg.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
                            if(!!data){
                                let i = this.regConfig.findIndex(item => item.name == 'pa');
                                if(i != -1){ this.regConfig.splice(i, 1); }
                                this._reporteGrupoService.getFechas({ciclo: data});
                            }
                        });
                        this.regConfig = [...this.regConfig];
                    }
                    if(!!data?.programaciones && data.programaciones.length > 0){
                        let regIndex = this.regConfig.findIndex(item => item.name == 'pa');
                        if(regIndex != -1)
                            this.regConfig.splice(regIndex, 1);
                        this.regConfig.splice(1,0,
                            {
                                type: "pixvsMatSelect",
                                label: "PA",
                                name: "pa",
                                formControl: new FormControl(null),
                                validations: [],
                                multiple: false,
                                selectAll: false,
                                list: data.programaciones,
                                campoValor: 'nombre',
                            }
                        );
                        let reg = this.regConfig.find(item => item.name == 'pa');
                        reg.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
                            if(!!data){
                                let i = this.regConfig.findIndex(item => item.name == 'ciclos');
                                if(i != -1){ this.regConfig.splice(i, 1); }
                                this._reporteGrupoService.getFechas({pa: data});
                            }
                        });
                        this.regConfig = [...this.regConfig];
                    }
                    
                }
            });

            this._reporteGrupoService.onComboPAChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
                if(!!data?.fechas){
                    if(data?.fechas.length == 0)
                        this._matSnackBar.open('No hay fechas para la PA/Ciclo consultado', 'OK', { duration: 5000, });
                    else{
                        let fechas = data.fechas.map( item => {return {fecha: moment(item).format('DD/MM/YYYY')}; });
                        let regIndex = this.regConfig.findIndex(item => item.name == 'fechas');
                        if(regIndex != -1)
                            this.regConfig.splice(regIndex, 1);
                        this.regConfig.splice(3,0,
                            {
                                type: "pixvsMatSelect",
                                label: "Fecha de inicio",
                                name: "fechas",
                                formControl: new FormControl(null, [Validators.required]),
                                validations: [],
                                multiple: false,
                                selectAll: false,
                                list: fechas,
                                campoValor: 'fecha',
                            }
                        );
                        this.regConfig = [...this.regConfig];
                    }
                        
                }
            });

            this._reporteGrupoService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(enviar => {
                if(enviar){
                    debugger;
                    this._fichasDataService.cargando = false;
                    this._fichasDataService.getDatos();
                }
            })
    }

    generarReporte(event){
        if(event.title == 'Descargar Reporte'){
            this.isLoading = true;
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
            let indexFechaInicio = this.regConfig.findIndex(dato =>{
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
                try{
                    this.cicloId = this.regConfig[indexCiclo].formControl.value.id;
                }catch(e){this.cicloId = null}
            }
            if(indexProgramacion > -1){
                try{
                    this.programacionId = this.regConfig[indexProgramacion].formControl.value.id;    
                }catch(e){this.programacionId = null}
                
            }
            if(indexFechaInicio > -1){
                try{
                    this.fechaInicio = this.regConfig[indexFechaInicio].formControl.value.fechaInicio;    
                }catch(e){this.fechaInicio = null}
                
            }
            this._fichasDataService.getExcelConFiltros("/api/v1/reporte-grupos/template/generarReporte", {datos: [],sucursalId: this.sucursalId, modalidadId: this.modalidadId, cicloId: this.cicloId, programacionId: this.programacionId, fechaInicio: this.fechaInicio}).then(value =>{
                this._fichasDataService.getDatos();
                let message = 'Reporte Descargado';
                this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
                this.router.navigate(['/app/control-escolar/reportes/reporte-grupos']);
                this.isLoading = false;
            });
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
}