import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'factura-remision-listado',
    templateUrl: './factura-remision-listado.component.html',
    styleUrls: ['./factura-remision-listado.component.scss']
})
export class FacturaRemisionListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "featured_play_list",
        columnaId: "id",
        rutaDestino: "/app/facturacion/factura-remision/",
        columns: [
            { name: 'codigoRegistro', title: 'Folio', class: "mat-column-flex", centrado: false, type: null },
            { name: 'clienteNombre', title: 'Cliente', class: "mat-column-flex", centrado: false, type: null },
            { name: 'clienteRFC', title: 'RFC', class: "mat-column-flex", centrado: false, type: null },
            { name: 'fecha', title: 'Fecha', class: "mat-column-flex", centrado: false, type: null },
            { name: 'monedaNombre', title: 'Moneda', class: "mat-column-flex", centrado: false, type: null },
            { name: 'monto', title: 'Monto', class: "mat-column-flex", centrado: false, type: null }
        ],
        displayedColumns: ['codigoRegistro', 'clienteNombre', 'clienteRFC', 'fecha', 'monedaNombre', 'monto'],
        columasFechas: ['fecha'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/cxcfacturas-remisiones/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }
}