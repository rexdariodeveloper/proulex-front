import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { ArchivoService } from '@app/main/services/archivo.service';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class ReportePagoClientesService extends FichaDataService implements Resolve<any>
{
    private urlApi = '/api/v1/reporte-cxcpago-clientes';

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
        private archivoService: ArchivoService
    ) {
        super(_httpClient, snackBar, hashid);
    }

    descargarArchivosPago(pagoId: number, extension: string): Promise<any> {
        this.cargando = true;

        return new Promise((resolve, reject) => {
            this._httpClient.get_file(this.urlApi + "/archivos/pago/" + this.hashid.encode(pagoId) + "/" + extension, true)
                .subscribe((response: any) => {
                    this._httpClient.downloadArchivo(response, extension);
                    resolve(response);
                    this.cargando = false;
                }, err => {
                    this.cargando = false;
                    let error = extension == 'xml' ? 'El pago no fue timbrado.' : this.getError(err);
                    this.snackBar.open(error, 'OK', { duration: 5000 });
                    resolve(new JsonResponse(500, error, null, null));
                });
        });
    }

    descargarArchivosPagoDetalle(pagoDetalleId: number, extension: string): Promise<any> {
        this.cargando = true;

        return new Promise((resolve, reject) => {
            this._httpClient.get_file(this.urlApi + "/archivos/pago-detalle/" + this.hashid.encode(pagoDetalleId) + "/" + extension, true)
                .subscribe((response: any) => {
                    this._httpClient.downloadArchivo(response, extension);
                    resolve(response);
                    this.cargando = false;
                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }
}