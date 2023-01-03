import { Component, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichasDataService } from '@services/fichas-data.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

@Component({
    selector: 'contable-inventarios',
    templateUrl: './contable-inventarios.component.html',
    styleUrls: ['./contable-inventarios.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ContableInventariosComponent {

    filtros: FieldConfig[];
    filtrosOpciones: any;
    private _unsubscribeAll: Subject<any>;

    almacenControl: FormControl = new FormControl();
    localidadControl: FormControl = new FormControl();
    localidades: any[] = [];
    listadoLocalidades: any[] = [];
    url: string = null;

    config: FichaListadoConfig;

    dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
	displayedColumns: string[] = ['fecha', 'articulo', 'almacenLocalidad', 'tipoMovimiento', 'referencia', 'razon', 'usuario', 'existenciaAnterior', 'salida', 'entrada','total', 'costo'];

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
        public _fichasDataService: FichasDataService,
        private _fuseSidebarService: FuseSidebarService) {
        
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		this.config = {
			localeEN: english,
			localeES: spanish,
			icono: "assignment",
			columnaId: "id",
			rutaDestino: "",
			columns: [

                {
					name: 'fecha',
					title: this.translate.instant('FECHA'),
					class: "mat-column-flex",
					centrado: false,
					type: "fecha-hora",
					tooltip: false
				},
				{
					name: 'articulo',
					title: this.translate.instant('ARTICULO'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},
				{
					name: 'almacenLocalidad',
					title: this.translate.instant('ALMACEN/LOCALIDAD'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
                },
                {
					name: 'tipoMovimiento',
					title: this.translate.instant('TIPO_MOVIMIENTO'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
                },
                {
					name: 'referencia',
					title: this.translate.instant('REFERENCIA'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},
				{
					name: 'razon',
					title: this.translate.instant('RAZON'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
                },
                {
					name: 'usuario',
					title: this.translate.instant('USUARIO'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},
				{
					name: 'existenciaAnterior',
					title: this.translate.instant('EXISTENCIA_ANTERIOR'),
					class: "mat-column-flex",
                    centrado: true,
                    dir:'center',
					type: null,
					tooltip: false
                },
				{
					name: 'entrada',
					title: this.translate.instant('ENTRADA'),
					class: "mat-column-flex",
                    centrado: true,
                    dir:'center',
					type: null,
					tooltip: false
                },
                {
					name: 'salida',
					title: this.translate.instant('SALIDA'),
					class: "mat-column-flex",
                    centrado: true,
                    dir:'center',
					type: null,
					tooltip: false
				},
				{
					name: 'total',
					title: this.translate.instant('TOTAL'),
					class: "mat-column-flex",
                    centrado: true,
                    dir:'center',
					type: null,
					tooltip: false
                },
                {
					name: 'costo',
					title: this.translate.instant('COSTO'),
					class: "mat-column-flex",
                    centrado: false,
                    prefijo: '$',
                    dir:'center',
					type: 'decimal2',
					tooltip: false
				},
				
			],
            reordenamiento: false,
            paginatorSize: 100,
            displayedColumns: ['fecha', 'articulo', 'almacenLocalidad', 'tipoMovimiento', 'referencia', 'razon', 'usuario', 'existenciaAnterior', 'salida', 'entrada','total', 'costo'],
			columasFechas: ['fecha'],
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

                        this.almacenControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                            let almacenId = this.almacenControl.value ? this.almacenControl.value.id : null;
                            let localidadGeneral = this.localidades.filter(registro => { return registro.almacen.id == almacenId && registro.localidadGeneral })[0];

                            this.listadoLocalidades = this.localidades.filter(registro => { return registro.almacen.id == almacenId && !registro.localidadGeneral });
                            this.localidadControl.setValue(localidadGeneral && this.listadoLocalidades.length == 0 ? localidadGeneral : null);
                        });

                        this.filtros = [
                            {
                                type: "pixvsMatSelect",
                                label: this.translate.instant('FILTROS.SEDE'),
                                name: "sede",
                                formControl: new FormControl(null, [Validators.required]),
                                validations: [],
                                multiple: false,
                                selectAll: false,
                                list: datos.sedes,
                                campoValor: 'id',
                                values: ['nombre']
                            },
                            {
                                type: "input",
                                label: this.translate.instant('FILTROS.FECHA') + ' (' + this.translate.instant('FILTROS.DESDE') + ')',
                                inputType: "date",
                                name: "fechaInicio",
                                formControl: new FormControl(null, [Validators.required]),
                                validations: [{"name": "required","validator": Validators.required,"message": "Este campo es requerido"}]
                            },
                            {
                                type: "input",
                                label: this.translate.instant('FILTROS.FECHA') + ' (' + this.translate.instant('FILTROS.HASTA') + ')',
                                inputType: "date",
                                name: "fechaFin",
                                formControl: new FormControl(null, [Validators.required]),
                                validations: [{"name": "required","validator": Validators.required,"message": "Este campo es requerido"}]
                            },
                            {
                                type: "button",
                                label: "Save",
                                hidden: true
                            }
                        ];

                        this.filtrosOpciones = [{
                            title: 'PDF',
                            icon: 'arrow_downward',
                            tipo: FichaListadoConfig.PERSONALIZADO,
                            url: '/api/v1/contable_inventarios/pdf'
                        },{
                            title: 'XLSX',
                            icon: 'arrow_downward',
                            tipo: FichaListadoConfig.PERSONALIZADO,
                            url: '/api/v1/contable_inventarios/xls'
                        }];
                    }

                    else if(datos?.url) {
                        this.url = datos.url;
                        this.dataSource = new MatTableDataSource([]);
						this._fuseSidebarService.getSidebar('filtros-reporte-sidebar').close();
                    }

                    else if(datos?.length > 0){
                        this.url = null;
                        this.dataSource = new MatTableDataSource(datos);
						this._fuseSidebarService.getSidebar('filtros-reporte-sidebar').close();
                    }
                }
            );
    }

    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }
}