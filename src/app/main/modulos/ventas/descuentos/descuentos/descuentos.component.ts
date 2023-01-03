import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'descuentos-listado',
    templateUrl: './descuentos.component.html',
    styleUrls: ['./descuentos.component.scss']

})
export class DescuentosListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "strikethrough_s",
        columnaId: "id",
        rutaDestino: "/app/ventas/descuentos/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-240", centrado: false, type: null },
            { name: 'concepto', title: 'Concepto', class: "mat-column-flex", centrado: false, type: null },
            { name: 'porcentajeDescuento', title: 'Porcentaje/Monto', class: "mat-column-flex", centrado: false, type: null },
            { name: 'fechaInicio', title: 'Fecha Inicio', class: "mat-column-flex", centrado: true, type: "fecha", tooltip: false },
            { name: 'fechaFin', title: 'Fecha Fin', class: "mat-column-80", centrado: true, type: "fecha", tooltip: false },
            { name: 'activo', title: 'Estatus', class: "mat-column-240", centrado: true, type: "boolean" },
        ],
        displayedColumns: ['codigo', 'concepto', 'porcentajeDescuento', 'fechaInicio' , 'fechaFin', 'activo'],
        columasFechas: ['fechaInicio','fechaFin'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/descuentos/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }
}