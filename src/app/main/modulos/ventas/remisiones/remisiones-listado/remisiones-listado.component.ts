import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'remisiones-listado',
    templateUrl: './remisiones-listado.component.html',
    styleUrls: ['./remisiones-listado.component.scss']
})
export class RemisionesListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "assignment",
        columnaId: "id",
        rutaDestino: "/app/ventas/remisiones/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-flex", centrado: false, type: null },
            { name: 'clienteNombre', title: 'Cliente', class: "mat-column-flex", centrado: false, type: null },
            { name: 'clienteRFC', title: 'RFC', class: "mat-column-flex", centrado: false, type: null },
            { name: 'fecha', title: 'Fecha', class: "mat-column-flex", centrado: false, type: "fecha" },
            { name: 'almacenOrigenNombre', title: 'Origen', class: "mat-column-flex", centrado: false, type: null },
            { name: 'almacenDestinoNombre', title: 'Destino', class: "mat-column-flex", centrado: false, type: null },
            { name: 'monto', title: 'Monto', class: "mat-column-flex", centrado: false, type: null },
            { name: 'estatusValor', title: 'Estatus', class: "mat-column-flex", centrado: false, type: null }
        ],
        displayedColumns: ['codigo','clienteNombre','clienteRFC','fecha','almacenOrigenNombre','almacenDestinoNombre','monto','estatusValor'],
        columasFechas: ['fecha'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/remisiones/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}