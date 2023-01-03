import { SelectionModel } from "@angular/cdk/collections";
import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NavigationEnd, Router } from "@angular/router";
import { FichaListadoConfig } from "@models/ficha-listado-config";
import { FieldConfig } from "@pixvs/componentes/dinamicos/field.interface";
import { FichasDataService } from "@services/fichas-data.service";
import { Subject } from "rxjs";
import { takeUntil } from 'rxjs/operators';
import { ErroresDialogComponent, ErroresDialogData } from "./dialogs/errores/errores.dialog";
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { ProyeccionGrupoService } from "./proyeccion-listado.service";
import * as moment from 'moment';

@Component({
    selector: 'proyeccion-listado',
    templateUrl: './proyeccion-listado.component.html',
    styleUrls: ['./proyeccion-listado.component.scss']
})
export class ProyeccionListadoComponent {
    private _unsubscribeAll: Subject<any>;
    isLoading: boolean = false;
    selection = new SelectionModel<any>( true, [] );
    regConfig: FieldConfig[] = [];
    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "folder_open",
        columnaId: null,
        rutaDestino: null,
        ocultarBotonNuevo:true,
        columns: [
            { name: 'codigoGrupo', title: 'Código de Grupo', class: "mat-column-flex", centrado: false, type: null },
            { name: 'curso', title: 'Curso', class: "mat-column-flex", centrado: false, type: null,tooltip: true  },
            { name: 'modalidad', title: 'Modalidad', class: "mat-column-flex", centrado: false, type: null,tooltip: true  },
            { name: 'fechaInicio', title: 'Fecha inicio', class: "mat-column-flex", centrado: false, type: 'fecha'},
            { name: 'fechaFin', title: 'Fecha fin', class: "mat-column-flex", centrado: false, type: 'fecha' },
            { name: 'nivel', title: 'Nivel', class: "mat-column-flex", centrado: false, type: null},
            { name: 'horario', title: 'Horario', class: "mat-column-flex", centrado: true, type: null },
            { name: 'cupo', title: 'Cupo', class: "mat-column-flex", centrado: false, type: null },
            { name: 'totalInscritos', title: 'Total de inscritos', class: "mat-column-flex", centrado: true, type: null },
            { name: 'profesor', title: 'Profesor', class: "mat-column-flex", centrado: false, type: null,tooltip: true  },
            { name: 'checkbox', title: '', class: "mat-column-50", centrado: false, type: 'selection' }
        ],
        displayedColumns: ['codigoGrupo', 'curso', 'modalidad', 'fechaInicio', 'fechaFin','nivel', 'horario', 'cupo', 'totalInscritos', 'profesor','checkbox'],
        columasFechas: ['fechaInicio', 'fechaFin'],
        listadoMenuOpciones: [{ title: 'Crear Grupos', icon: 'attachment', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/prenomina/save' }]
    };
    displayedColumns: string[] = ['codigoAnterior','codigoGrupo', 'curso','modalidad','fechaInicio','fechaFin','nivel','horario','cupo','totalInscritos','profesor'];
    sedes: any[] = [];
    programaciones: any[] = [];
    ciclos: any[] = [];
    modalidades: any[] = [];
    fechas: any[] = [];
    proyecciones: any[] = [];
    numeroGrupos: number = 0;
    numeroInscripciones: number = 0;
    listado: boolean = true;

    mySubscription;
    subscripcionesFiltros: Subject<any>
    
    constructor( public _proyeccionGrupoService: ProyeccionGrupoService,
                 public _fichasDataService: FichasDataService,
                 private router: Router,
                 private _matSnackBar: MatSnackBar,
                 public dialog: MatDialog) {
        this._unsubscribeAll = new Subject();
        this.subscripcionesFiltros = new Subject();
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.mySubscription = this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd)
            this.router.navigated = false;
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
                if (datos?.sucursales) {
                    this.sedes = datos?.sucursales || [];
                    this.programaciones = [];
                    this.ciclos = [];
                    this.modalidades = [];
                    this.fechas = [];
                    this.regConfig.forEach(item => {
                        item.formControl.setValue(null);
                    });
                    this.setFiltros();
                }
            });
            this.setFiltros();

        this._proyeccionGrupoService.onProgramacionesChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                if(!!data){
                    this.programaciones = data?.programaciones;
                    this.ciclos = data?.ciclos;
                    this.modalidades = [];
                    this.fechas = [];
                    this.regConfig.forEach(item => {
                        if(!['sede'].includes(item.name))
                            item.formControl.setValue(null);
                    });
                    this.setFiltros();
                }
            });

        this._proyeccionGrupoService.onModalidadesChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                if(!!data){
                    this.modalidades = data?.modalidades;
                    this.fechas = [];
                    this.regConfig.forEach(item => {
                        if(!['sede','pa','ciclo'].includes(item.name))
                            item.formControl.setValue(null);
                    });
                    this.setFiltros();
                }
            });

        this._proyeccionGrupoService.onFechasChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                if (!!data) {
                    this.fechas = data?.fechas.map(fecha => { return { fecha: moment(fecha).format('DD/MM/YYYY') } });

                    this.regConfig.forEach(item => {
                        if (!['sede', 'pa', 'ciclo', 'modalidad'].includes(item.name)) {
                            item.formControl.setValue(null);
                        }
                    });

                    this.setFiltros();
                }
            });

        this._proyeccionGrupoService.onGruposChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                if(!!data && data.length > 0){
                    this.proyecciones = data;
                    this.numeroGrupos = this.proyecciones.length;
                    this.numeroInscripciones = 0;
                    this.proyecciones.forEach( proyeccion => { this.numeroInscripciones += proyeccion.inscritos; });
                    this.listado = false;
                } else{
                    this.programaciones = [];
                    this.listado = true;
                }
            });
    }

    setFiltros(): void {
        let config: FieldConfig[] = [];
        //Backup selected fields
        let selected = {};
        this.regConfig.forEach((item: FieldConfig) =>{ selected[item.name] = item.formControl?.value });
        this.config.paginatorSize = 100;
        if(this.sedes.length > 0){
            config.push({
                type: "pixvsMatSelect",
                label: "Sede",
                name: "sede",
                formControl: new FormControl(selected['sede'] || null, [Validators.required]),
                validations: [],
                multiple: false,
                selectAll: false,
                list: this.sedes,
                campoValor: 'nombre',
            });
        }
        if(this.programaciones.length > 0){
            config.push({
                type: "pixvsMatSelect",
                label: "Programación",
                name: "pa",
                formControl: new FormControl(selected['pa'] || null),
                validations: [],
                multiple: false,
                selectAll: false,
                list: this.programaciones,
                campoValor: 'nombre',
            });
        }
        if(this.ciclos.length > 0){
            config.push({
                type: "pixvsMatSelect",
                label: "Ciclo",
                name: "ciclo",
                formControl: new FormControl(selected['ciclo'] || null),
                validations: [],
                multiple: false,
                selectAll: false,
                list: this.ciclos,
                campoValor: 'codigo',
            });
        }
        if(this.modalidades.length > 0){
            config.push({
                type: "pixvsMatSelect",
                label: "Modalidad",
                name: "modalidad",
                formControl: new FormControl(selected['modalidad'] || null, [Validators.required]),
                validations: [],
                multiple: false,
                selectAll: false,
                list: this.modalidades,
                campoValor: 'nombre',
            });
        }
        if(this.fechas.length > 0){
            config.push({
                type: "pixvsMatSelect",
                label: "Fecha fin",
                name: "fechaFin",
                formControl: new FormControl(selected['fechaFin'] || null, [Validators.required]),
                validations: [],
                multiple: false,
                selectAll: false,
                list: this.fechas,
                campoValor: 'fecha',
            });
        }

        this.regConfig = [...config];
        this.setSubscripcionesFiltros();
    }

    setSubscripcionesFiltros(): void {
        this.subscripcionesFiltros.next();
        this.subscripcionesFiltros.complete();
        let field: FormControl = null;
        field = this.regConfig.find( item => item.name === 'sede')?.formControl;
        if(field){
            field.valueChanges
            .pipe(takeUntil(this.subscripcionesFiltros))
            .subscribe((data) => {
                if(!!data){
                    let sedeId: number = Number(data?.id)
                    this._proyeccionGrupoService.getProgramacionBySede(sedeId || 0);
                }
            });
        }
        field = this.regConfig.find( item => item.name === 'pa')?.formControl;
        if(field){
            field.valueChanges
            .pipe(takeUntil(this.subscripcionesFiltros))
            .subscribe((data) => {
                if(!!data){
                    let sede = this.regConfig.find( item => item.name === 'sede')?.formControl?.value || {};
                    let sedeId: number = Number(sede?.id)
                    this._proyeccionGrupoService.getModalidadBySedeAndCiclo(sedeId, data?.id || 0, 0);
                }
            });
        }
        field = this.regConfig.find( item => item.name === 'ciclo')?.formControl;
        if(field){
            field.valueChanges
            .pipe(takeUntil(this.subscripcionesFiltros))
            .subscribe((data) => {
                if(!!data){
                    let sede = this.regConfig.find( item => item.name === 'sede')?.formControl?.value || {};
                    let sedeId: number = Number(sede?.id)
                    this._proyeccionGrupoService.getModalidadBySedeAndCiclo(sedeId, 0, data?.id || 0);
                }
            });
        }
        field = this.regConfig.find( item => item.name === 'modalidad')?.formControl;
        
        if (field) {
            field.valueChanges
                .pipe(takeUntil(this.subscripcionesFiltros))
                .subscribe((data) => {
                    if (!!data) {
                        let sede = this.regConfig.find(item => item.name === 'sede')?.formControl?.value || {};
                        let pa = this.regConfig.find(item => item.name === 'pa')?.formControl?.value || {};
                        let ciclo = this.regConfig.find(item => item.name === 'ciclo')?.formControl?.value || {};
                        let sedeId: number = Number(sede?.id)
                        this._proyeccionGrupoService.getFechasBySedeAndCicloAndModalidad(sedeId, pa?.id || 0, ciclo?.id || 0, data?.id || 0);
                    }
                });
        }
    }

    generarProyecciones(event){
        if ( this.selection.selected.length > 0 ){
            this._proyeccionGrupoService.getProyecciones(this.selection.selected.map(item => item.id));
        } else
            this._matSnackBar.open('Seleccione uno o mas grupos.', 'OK', { duration: 5000 });
    }

    proyectar(){
        let g: number[] = this.proyecciones.map(item => item.id);
        this._proyeccionGrupoService.proyectar(g).then((response) => {
            if( !!response.data && response.data.length > 0 ) {
                let dialogData: ErroresDialogData = {
                    response: response?.data || [],
                    onAceptar: this.aceptarDialog.bind(this)
                };
                const dialogRef = this.dialog.open(ErroresDialogComponent, {
                    width: '800px',
                    data: dialogData,
                    disableClose: true
                });
                dialogRef.afterClosed().subscribe(result => {
                    this.aceptarDialog();
                });
            }
        });
    }

    regresar(){
        this._proyeccionGrupoService.cargando = true;
        this.proyecciones = [];
        this.listado = true;
    }

    aceptarDialog(){
        this._matSnackBar.open('Grupos creados', 'OK', { duration: 5000 });
        this.proyecciones = [];
        this._proyeccionGrupoService.datos = null;
        this.listado = true;
    }
}