import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichasDataService } from '@services/fichas-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'alumnos-listado',
    templateUrl: './alumnos-listado.component.html',
    styleUrls: ['./alumnos-listado.component.scss']
})
export class AlumnosListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "person",
        columnaId: "id",
        rutaDestino: "/app/control-escolar/alumnos/",
        columns: [
            { name: 'codigo', title: 'Código alumno', class: "mat-column-flex", centrado: false, type: null },
            { name: 'referencia', title: 'Referencia pago', class: "mat-column-flex", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null },
            { name: 'apellidos', title: 'Apellidos', class: "mat-column-flex", centrado: false, type: null },
            { name: 'nombreAlternativo', title: 'Alternativo', class: "mat-column-flex", centrado: false, type: null },
            { name: 'edad', title: 'Edad', class: "mat-column-flex", centrado: false, type: null },
            { name: 'correoElectronico', title: 'Correo electrónico', class: "mat-column-flex", centrado: false, type: null },
            { name: 'telefono', title: 'Teléfono', class: "mat-column-flex", centrado: false, type: null },
            { name: 'sucursalNombre', title: 'Sede', class: "mat-column-flex", centrado: false, type: null },
            { name: 'activo', title: 'Estatus', class: "mat-column-80", centrado: false, type: 'boolean', tooltip: false }
        ],
        displayedColumns: ['codigo', 'referencia', 'nombre', 'apellidos', 'edad', 'correoElectronico', 'telefono', 'sucursalNombre', 'activo'],
        columasFechas: [],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/alumnos/download/excel' }]
    };

    regConfig: FieldConfig[];
    opciones: ListadoMenuOpciones[] = [];
    isLoading: boolean = false;
    
    private _unsubscribeAll: Subject < any > ;
    subscripcionesFiltros: Subject<any>;

    constructor(
		public _fichasDataService: FichasDataService,
		private _matSnackBar: MatSnackBar,
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();
		this.subscripcionesFiltros = new Subject();
	}

    ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
		this.subscripcionesFiltros.next();
		this.subscripcionesFiltros.complete();
	}

    ngOnInit(): void {
		this._fichasDataService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if (datos?.filtros) {
					this.regConfig = [
						{
							type: "input",
							label: "Código Alumno",
							name: "codigo",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false
						},
                        {
							type: "input",
							label: "Nombre Alumno",
							name: "nombre",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false
						}
					];
				}
			});
	}
}