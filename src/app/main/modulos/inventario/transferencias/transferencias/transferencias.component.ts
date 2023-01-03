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
    selector: 'transferencias-listado',
    templateUrl: './transferencias.component.html',
    styleUrls: ['./transferencias.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class TransferenciasComponent {

    private URL: string = '/api/v1/transferencias';

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
			icono: "redo",
			columnaId: "id",
			rutaDestino: "/app/inventario/transferencias/",
			columns: [
				{
					name: 'codigo',
					title: this.translate.instant('CODIGO'),
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
					name: 'localidadOrigen.almacenLocalidad',
					title: this.translate.instant('ORIGEN'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},
				{
					name: 'localidadDestino.almacenLocalidad',
					title: this.translate.instant('DESTINO'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},        
				{
					name: 'estatus.valor',
					title: this.translate.instant('ESTATUS'),
					class: "mat-column-flex",
					centrado: false,
					type: null,
					tooltip: false
				},
			],
			reordenamiento: false,
			displayedColumns: ['codigo', 'fechaCreacion', 'localidadOrigen.almacenLocalidad', 'localidadDestino.almacenLocalidad', 'estatus.valor'],
			columasFechas: ['fechaCreacion'],
			listadoMenuOpciones: [{
				title: 'EXCEL',
				icon: 'arrow_downward',
				tipo: FichaListadoConfig.EXCEL,
				url: this.URL + '/download/excel'
			}]
		}

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
                                type: "pixvsMatSelect",
                                label: this.translate.instant('ESTATUS'),
                                name: "estatus",
                                formControl: new FormControl(null),
                                validations: [],
                                multiple: true,
                                selectAll: false,
                                list: datos.estatus,
                                campoValor: 'valor',
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