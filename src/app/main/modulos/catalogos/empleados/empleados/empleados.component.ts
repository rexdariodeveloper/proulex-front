import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'empleados-listado',
    templateUrl: './empleados.component.html',
    styleUrls: ['./empleados.component.scss']

})
export class EmpleadosListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "perm_identity",
        columnaId: "id",
        rutaDestino: "/app/catalogos/empleados/",
        columns: [
            { name: 'codigoEmpleado', title: 'Código Empleado', class: "mat-column-240", centrado: false, type: null },
            { name: 'nombreCompleto', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null },
            { name: 'fechaAlta', title: 'Fecha Alta', class: "mat-column-flex", centrado: true, type: "fecha", tooltip: false },
            { name: 'tipoEmpleado.valor', title: 'Tipo de empleado', class: "mat-column-flex", centrado: false, type: null },
            { name: 'departamento.nombre', title: 'Departamento', class: "mat-column-flex", centrado: false, type: null },
            { name: 'sucursal.nombre', title: 'Sede', class: "mat-column-flex", centrado: false, type: null },
            { name: 'estatus.valor', title: 'Estatus', class: "mat-column-80", centrado: true, type: null },
        ],
        displayedColumns: ['codigoEmpleado', 'nombreCompleto', 'fechaAlta', 'tipoEmpleado.valor', 'departamento.nombre', 'sucursal.nombre' , 'estatus.valor'],
        columasFechas: ['fechaAlta'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/empleados/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}