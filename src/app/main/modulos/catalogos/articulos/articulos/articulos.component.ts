import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { HashidsService } from '@services/hashids.service';
import { Router, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { MenuListadoGeneral } from '@models/menu-listado-general';
import { Validators, FormControl } from '@angular/forms';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
import { MatDialog } from '@angular/material/dialog';
import { ArticulosService } from './articulos.service';
import { takeUntil } from 'rxjs/operators';
@Component({
	selector: 'articulos-listado',
	templateUrl: './articulos.component.html',
	styleUrls: ['./articulos.component.scss']
})
export class ArticulosComponent {

	regConfig: FieldConfig[];
	private _unsubscribeAll: Subject < any > ;

	config: FichaListadoConfig = {
		localeEN: english,
		localeES: spanish,
		icono: "free_breakfast",
		columnaId: "id",
		rutaDestino: "/app/catalogos/articulos/",
		columns: [{
				name: 'codigoArticulo',
				title: 'Código',
				class: "mat-column-240",
				centrado: false,
				type: null,
				tooltip: true
			},{
				name: 'imagenId',
				title: '',
				class: "mat-column-80",
				centrado: false,
				type: 'imagen',
				tooltip: false
			},{
				name: 'nombreArticulo',
				title: 'Nombre',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'unidadMedidaInventario.nombre',
				title: 'UM',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'familia.nombre',
				title: 'Familia',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'activo',
				title: 'Activo',
				class: "mat-column-80",
				centrado: false,
				type: 'boolean',
				tooltip: false
			}
		],
		reordenamiento: false,
		displayedColumns: ['codigoArticulo','imagenId','nombreArticulo','unidadMedidaInventario.nombre','familia.nombre','activo'],
		columasFechas: [],
		listadoMenuOpciones: [{
			title: 'EXCEL',
			icon: 'arrow_downward',
			tipo: FichaListadoConfig.EXCEL,
			url: '/api/v1/articulos/download/excel'
		}]
	};

	constructor(public _ArticulosService: ArticulosService) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	ngOnInit(): void {

		this._ArticulosService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if (datos?.datos) {
					// let estatus = datos?.cmmEstatus

					this.regConfig = [
						// {
						// 	type: "input",
						// 	label: "Fecha Creación (Desde)",
						// 	inputType: "date",
						// 	name: "fechaCreacionDesde",
						// 	validations: []
						// },
						// {
						// 	type: "input",
						// 	label: "Fecha Creación (Hasta)",
						// 	inputType: "date",
						// 	name: "fechaCreacionHasta",
						// 	validations: []
						// },
						// {
						// 	type: "pixvsMatSelect",
						// 	label: "Estatus",
						// 	name: "estatus",
						// 	formControl: new FormControl(null, [Validators.required]),
						// 	validations: [],
						// 	multiple: true,
						// 	selectAll: false,
						// 	list: estatus,
						// 	campoValor: 'valor',
						// },
						// {
						// 	type: "button",
						// 	label: "Save",
						// 	hidden: true
						// }
					];
				}

			});


	}

}