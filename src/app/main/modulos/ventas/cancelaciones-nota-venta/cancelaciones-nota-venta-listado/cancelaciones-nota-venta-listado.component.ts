import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrdenVentaCancelacionListadoProjection } from '@app/main/modelos/orden-venta-cancelacion';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';
import { HashidsService } from '@services/hashids.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'cancelaciones-nota-venta-listado',
    templateUrl: './cancelaciones-nota-venta-listado.component.html',
    styleUrls: ['./cancelaciones-nota-venta-listado.component.scss']
})
export class CancelacionesNotaVentaListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: 'assignment',
        columnaId: 'id',
        rutaDestino: '/app/ventas/cancelacion-nota-venta/',
        columns: [
            { name: 'tipoMovimiento', title: 'Tipo movimiento', class: 'mat-column-120', centrado: false, type: null, tooltip: false },
            { name: 'codigo', title: 'Folio', class: 'mat-column-100', centrado: false, type: null, tooltip: false },
            { name: 'ordenVenta', title: 'Nota de venta', class: 'mat-column-140', centrado: false, type: null, tooltip: false },
            { name: 'sucursal', title: 'Sede', class: 'mat-column-160', centrado: false, type: null, tooltip: false },
            { name: 'fechaCancelacion', title: 'Fecha movimiento', class: 'mat-column-120', centrado: true, type: 'fecha', tooltip: false },
            { name: 'importeReembolsar', title: 'Importe a reembolsar', class: 'mat-column-120', centrado: false, type: 'money', tooltip: true },
            { name: 'creadoPor', title: 'Usuario', class: 'mat-column-flex', centrado: false, type: null, tooltip: false },
            { name: 'estatus', title: 'Estatus', class: 'mat-column-80', centrado: false, type: null, tooltip: false },
            { name: 'documentos', title: 'Documentos', class: "mat-column-80", centrado: false, type: 'acciones' }
        ],
        displayedColumns: ['tipoMovimiento', 'codigo', 'ordenVenta', 'sucursal', 'fechaCancelacion', 'importeReembolsar', 'creadoPor', 'estatus', 'documentos'],
        columasFechas: ['fechaCancelacion'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/orden-venta-cancelacion/download/excel' }],
        listadoAcciones: [
            { title: 'Descargar documentos', tipo: null, icon: 'cloud_download', accion: this.onDescargarDocumentos.bind(this) }
        ]
    };

    constructor(
        private snackBar: MatSnackBar,
        private _service: FichasDataService,
        private hashid: HashidsService
    ) { }

    ngOnInit(): void { }

    onDescargarDocumentos(ordenVentaCancelacion: OrdenVentaCancelacionListadoProjection) {
        if (ordenVentaCancelacion.archivos == 0) {
            this.snackBar.open('La cancelacion no tiene documentos adjuntos', 'OK', {
                duration: 5000,
            });

            return;
        }

        this.getDocumentosZip(ordenVentaCancelacion);
    }

    getDocumentosZip(ordenVentaCancelacion: OrdenVentaCancelacionListadoProjection): Promise<any> {
        let body = {
            ordenVentaCancelacionId: this.hashid.encode(ordenVentaCancelacion.id)
        }

        return new Promise((resolve, reject) => {
            this._service._httpClient.post_get_file(JSON.stringify(body), `/api/v1/orden-venta-cancelacion/descargar/documentos`, true)
                .subscribe((response: any) => {
                    this._service._httpClient.downloadZip(response);
                    resolve(response);

                }, err => {
                    this._service.cargando = false;
                    this.snackBar.open('No se encontraron documentos', 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this._service.getError(err), null, null));
                });
        });
    }
}