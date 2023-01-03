import { Component, OnInit } from '@angular/core';
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
import { PrenominaService } from './prenomina-listado.service';
import { HttpService } from '@services/http.service';
import { FichasDataService } from '@services/fichas-data.service';
import { JsonResponse } from '@models/json-response';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'prenomina-listado',
    templateUrl: './prenomina-listado.component.html',
    styleUrls: ['./prenomina-listado.component.scss']
})
export class PrenominaListadoComponent {

    selection = new SelectionModel<any>(true, []);
    private _unsubscribeAll: Subject < any > ;
    regConfig: FieldConfig[];

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "add_shopping_cart",
        columnaId: null,
        rutaDestino: null,
        ocultarBotonNuevo:true,
        columns: [
            { name: 'codigoEmpleado', title: 'Código Empleado', class: "mat-column-120", centrado: false, type: null },
            { name: 'sucursal', title: 'Sede Grupo', class: "mat-column-100", centrado: false, type: null },
            { name: 'codigoGrupo', title: 'Curso', class: "mat-column-150", centrado: false, type: null },
            { name: 'empleado', title: 'Nombre Empleado', class: "mat-column-350", centrado: false, type: null,tooltip: true },
            { name: 'tabulador', title: 'Tabulador', class: "mat-column-80", centrado: false, type: null },
            { name: 'nombreGrupo', title: 'Grupo', class: "mat-column-100", centrado: false, type: null,tooltip: true },
            { name: 'horasPagadas', title: 'Horas', class: "mat-column-100", centrado: true, type: null },
            { name: 'percepcion', title: 'Percepciones', class: "mat-column-100", centrado: false, type: null },
            { name: 'deduccion', title: 'Deducciones', class: "mat-column-100", centrado: false, type: null },
            { name: 'idioma', title: 'Idioma', class: "mat-column-100", centrado: false, type: null }
        ],
        displayedColumns: ['codigoEmpleado', 'sucursal', 'codigoGrupo', 'empleado', 'tabulador','nombreGrupo', 'horasPagadas', 'percepcion', 'deduccion', 'idioma'],
        columasFechas: [],
        listadoMenuOpciones: [
                              //{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/prenomina/download/excel' },
                              { title: 'Generar Prenomina', icon: 'attach_money', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/prenomina/save' }  
                              ],
        etiquetaEnviar: 'Cerrar prenómina',
        mostrarBotonEnviar: true
    };

    fechaInicio: string;
    fechaFin: string;
    datos: any[];
    mySubscription;
    isLoading: boolean;

    quincenas: {id: number, nombre: string}[] = [];

    constructor(public _prenominaService: PrenominaService,
                public _fichasDataService: FichasDataService,
                private _httpClient: HttpService,
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
        this._fichasDataService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos?.datos) {
                    let sucursales = datos.sucursales;
                    this.regConfig = [{
                        type: "pixvsMatSelect",
                        label: "Sede",
                        name: "sucursales",
                        formControl: new FormControl(null,[Validators.required]),
                        validations: [],
                        multiple: false,
                        selectAll: false,
                        list: sucursales,
                        campoValor: 'nombre',
                    }];

                    this.regConfig[0]?.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                        this._prenominaService.cargando = true;
                        this.regConfig = [].concat(this.regConfig[0]);
                        this._prenominaService.getQuincenas(this.regConfig[0]?.formControl?.value?.id || 0);
                    });
                }
            });
            this._prenominaService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(enviar => {
                if(enviar){
                    this._fichasDataService.cargando = false;
                    this._fichasDataService.getDatos();
                }
            });

            this._prenominaService.onQuincenasChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((datos: any) => {
                if(datos != null){
                    this._prenominaService.onQuincenasChanged.next(null);
                    this.quincenas = (datos?.quincenas || []).map((quincena: any, i: number) => {
                        return {
                            id: i,
                            nombre: String(quincena.fechaInicio+' / '+quincena.fechaFin)
                        };
                    });
                    if(!!this.quincenas?.length){
                        this.regConfig = [].concat([this.regConfig[0],{
                            type: "pixvsMatSelect",
                            label: "Quincena",
                            name: "quincena",
                            formControl: new FormControl(this.quincenas[0],[Validators.required]),
                            validations: [],
                            multiple: false,
                            selectAll: false,
                            list: this.quincenas,
                            campoValor: 'nombre',
                        }]);
                    }
                }
            });
    }

    generarPrenomina(event){
        if(event.title == 'Generar Prenomina'){
            this.isLoading = true;
            try{
                let sucursal = this.regConfig[0].formControl.value;
                let fechas : string = this.regConfig[1].formControl.value.nombre
                let fechasArray: string[] = fechas.split(' / ');
                this._fichasDataService.getExcelConFiltros("/api/v1/prenomina/template/preReporte/generarNomina", {fechaInicio: fechasArray[0], fechaFin: fechasArray[1], sucursales: sucursal}).then(value =>{
                    this.isLoading = false;
                    let message = 'Archivo de validación generado';
                    this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
                });
            }catch(e){
                this.isLoading = false;
                let message = 'Selecciona la quincena y sede';
                this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });   
            }
        }
    }

    onCerrarPrenomina(){
        if(!this.regConfig[0]?.formControl?.value || !this.regConfig[1]?.formControl?.value?.nombre?.split){
            this.isLoading = false;
            let message = 'Selecciona la quincena y sede';
            this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
            return;
        }
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
			width: '400px',
			data: {
				titulo: 'Cerrar prenómina',
				mensaje: 'Los registros de la quincena se marcaran como pagados ¿Estas seguro de continuar?'
			}
		});

		dialogRef.afterClosed().subscribe(confirm => {
			if (confirm) {
                this.isLoading = true;
                let sucursal = this.regConfig[0].formControl.value;
                let fechas : string = this.regConfig[1].formControl.value.nombre
                let fechasArray: string[] = fechas.split(' / ');
                this._fichasDataService.getExcelConFiltros("/api/v1/prenomina/template/generarNomina", {fechaInicio: fechasArray[0], fechaFin: fechasArray[1], sucursales: sucursal}).then(value =>{
                    this._fichasDataService.getDatos();
                    this.selection = new SelectionModel<any>(true, []);
                    let message = 'Prenómina generada';
                    this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
                    this.router.navigate(['/app/control-escolar/prenomina']);
                });
			}
		});
    }
    
}