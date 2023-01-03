import { Component } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { takeUntil } from 'rxjs/operators';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { Subject } from 'rxjs';
import { FichasDataService } from '@services/fichas-data.service';

@Component({
    selector: 'factura-nota-venta-listado',
    templateUrl: './factura-nota-venta-listado.component.html',
    styleUrls: ['./factura-nota-venta-listado.component.scss']

})
export class FacturaNotaVentaListadoComponent {

    regConfig: FieldConfig[];
    private _unsubscribeAll: Subject<any>;

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "note",
        columnaId: "id",
        rutaDestino: "/app/facturacion/factura-nota-venta/",
        columns: [
            { name: 'fecha', title: 'Fecha', class: "mat-column-120", centrado: false, type: 'fecha' },
            { name: 'folio', title: 'Folio', class: "mat-column-100", centrado: false, type: null, tooltip: true },
            { name: 'cliente', title: 'Cliente', class: "mat-column-flex", centrado: false, type: null },
            { name: 'monto', title: 'Monto', class: "mat-column-120", centrado: true, type: 'money' },
            { name: 'estatus', title: 'Estatus', class: "mat-column-100", centrado: false },
            { name: 'usuario', title: 'Usuario', class: "mat-column-flex", centrado: false },
            { name: 'xml', title: 'XML', class: "mat-column-80", centrado: false, type: 'downloadFile', url: '/api/v1/cxcfacturas-nota-venta/archivos/[id]/xml', extension: 'xml' },
            { name: 'pdf', title: 'PDF', class: "mat-column-80", centrado: false, type: 'downloadFile', url: '/api/v1/cxcfacturas-nota-venta/archivos/[id]/pdf', extension: 'pdf' },
        ],
        reordenamiento: false,
        displayedColumns: ['fecha', 'folio', 'cliente', 'monto', 'estatus', 'usuario', 'xml', 'pdf'],
        columasFechas: ['fecha'],
        listadoMenuOpciones: []
    };

    constructor(public _FichasDataService: FichasDataService) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this._FichasDataService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
            });
    }
}