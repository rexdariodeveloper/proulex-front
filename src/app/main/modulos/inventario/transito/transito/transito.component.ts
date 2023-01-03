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
    selector: 'articulos-transito',
    templateUrl: './transito.component.html',
    styleUrls: ['./transito.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class TransitoComponent {
    @ViewChild('localidades', { static: true }) localidadSelect: PixvsMatSelectSimpleComponent;
    @ViewChild('filtrado', {static: true}) filtrado: FiltrosReporteSidebarComponent;   

    filtros: FieldConfig[];
    filtrosOpciones: any;
    private _unsubscribeAll: Subject<any>;

    config: FichaListadoConfig;

    data: any[] = [];
    headers: PixvsMatAccordionCell[] = [
        {name:'Almacén / Localidad',value:'recibe',flex:'0 0 40%'},
        {name:'Movimientos',value:'movimiento',flex:'0 0 20%'},
        {name:'Cantidad',value:'cantidad',flex:'0 0 20%',type:'decimal2'},
        {name:'Valor de inventario',value:'costo',flex:'0 0 20%',type:'money'}
    ];

    details: PixvsMatAccordionCell[] = [
        {name:'Código',value:'codigo',flex:'0 0 15%'},
        {name:'Nombre',value:'nombre',flex:'0 0 20%'},
        {name:'Unidad',value:'unidad',flex:'0 0 10%'},
        {name:'Cantidad',value:'cantidad',flex:'0 0 10%',type:'decimal2'},
        {name:'Movimiento',value:'movimientos',flex:'0 0 20%'},
        {name:'Costo',value:'costo',flex:'0 0 10%',type:'money'},
        {name:'Costo total',value:'total',flex:'0 0 15%',type:'money'}
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
                        this.filtros = [
                            {
                                type: "pixvsMatSelect",
                                label: this.translate.instant('FILTRO.ALMACEN'),
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
                    }
                    else if(datos){
                        debugger;
                        let localidades = [];
                        datos.forEach(dato => {
                            if(!localidades.includes(dato.recibe))
                                localidades.push(dato.recibe);
                        });

                        let rows = [];
                        localidades.forEach(loc => {
                            let children = datos.filter(dato => dato.recibe === loc);
                            
                            let row = {};
                            row['recibe'] = children[0].recibe;
                            row['movimiento'] = children.length;
                            row['cantidad'] = 0.00;
                            row['costo'] = 0.00;

                            
                            let lArticulos = [];
                            let movimientos = [];
                            children.forEach(child => {
                                if(!lArticulos.includes(child.codigoArticulo))
                                    lArticulos.push(child.codigoArticulo);
                                
                                if(!movimientos.includes(child.referencia))
                                    movimientos.push(child.referencia)

                                row['cantidad'] += Number(child.cantidad);
                                row['costo'] += Number(child.total);
                            });

                            /** Agrupar Artículos **/
                            let articulos = [];
                            lArticulos.forEach(codigo => {
                                let arts = children.filter(child => child.codigoArticulo === codigo);

                                let art = {};
                                art['codigo'] = arts[0].codigoArticulo;
                                art['nombre'] = arts[0].nombreArticulo;
                                art['unidad'] = arts[0].unidad;
                                
                                art['cantidad'] = 0;
                                art['movimientos'] = '';
                                art['costo'] = arts[0].costo;
                                art['total'] = 0;

                                arts.forEach(a => {
                                    art['cantidad'] += a.cantidad;
                                    art['total'] += a.total;
                                });

                                art['movimientos'] = arts.map(a => a.referencia).join(', ');
                                articulos.push(art);
                            });

                            row['children'] = articulos;
                            row['extras'] = [{name: 'Movimientos:', value: movimientos.join(' ')}];
                            rows.push(row);
                        });
                        this.data = [].concat(rows);
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