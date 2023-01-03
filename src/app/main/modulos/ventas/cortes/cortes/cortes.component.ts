import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichasDataService } from '@services/fichas-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'cortes-listado',
    templateUrl: './cortes.component.html',
    styleUrls: ['./cortes.component.scss']

})
export class CortesListadoComponent {

    regConfig: FieldConfig[];
    private _unsubscribeAll: Subject < any > ;
    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "strikethrough_s",
        columnaId: "id",
        rutaDestino: "/app/ventas/cortes/",
        columns: [
			{ name: 'codigo', title: 'Codigo', class: "mat-column-flex", centrado: false, type: null },
            { name: 'sede', title: 'Sede', class: "mat-column-240", centrado: false, type: null },
            { name: 'plantel', title: 'Plantel', class: "mat-column-flex", centrado: false, type: null },
            { name: 'usuario', title: 'Usuario', class: "mat-column-flex", centrado: false, type: null },
            { name: 'fechaInicio', title: 'Fecha Inicio', class: "mat-column-flex", centrado: true, type: "fecha", tooltip: false },
            { name: 'fechaFin', title: 'Fecha Fin', class: "mat-column-80", centrado: true, type: "fecha", tooltip: false },
            { name: 'total', title: 'Venta total', class: "mat-column-240", centrado: true, type: "decimal2", prefijo: "$" },
			{ name: 'estatus', title: 'Estatus', class: "mat-column-80", centrado: true, type: null },
        ],
        displayedColumns: ['codigo','sede', 'plantel', 'usuario', 'fechaInicio' , 'fechaFin', 'total', 'estatus'],
        columasFechas: ['fechaInicio','fechaFin'],
        listadoMenuOpciones: [],
        //listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/descuentos/download/excel' }]


    };

	opciones: ListadoMenuOpciones[] = [];

    constructor(public _fichasDataService: FichasDataService) {
        this._unsubscribeAll = new Subject();
    }

    ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

    ngOnInit(): void {
        this._fichasDataService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if (datos?.datos) {
					let sedes = datos?.sedes;
					let usuarios = datos?.usuarios;

					this.regConfig = [{
							type: "pixvsMatSelect",
							label: "Sede",
							name: "sede",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: sedes,
							campoValor: 'nombre',
						},
						{
							type: "date",
							label: "Fecha incio",
							name: "fechaInicio",
							formControl: new FormControl(null),
							validations: []
						},
						{
							type: "date",
							label: "Fecha fin",
							name: "fechaFin",
							formControl: new FormControl(null),
							validations: []
						},
						{
							type: "pixvsMatSelect",
							label: "Usuario",
							name: "usuario",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: usuarios,
							campoValor: 'nombreCompleto',
						},{
							type: "input",
							label: "Código OV",
							name: "codigoOV",
							formControl: new FormControl(null),
							validations: []
						}
					];

					let listaPermiso: Object = datos?.listaPermiso || new Object();
					// Lista de permiso, el usuario tiene permiso para descargar o exportar
					if (listaPermiso.hasOwnProperty('EXPORTAR_EXCEL_CORTE_CAJA')){
						this.opciones.push({ title: 'Descargar Reporte Excel', icon: 'play_for_work', tipo: FichaListadoConfig.EXCEL, url: "/api/v1/cortes/exportar/xlsx" })
					}
				}
			});
    }
}