import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { ExamenesCertificacionesService } from './examenes-certificaciones.service';
import { HttpService } from '@services/http.service';
import { FichasDataService } from '@services/fichas-data.service';
import { JsonResponse } from '@models/json-response';
import { MatDialog } from '@angular/material/dialog';
import { DetailDialogComponent, DetailDialogData } from './dialogs/detail/detail.dialog';

@Component({
    selector: 'examenes-certificaciones-listado',
    templateUrl: './examenes-certificaciones.component.html',
    styleUrls: ['./examenes-certificaciones.component.scss']
})
export class ExamenesCertificacionesListadoComponent {

    selection = new SelectionModel<any>(true, []);
    private _unsubscribeAll: Subject < any > ;
    regConfig: FieldConfig[] = [];

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "view_list",
        columnaId: 'id',
        rutaDestino: null,
        ocultarBotonNuevo:true,
        columns: [
            { name: 'fecha', title: 'Fecha', class: "mat-column-100", centrado: false, type: 'fecha' },
            { name: 'codigo', title: 'Orden de venta', class: "mat-column-100", centrado: false, type: null },
            { name: 'alumno', title: 'Alumno', class: "mat-column-150", centrado: false, type: null, tooltip: true },
            { name: 'articulo', title: 'Artículo', class: "mat-column-150", centrado: false, type: null,tooltip: true },
            { name: 'nivel', title: 'Nivel', class: "mat-column-100", centrado: false, type: null },
            { name: 'calificacion', title: 'Calificación', class: "mat-column-100", centrado: false, type: 'decimal2' },
            { name: 'acciones', title: 'Acciones', class:"mat-column-100", centrado: true, type: 'acciones' }
        ],
        displayedColumns: ['fecha', 'codigo', 'alumno', 'articulo', 'nivel', 'calificacion','acciones'],
        columasFechas: ['fecha'],
        listadoMenuOpciones: [],
        listadoAcciones: [{title: 'Capturar resultado', tipo: 'button', icon: 'assignment', accion: this.onOpenModal.bind(this)}]
    };

    fechaInicio: string;
    fechaFin: string;
    datos: any[];
    isLoading: boolean = true;
    constructor(public _examenesCertiicacionesService: ExamenesCertificacionesService,
                public _fichasDataService: FichasDataService,
                private _matSnackBar: MatSnackBar,
                public dialog: MatDialog,
                private ref: ChangeDetectorRef
                ) {
        this._unsubscribeAll = new Subject(); 
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this._examenesCertiicacionesService.onListadosChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((datos) => {
            let filtros: FieldConfig[] = []
            /*
            if(!!datos?.alumnos){
                filtros.push({
                    type: "pixvsMatSelect",
                    label: "Alumnos",
                    name: "alumno",
                    formControl: new FormControl(null,[]),
                    validations: [],
                    multiple: false,
                    selectAll: false,
                    elementsPerScroll: 100,
                    list: datos?.alumnos || [],
                    campoValor: 'nombre',
                });
            }*/
            filtros.push({
                type: "input",
                label: "Código de alumno",
                name: "codigo",
                formControl: new FormControl(null,[]),
                validations: []
            });
            if(!!datos?.tipos){
                filtros.push({
                    type: "pixvsMatSelect",
                    label: "Tipo de exámen",
                    name: "tipo",
                    formControl: new FormControl(null,[]),
                    validations: [],
                    multiple: false,
                    selectAll: false,
                    list: datos?.tipos || [],
                    campoValor: 'valor',
                });
            }
            if(!!datos?.estatus){
                filtros.push({
                    type: "pixvsMatSelect",
                    label: "Estatus",
                    name: "estatus",
                    formControl: new FormControl(null,[]),
                    validations: [],
                    multiple: false,
                    selectAll: false,
                    list: datos?.estatus || [],
                    campoValor: 'valor',
                });
            }
            this.regConfig = [...filtros];
            this.ref.detectChanges();
            this.isLoading = false;
        });

        this._examenesCertiicacionesService.onDatosChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(enviar => {
            if(enviar){
                this._fichasDataService.cargando = false;
                this._fichasDataService.getDatos();
            }
        });

        this._examenesCertiicacionesService.getListados();
    }

    onOpenModal(event){
        let dialogData: DetailDialogData = {
            id: event?.id,
            onAceptar: this.onSaveChanges.bind(this)
        };

        const dialogRef = this.dialog.open(DetailDialogComponent, {
            width: '600px',
            data: dialogData,
            disableClose: true
        });
    }

    onSaveChanges(data){
        //Remove unnnecesary properties
        data.fechaCreacion = undefined;
        data.alumnoMostrar = undefined;
		data.articuloMostrar = undefined;
		data.fecha = undefined;
		data.codigo = undefined;
        data.ordenVentaDetalle = undefined;

        this._fichasDataService.guardar(data,"/api/v1/examenes-certificaciones/save").then( value => {
            if(value?.status == 200)
                this._matSnackBar.open("Registro actualizado exitosamente!", 'OK', {duration: 5000,});
            this._fichasDataService.getDatos();
        });
    }
}