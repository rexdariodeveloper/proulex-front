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
import { takeUntil } from 'rxjs/operators';
import { FichasDataService } from '@services/fichas-data.service';

@Component({
	selector: 'almacenes-listado',
	templateUrl: './almacenes.component.html',
	styleUrls: ['./almacenes.component.scss']
})
export class AlmacenesComponent {

	regConfig: FieldConfig[];
	private _unsubscribeAll: Subject < any > ;

	config: FichaListadoConfig = {
		localeEN: english,
		localeES: spanish,
		icono: "store",
		columnaId: "id",
		rutaDestino: "/app/catalogos/almacenes/",
		columns: [{
				name: 'codigoAlmacen',
				title: 'Código',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: true
			},{
				name: 'nombre',
				title: 'Nombre',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'responsable.nombreCompleto',
				title: 'Responsable',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'sucursal.nombre',
				title: 'Sede',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: false
			},{
				name: 'telefono',
				title: 'Teléfono',
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
		displayedColumns: ['codigoAlmacen','nombre','responsable.nombreCompleto','sucursal.nombre','telefono','activo'],
		columasFechas: [],
		listadoMenuOpciones: [{
			title: 'EXCEL',
			icon: 'arrow_downward',
			tipo: FichaListadoConfig.EXCEL,
			url: '/api/v1/almacenes/download/excel'
		}]
	};

	constructor(public _ArticulosService: FichasDataService) {
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

					// this.regConfig = [
					// ];
				}

			});


	}

}