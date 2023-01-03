import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
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

@Component({
    selector: 'ajuste-inventario-listado',
    templateUrl: './ajustes-inventario.component.html',
    styleUrls: ['./ajustes-inventario.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class AjustesInventarioComponent {

    private URL: string = '/api/v1/inventario-movimiento/ajuste-inventario';

    regConfig: FieldConfig[];
    private _unsubscribeAll: Subject<any>;

    config: FichaListadoConfig;

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
        private _fichasDataService: FichasDataService) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);
		
		this.config = {
			localeEN: english,
			localeES: spanish,
			icono: "list_alt",
			columnaId: "id",
			rutaDestino: "/app/inventario/ajuste-inventario/",
			columns: [
				{
					name: 'referencia',
					title: this.translate.instant('REFERENCIA'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},
				{
					name: 'fechaCreacion',
					title: this.translate.instant('FECHA'),
					class: "mat-column-flex",
					centrado: false,
					type: "fecha-hora",
					tooltip: false
				},
				{
					name: 'localidad.almacenLocalidad',
					title: this.translate.instant('LOCALIDAD'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},
				{
					name: 'articulo.nombreArticulo',
					values: ['articulo.codigoArticulo', 'articulo.nombreArticulo'],
					title: this.translate.instant('ARTICULO'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: true
				},
				{
					name: 'razon',
					title: this.translate.instant('MOTIVO'),
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
			displayedColumns: ['referencia', 'fechaCreacion', 'localidad.almacenLocalidad', 'articulo.nombreArticulo', 'razon', 'cantidad'],
			columasFechas: ['fechaCreacion'],
			listadoMenuOpciones: [{
				title: 'EXCEL',
				icon: 'arrow_downward',
				tipo: FichaListadoConfig.EXCEL,
				url: this.URL + '/download/excel'
			}]
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
                        this.regConfig = [
                            {
                                type: "input",
                                label: this.translate.instant('FECHA') + ' (' + this.translate.instant('DESDE') + ')',
                                inputType: "date",
                                name: "fechaCreacionDesde",
                                validations: []
                            },
                            {
                                type: "input",
                                label: this.translate.instant('FECHA') + ' (' + this.translate.instant('HASTA') + ')',
                                inputType: "date",
                                name: "fechaCreacionHasta",
                                validations: []
                            },
                            {
                                type: "input",
                                label: this.translate.instant('REFERENCIA'),
                                inputType: "text",
                                name: "referencia",
                                validations: []
                            },
                            {
                                type: "button",
                                label: "Save",
                                hidden: true
                            }
                        ];
                    }
                }
            );
    }
}