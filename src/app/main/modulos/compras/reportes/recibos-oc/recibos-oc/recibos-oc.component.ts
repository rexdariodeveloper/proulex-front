import { K } from '@angular/cdk/keycodes';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { PixvsMatAccordionCell } from '@pixvs/componentes/mat-accordion/mat-accordion.component';
import { PixvsMatSelectSimpleComponent } from '@pixvs/componentes/mat-select-search-simple/mat-select-search-simple.component';
import { FichasDataService } from '@services/fichas-data.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { FiltrosReporteSidebarComponent } from './sidebars/main/filtros-reporte-sidebar.component';


export class DataGrouper {
    columnName: string;
    columnReplace: string;
    type: 'group' | 'sum' | 'rowCount';

    constructor(p0, p1, p2){
        this.columnName = p0;
        this.columnReplace = p1;
        this.type = p2;
    }
}

export class AccordionData {
    data: any[];
    headers: PixvsMatAccordionCell[];
    details: PixvsMatAccordionCell[];
    groups: DataGrouper[];
}

@Component({
    selector: 'recibos-oc-reporte',
    templateUrl: './recibos-oc.component.html',
    styleUrls: ['./recibos-oc.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class RecibosOCComponent {
    @ViewChild('localidades', { static: true }) localidadSelect: PixvsMatSelectSimpleComponent;
    @ViewChild('filtrado', {static: true}) filtrado: FiltrosReporteSidebarComponent;   

    filtros: FieldConfig[];
    filtrosOpciones: any;
    private _unsubscribeAll: Subject<any>;

    almacenControl: FormControl = new FormControl();
    localidadControl: FormControl = new FormControl();
    localidades: any[] = [];
    listadoLocalidades: any[] = [];

    config: FichaListadoConfig;

    recibosData: AccordionData = new AccordionData();
    pendientesData: AccordionData = new AccordionData();

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _fuseSidebarService: FuseSidebarService,
        private translate: TranslateService,
        public _fichasDataService: FichasDataService) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);
		
		this.config = {
			localeEN: english,
			localeES: spanish,
			icono: "toc",
			columnaId: "id",
			rutaDestino: "",
			columns: [
				{
					name: 'articulo',
					title: this.translate.instant('ARTICULO'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},
				{
					name: 'um',
					title: this.translate.instant('UM'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},
				{
					name: 'almacen',
					title: this.translate.instant('ALMACEN'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},
				{
					name: 'localidad',
					title: this.translate.instant('LOCALIDAD'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},
				{
					name: 'cantidad',
					title: this.translate.instant('CANTIDAD'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				}
			],
			reordenamiento: false,
			displayedColumns: ['articulo', 'um', 'almacen', 'localidad', 'cantidad'],
			columasFechas: [],
			listadoMenuOpciones: []
        };

        this.pendientesData.headers = [
            {name:'OC',value:'codigoOC',flex:'0 0 25%'},
            {name:'Fecha OC',value:'fechaOC',flex:'0 0 25%', type: 'fecha'},
            {name:'Proveedor',value:'proveedor',flex:'0 0 25%'},
            {name:'Partidas por recibir',value:'partidas',flex:'0 0 25%'}
        ];

        this.pendientesData.details = [
            {name:'Artículo',value:'articulo',flex:'0 0 20%'},
            {name:'Unidad',value:'um',flex:'0 0 20%'},
            {name:'Cantidad requerida',value:'cantidadRequerida',flex:'0 0 20%', type:'decimal2'},
            {name:'Cantidad recibida',value:'cantidadRecibida',flex:'0 0 20%', type:'decimal2'},
            {name:'Cantidad por recibir',value:'cantidadPendiente',flex:'0 0 20%', type:'decimal2'},
        ];

        this.pendientesData.groups = [
            {columnName: 'codigoOC',  columnReplace: 'codigoOC',  type: 'group'},
            {columnName: 'fechaOC',   columnReplace: 'fechaOC',   type: 'group'},
            {columnName: 'proveedor', columnReplace: 'proveedor', type: 'group'},
            {columnName: 'partidas',  columnReplace: 'partidas',  type: 'rowCount'}
        ];

        this.pendientesData.data = [];

        this.recibosData.headers = [
            {name:'OC',value:'codigoOC',flex:'0 0 25%'},
            {name:'Fecha OC',value:'fechaOC',flex:'0 0 25%', type: 'fecha'},
            {name:'Proveedor',value:'proveedor',flex:'0 0 25%'},
            {name:'Número de recibos',value:'partidas',flex:'0 0 25%'}
        ];

        this.recibosData.details = [
            {name:'Movimiento',value:'tipoMovimiento',flex:'0 0 10%'},
            {name:'Artículo',value:'articulo',flex:'0 0 10%'},
            {name:'Unidad',value:'um',flex:'0 0 10%'},
            {name:'Cantidad requerida',value:'cantidadRequerida',flex:'0 0 10%', type:'decimal2'},

            {name:'Fecha movimento',value:'fechaMovimiento',flex:'0 0 10%', type:'fecha-hora'},
            {name:'Cantidad movimiento',value:'cantidadMovimiento',flex:'0 0 10%', type:'decimal2'},
            {name:'Costo previo',value:'costoPrevio',flex:'0 0 10%', type:'money'},
            {name:'Costo recibo',value:'costoRecibir',flex:'0 0 10%', type:'money'},
            {name:'Almacén',value:'almacen',flex:'0 0 10%'},
            {name:'Localidad',value:'localidad',flex:'0 0 10%'}
        ];

        this.recibosData.groups = [
            {columnName: 'codigoOC',  columnReplace: 'codigoOC',  type: 'group'},
            {columnName: 'fechaOC',   columnReplace: 'fechaOC',   type: 'group'},
            {columnName: 'proveedor', columnReplace: 'proveedor', type: 'group'},
            {columnName: 'partidas',  columnReplace: 'partidas',  type: 'rowCount'}
        ];

        this.recibosData.data = [];

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this._fichasDataService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                datos => {
                    if (datos?.filtros) {

                        this.filtros = [
                            {
                                type: "input",
                                label: this.translate.instant('FILTROS.FECHA_INICIO'),
                                inputType: "date",
                                name: "fechaInicio",
                                validations: []
                            },
                            {
                                type: "input",
                                label: this.translate.instant('FILTROS.FECHA_FIN'),
                                inputType: "date",
                                name: "fechaFin",
                                validations: []
                            },
                            {
                                type: "input",
                                label: this.translate.instant('FILTROS.OC'),
                                inputType: "text",
                                name: "oc"
                            },
                            {
                                type: "pixvsMatSelect",
                                label: this.translate.instant('FILTROS.ARTICULO'),
                                name: "articulo",
                                formControl: new FormControl(null),
                                validations: [],
                                multiple: false,
                                selectAll: false,
                                list: datos.filtros.articulos,
                                campoValor: 'nombreArticulo',
                                values: ['codigoArticulo', 'nombreArticulo']
                            },
                            {
                                type: "pixvsMatSelect",
                                label: this.translate.instant('FILTROS.PROVEEDOR'),
                                name: "proveedor",
                                formControl: new FormControl(null),
                                validations: [],
                                multiple: false,
                                selectAll: false,
                                list: datos.filtros.proveedores,
                                campoValor: 'nombre',
                                values: ['codigo', 'nombre']
                            },
                            {
                                type: "pixvsMatSelect",
                                label: this.translate.instant('FILTROS.ALMACEN'),
                                name: "almacenes",
                                formControl: new FormControl(null),
                                validations: [],
                                multiple: false,
                                selectAll: false,
                                list: datos.filtros.almacenes,
                                campoValor: 'nombre',
                                values: ['nombre']
                            },
                            {
                                type: "pixvsMatSelect",
                                label: this.translate.instant('FILTROS.TIPO'),
                                name: "tipo",
                                formControl: new FormControl(null,[Validators.required]),
                                validations: [],
                                multiple: false,
                                selectAll: false,
                                list: [{id:0, name:'Por recibir'}, {id:1, name:'Recibido'}],
                                campoValor: 'name',
                                values: ['name']
                            },
                            {
                                type: "button",
                                label: "Save",
                                hidden: true
                            }
                        ];

                        this.filtrosOpciones = [{
                            title: 'EXCEL',
                            icon: 'arrow_downward',
                            tipo: FichaListadoConfig.EXCEL,
                            url: '/api/v1/reporte_oc/download/excel'
                        }];
                    }
                    else if(datos?.reporte){
                        if(datos?.tipo === 0){
                            this.pendientesData.data =  this.mergeData(datos?.reporte, this.pendientesData.groups);
                            this.recibosData.data = [];
                        } else {
                            this.pendientesData.data =  [];
                            this.recibosData.data = this.mergeData(datos?.reporte, this.recibosData.groups);
                        }
                    }
                }
            );
    }

    recargar(){
        this.filtrado.buscar();
    }

    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    mergeData(data: any[], groups: DataGrouper[]): any[] {
        let groupedData: any[] = [];
        
        data.forEach( d => {
            let row: any = {};
            let key: string = '';

            groups.forEach( g => {
                //Si la columna es del tipo 'grupo', pasarla a la cabecera y agregarla a la llave
                if(g.type === 'group'){
                    row[g.columnReplace] = d[g.columnName];
                    key += (d[g.columnName] || '');
                }
                //Si la columna es del tipo 'contador', inicializar a 1
                else if(g.type === 'rowCount')
                    row[g.columnReplace] = 1;

                //Pasar todo el registro a la propiedad 'children'
                row['children'] = [d];
            });

            //Utilizando la llave generada, se calcula un código hash único para cada llave
            row['hash'] = this.getHashCode(key);
            //Se busca si el código hash ya existe en los datos agrupados
            let group = groupedData.find( gd => gd?.hash === row.hash)

            if(group){
                //Por cada propiedad, excepto el código hash
                for( let k of Object.keys(group).filter( k => k !== 'hash')){
                    //Agregar los datos al arreglo 'children'
                    if(k === 'children')
                        group[k] = group[k].concat(row[k]);
                    //Aumentar los valores de las columnas acumulador
                    else{
                        if(typeof(group[k]) === 'number' && k.search('fecha') === -1)
                            group[k] += row[k];
                    }
                }
            }
            else
                groupedData.push(row);
        });

        return groupedData;
    }

    getHashCode(str: string) : number {
        let hash = 0;
        if(str.length === 0) return hash;
        for(let i = 0; i < str.length; i++){
            let c = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + c;
            hash |= 0;
        }
        return hash;
    }
}