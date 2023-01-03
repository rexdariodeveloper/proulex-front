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
    selector: 'existencias-listado',
    templateUrl: './existencias.component.html',
    styleUrls: ['./existencias.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ExistenciasComponent {
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

    data: any[] = [];
    headers: PixvsMatAccordionCell[] = [
        {name:'Código',value:'codigo',flex:'0 0 11%'},
        {name:'ISBN',value:'isbn',flex:'0 0 11%'},
        {name:'Editorial',value:'editorial',flex:'0 0 11%'},
        {name:'Artículo',value:'articulo',flex:'0 0 27%'},
        {name:'UM',value:'um',flex:'0 0 8%'},
        {name:'Existencia almacén',value:'existencia',flex:'0 0 8%',type:'decimal2'},
        {name:'En tránsito',value:'transito',flex:'0 0 8%',type:'decimal2'},
        {name:'Total',value:'total',flex:'0 0 8%',type:'decimal2'},
        {name:'Valor de inventario',value:'costo',flex:'0 0 8%',type:'money'}
    ];

    details: PixvsMatAccordionCell[] = [
        {name:'Almacén',value:'almacen',flex:'0 0 25%'},
        {name:'Localidad',value:'localidad',flex:'0 0 25%'},
        {name:'Existencia Almacén',value:'existencia',flex:'0 0 10%',type:'decimal2'},
        {name:'En tránsito',value:'transito',flex:'0 0 10%',type:'decimal2'},
        {name:'Total',value:'totalExistencia',flex:'0 0 10%',type:'decimal2'},
        {name:'Costo',value:'costo',flex:'0 0 10%',type:'money'},
        {name:'Costo total',value:'total',flex:'0 0 10%',type:'money'}
    ]

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
                                type: "input",
                                label: this.translate.instant('FECHA'),
                                inputType: "date",
                                name: "fechaFin",
                                validations: []
                            },
                            {
                                type: "pixvsMatSelect",
                                label: this.translate.instant('ARTICULO'),
                                name: "articulos",
                                formControl: new FormControl(null, [Validators.required]),
                                validations: [],
                                multiple: true,
                                selectAll: false,
                                list: datos.articulos,
                                campoValor: 'nombreArticulo',
                                values: ['codigoArticulo', 'nombreArticulo']
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
                                type: "checkbox",
                                label: "Existencia cero",
                                name: "ceros"
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
                            url: '/api/v1/existencias/download/excel'
                        }];
                    }
                    else if(datos){
                        let articulos = [];
                        datos.forEach(dato => {
                            if(!articulos.includes(dato.nombre))
                                articulos.push(dato.nombre);
                        });

                        let rows = [];
                        articulos.forEach(art => {
                            let children = datos.filter(dato => dato.nombre == art);
                            
                            let row = {};
                            row['children'] = children;
                            row['articulo'] = children[0].nombre;
                            row['codigo'] = children[0].codigo;
                            row['isbn'] = children[0].isbn;
                            row['editorial'] = children[0].editorial;
                            row['um'] = children[0].um;
                            row['existencia'] = 0.00;
                            row['transito'] = 0.00;
                            row['total'] = 0.00;
                            row['costo'] = 0.00;

                            children.forEach(child => {
                                row['existencia'] += Number(child.existencia);
                                row['transito'] += Number(child.transito);
                                row['total'] += Number(child.totalExistencia);
                                row['costo'] += Number(child.total);
                            });

                            rows.push(row);
                        });
                        this.data = [].concat(rows);
                        
                        if(datos[0]?.costo != null){
                            this.headers = [
                                {name:'Código',value:'codigo',flex:'0 0 11%'},
                                {name:'ISBN',value:'isbn',flex:'0 0 11%'},
                                {name:'Editorial',value:'editorial',flex:'0 0 11%'},
                                {name:'Artículo',value:'articulo',flex:'0 0 27%'},
                                {name:'UM',value:'um',flex:'0 0 8%'},
                                {name:'Existencia almacén',value:'existencia',flex:'0 0 8%',type:'decimal2'},
                                {name:'En tránsito',value:'transito',flex:'0 0 8%',type:'decimal2'},
                                {name:'Total',value:'total',flex:'0 0 8%',type:'decimal2'},
                                {name:'Valor de inventario',value:'costo',flex:'0 0 8%',type:'money'}
                            ];

                            this.details = [
                                {name:'Almacén',value:'almacen',flex:'0 0 25%'},
                                {name:'Localidad',value:'localidad',flex:'0 0 25%'},
                                {name:'Existencia Almacén',value:'existencia',flex:'0 0 10%',type:'decimal2'},
                                {name:'En tránsito',value:'transito',flex:'0 0 10%',type:'decimal2'},
                                {name:'Total',value:'totalExistencia',flex:'0 0 10%',type:'decimal2'},
                                {name:'Costo',value:'costo',flex:'0 0 10%',type:'money'},
                                {name:'Costo total',value:'total',flex:'0 0 10%',type:'money'}
                            ];
                        }
                        else {
                            this.headers = [
                                {name:'Código',value:'codigo',flex:'0 0 13%'},
                                {name:'ISBN',value:'isbn',flex:'0 0 13%'},
                                {name:'Editorial',value:'editorial',flex:'0 0 13%'},
                                {name:'Artículo',value:'articulo',flex:'0 0 29%'},
                                {name:'UM',value:'um',flex:'0 0 8%'},
                                {name:'Existencia almacén',value:'existencia',flex:'0 0 8%',type:'decimal2'},
                                {name:'En tránsito',value:'transito',flex:'0 0 8%',type:'decimal2'},
                                {name:'Total',value:'totalExistencia',flex:'0 0 8%',type:'decimal2'}
                            ];

                            this.details = [
                                {name:'Almacén',value:'almacen',flex:'0 0 35%'},
                                {name:'Localidad',value:'localidad',flex:'0 0 35%'},
                                {name:'Existencia Almacén',value:'existencia',flex:'0 0 10%',type:'decimal2'},
                                {name:'En tránsito',value:'transito',flex:'0 0 10%',type:'decimal2'},
                                {name:'Total',value:'totalExistencia',flex:'0 0 10%',type:'decimal2'}
                            ];
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