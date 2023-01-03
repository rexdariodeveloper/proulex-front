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

@Component({
    selector: 'valuacion-reporte',
    templateUrl: './valuacion.component.html',
    styleUrls: ['./valuacion.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ValuacionComponent {
    @ViewChild('localidades', { static: true }) localidadSelect: PixvsMatSelectSimpleComponent;
    @ViewChild('filtrado', {static: true}) filtrado: FiltrosReporteSidebarComponent;   

    filtros: FieldConfig[];
    filtrosOpciones: any;
    private _unsubscribeAll: Subject<any>;

    almacenControl: FormControl = new FormControl();
    localidadControl: FormControl = new FormControl();
    localidades: any[] = [];
    listadoLocalidades: any[] = [];
    url: string = null;

    config: FichaListadoConfig;

    dataArticulo: any = {
        headers: [
            {name:'Código',value:'codigo',flex:'0 0 15%'},
            {name:'ISBN',value:'isbn',flex:'0 0 15%'},
            {name:'Editorial',value:'editorial',flex:'0 0 15%'},
            {name:'Artículo',value:'articulo',flex:'0 0 31%'},
            {name:'UM',value:'um',flex:'0 0 8%'},
            {name:'Existencia',value:'existencia',flex:'0 0 8%',type:'decimal2'},
            {name:'Valor de inventario',value:'costo',flex:'0 0 8%',type:'money'}
        ],
        details: [
            {name:'Almacén',value:'almacen',flex:'0 0 30%'},
            {name:'Localidad',value:'localidad',flex:'0 0 30%'},
            {name:'Existencia',value:'existencia',flex:'0 0 10%',type:'decimal2'},
            {name:'Costo',value:'costo',flex:'0 0 15%',type:'money'},
            {name:'Costo total',value:'total',flex:'0 0 15%',type:'money'}
        ],
        data: []
    };

    dataSerie: any = {
        headers: [
            {name:'Código',value:'codigo',flex:'0 0 15%'},
            {name:'ISBN',value:'isbn',flex:'0 0 15%'},
            {name:'Editorial',value:'editorial',flex:'0 0 15%'},
            {name:'Artículo',value:'articulo',flex:'0 0 31%'},
            {name:'UM',value:'um',flex:'0 0 8%'},
            {name:'Existencia',value:'existencia',flex:'0 0 8%',type:'decimal2'},
            {name:'Valor de inventario',value:'costo',flex:'0 0 8%',type:'money'}
        ],
        details: [
            {name:'Almacén',value:'almacen',flex:'0 0 30%'},
            {name:'Localidad',value:'localidad',flex:'0 0 30%'},
            {name:'Existencia',value:'existencia',flex:'0 0 10%',type:'decimal2'},
            {name:'Costo',value:'costo',flex:'0 0 15%',type:'money'},
            {name:'Costo total',value:'total',flex:'0 0 15%',type:'money'}
        ],
        data: []
    };

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
                    if (datos?.datos) {
                        this.almacenControl = new FormControl(null);
                        this.localidadControl = new FormControl(null);

                        this.localidades = datos.localidades;

                        this.almacenControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                            let almacenesId: any[] = this.almacenControl.value;
                            
                            this.listadoLocalidades = [];
                            this.localidadControl.setValue(null);

                            if (almacenesId.length > 0) {
                                almacenesId.forEach(almacen => {
                                    let localidades = this.localidades.filter(registro => { return registro.almacen.id == almacen.id && !registro.localidadGeneral });

                                    if (localidades.length > 0) {
                                        this.listadoLocalidades.push(localidades);
                                    }
                                });
                            }
                        });

                        this.filtros = [
                            {
                                type: "pixvsMatSelect",
                                label: "Tipo",
                                name: "tipo",
                                formControl: new FormControl(null, [Validators.required]),
                                validations: [],
                                multiple: false,
                                selectAll: false,
                                list: [{id:0, name:"Por serie"},{id:1, name:"Por artículo"}],
                                campoValor: 'name',
                                values: ['name']
                            },
                            {
                                type: "input",
                                label: this.translate.instant('FECHA_INICIO'),
                                inputType: "date",
                                name: "fechaInicio"
                            },
                            {
                                type: "input",
                                label: this.translate.instant('FECHA_FIN'),
                                inputType: "date",
                                name: "fechaFin"
                            },
                            {
                                type: "pixvsMatSelect",
                                label: this.translate.instant('ARTICULO'),
                                name: "articulos",
                                formControl: new FormControl(null),
                                validations: [],
                                multiple: true,
                                selectAll: false,
                                list: datos.articulos,
                                campoValor: 'nombreArticulo',
                                values: ['codigoArticulo', 'nombreArticulo'],
                                hideOnDisabled: true
                            },
                            {
                                type: "pixvsMatSelect",
                                label: "Serie",
                                name: "series",
                                formControl: new FormControl(null),
                                validations: [],
                                multiple: true,
                                selectAll: false,
                                list: datos.series,
                                campoValor: 'valor',
                                values: ['valor'],
                                hideOnDisabled: true
                            },
                            {
                                type: "pixvsMatSelect",
                                label: this.translate.instant('ALMACEN/LOCALIDAD'),
                                name: "localidades",
                                formControl: new FormControl(null),
                                validations: [],
                                multiple: true,
                                selectAll: false,
                                list: datos.localidades,
                                campoValor: 'nombre',
                                values: ['almacen.nombre', 'nombre']
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
                            url: '/api/v1/valuacion/xls'
                        }];
                    }
                    else if(datos){
                        if(datos?.url){
                            this.url = datos.url;
                            this.dataArticulo.data = [];
                            this.dataSerie.data = [];
                            this._fuseSidebarService.getSidebar('filtros-reporte-sidebar').close();
                        }
                        else if(datos.length > 0){
                            let grupos = [];
                            datos.forEach(dato => {
                                if(!grupos.includes(dato.almacenLocalidad))
                                    grupos.push(dato.almacenLocalidad);
                            });

                            //Por serie
                            if(!!datos[0].serie){
                                let rows = [];
                                grupos.forEach(grupo => {
                                    let children = datos.filter(dato => dato.almacenLocalidad == grupo);
                                    
                                    let row = {};
                                    row['children'] = children;
                                    row['almacen'] = children[0].almacenLocalidad;
                                    row['existencia'] = 0.00;
                                    row['ctotal'] = 0.00;

                                    children.forEach(child => {
                                        row['existencia'] += Number(child.cantidadFinal);
                                        row['ctotal'] += Number(child.costoFinal);
                                    });

                                    rows.push(row);
                                });
                                this.dataArticulo.data = [];
                                this.dataSerie.data = [...rows];
                                
                                this.dataSerie.headers = [
                                    {name:'Almacén / Localidad',value:'almacen',flex:'0 0 60%'},
                                    {name:'Existencia',value:'existencia',flex:'0 0 20%',type:'decimal2'},
                                    {name:'Valor de inventario',value:'ctotal',flex:'0 0 20%',type:'money'}
                                ];

                                this.dataSerie.details = [
                                    {name:'Serie',value:'serie',flex:'0 0 40%'},
                                    {name:'Unidad',value:'unidad',flex:'0 0 10%'},
                                    {name:'Costo',value:'costo',flex:'0 0 10%',type:'money'},
                                    {name:'Existencia inicial',value:'cantidadInicial',flex:'0 0 10%',type:'decimal2'},
                                    {name:'Existencia final',value:'cantidadFinal',flex:'0 0 10%',type:'decimal2'},
                                    {name:'Costo inicial',value:'costoInicial',flex:'0 0 10%',type:'money'},
                                    {name:'Costo final',value:'costoFinal',flex:'0 0 10%',type:'money'}
                                ];
                            }
                            //Por artículo
                            else{
                                let rows = [];
                                grupos.forEach(grupo => {
                                    let children = datos.filter(dato => dato.almacenLocalidad == grupo);
                                    
                                    let row = {};
                                    row['children'] = children;
                                    row['almacen'] = children[0].almacenLocalidad;
                                    row['existencia'] = 0.00;
                                    row['ctotal'] = 0.00;

                                    children.forEach(child => {
                                        row['existencia'] += Number(child.existencia);
                                        row['ctotal'] += Number(child.ctotal);
                                    });

                                    rows.push(row);
                                });
                                this.dataSerie.data = [];
                                this.dataArticulo.data = [...rows];
                                
                                this.dataArticulo.headers = [
                                    {name:'Almacén / Localidad',value:'almacen',flex:'0 0 60%'},
                                    {name:'Existencia',value:'existencia',flex:'0 0 20%',type:'decimal2'},
                                    {name:'Valor de inventario',value:'ctotal',flex:'0 0 20%',type:'money'}
                                ];

                                this.dataArticulo.details = [
                                    {name:'Código',value:'codigo',flex:'0 0 15%'},
                                    {name:'Nombre',value:'nombre',flex:'0 0 25%'},
                                    {name:'Unidad',value:'unidad',flex:'0 0 10%'},
                                    {name:'Costo',value:'costo',flex:'0 0 10%',type:'money'},
                                    {name:'Existencia inicial',value:'inicial',flex:'0 0 10%',type:'decimal2'},
                                    {name:'Existencia final',value:'existencia',flex:'0 0 10%',type:'decimal2'},
                                    {name:'Costo inicial',value:'cinicial',flex:'0 0 10%',type:'money'},
                                    {name:'Costo final',value:'ctotal',flex:'0 0 10%',type:'money'}
                                ];
                            }
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
}