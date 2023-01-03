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
import { PagosAlumnosService } from './pagos-alumnos.service';
import { HttpService } from '@services/http.service';
import { FichasDataService } from '@services/fichas-data.service';
import * as moment from 'moment';
import { FichaListadoComponent } from '@pixvs/componentes/fichas/ficha-listado/listado.component';
import { ListadoFiltradoSidebarComponent } from '@pixvs/componentes/fichas/ficha-listado/sidebars/main/listado-filtrado-sidebar.component';

@Component({
    selector: 'pagos-alumnos',
    templateUrl: './pagos-alumnos.component.html',
    styleUrls: ['./pagos-alumnos.component.scss']
})
export class PagosAlumnosComponent {
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean { return !this.isLoading; }

    @ViewChild('filtrado') ficha: ListadoFiltradoSidebarComponent;

    private _unsubscribeAll: Subject <any> ;
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
            { name: 'codigo', title: 'Código UDG', class: "mat-column-140", centrado: false, type: null },
            { name: 'primerApellido', title: 'Primer apellido', class: "mat-column-140", centrado: false, type: null  },
            { name: 'segundoApellido', title: 'Segundo apellido', class: "mat-column-140", centrado: false, type: null  },
            { name: 'nombre', title: 'Nombre', class: "mat-column-220", centrado: false, type: null,tooltip: true  },
            { name: 'plantel', title: 'Plantel', class: "mat-column-220", centrado: false, type: null,tooltip: true  },
            { name: 'clave', title: 'Clave curso', class: "mat-column-220", centrado: false, type: null,tooltip: true  },
            { name: 'grupo', title: 'Grupo', class: "mat-column-220", centrado: false, type: null, tooltip: true},
            { name: 'horario', title: 'Horario', class: "mat-column-220", centrado: false, type: null, tooltip: true},
            { name: 'sede', title: 'Sede', class: "mat-column-220", centrado: false, type: null,tooltip: true  },
            { name: 'escuela', title: 'Escuela', class: "mat-column-220", centrado: false, type: null,tooltip: true  },
            { name: 'referencia', title: 'Ref. Bancaria', class: "mat-column-100", centrado: false, type: null},
            { name: 'poliza', title: 'Poliza o nota', class: "mat-column-100", centrado: false, type: null},
            { name: 'precio', title: 'Total', class: "mat-column-100", centrado: false, type: 'money'},
            { name: 'estatus', title: 'Estatus', class: "mat-column-100", centrado: false, type: null}
        ],
        displayedColumns: ['codigo','primerApellido','segundoApellido','nombre','plantel','clave','grupo','horario','sede','escuela','referencia','poliza','precio','estatus'],
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
    constructor(public _reporteService: PagosAlumnosService,
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
        if (this.mySubscription) { this.mySubscription.unsubscribe();}
    }

    ngOnInit(): void {
        this._fichasDataService.onDatosChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(datos => {
            if (datos?.sedes) {
                this.regConfig = [{
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
                        label: "Estatus",
                        name: "estatus",
                        formControl: new FormControl(null),
                        validations: [],
                        multiple: true,
                        selectAll: false,
                        list: datos?.estatus,
                        campoValor: 'valor',
                    }
                ];
                this.opciones.push({ title: 'Exportar a excel', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/pagos-alumnos/xlsx' });
            }
        });
        //Create subscription for "Sedes" filter
        let reg = this.regConfig.find(item => item.name == 'sede');
        if(!!reg){
            reg.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
                this._reporteService.getCiclos(data);
            });
        }

        this._reporteService.onComboSedeChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            if(!!data?.anios && data.anios.length > 0){
                let aniosMap = data.anios.map( (anio) => {return {id: anio, name: String(anio)}; });
                let field: FieldConfig = {
                    type: "pixvsMatSelect",
                    label: "Año",
                    name: "anio",
                    formControl: new FormControl(null),
                    validations: [],
                    multiple: false,
                    selectAll: false,
                    list: aniosMap,
                    campoValor: "name"
                };
                this.updateFilters(1,'anio',field);
                
                let reg = this.regConfig.find(item => item.name == 'anio');
                reg.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
                    if(!!data)
                        this._reporteService.getFechas({anio: data});
                });
                this.regConfig = [...this.regConfig];
                let anioActual = aniosMap.find((anio) => {return anio.name === moment().format('YYYY'); });
                if(!!anioActual)
                    reg.formControl.setValue(anioActual);
            }                  
        });

        this._reporteService.onComboPAChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            if(!!data?.fechas){
                if(data?.fechas.length == 0)
                    this._matSnackBar.open('No hay fechas para la PA/Ciclo consultado', 'OK', { duration: 5000, });
                else {
                    let fechas = data.fechas.map( item => {return {fecha: moment(item).format('DD/MM/YYYY')}; });
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
                    this.updateFilters(2, "fechas", field);
                }
            }
        });

        this._reporteService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(enviar => {
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

    updateFilters(index:number, name: string, field: FieldConfig){
        let regIndex = this.regConfig.findIndex(item => item.name == name);
        if(regIndex != -1)
            this.regConfig.splice(regIndex, 1);
        this.regConfig.splice(index,0,field);
        this.regConfig = [...this.regConfig];
    }
}