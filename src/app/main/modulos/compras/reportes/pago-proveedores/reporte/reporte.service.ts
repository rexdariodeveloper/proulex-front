import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ArchivoProjection } from '@models/archivo';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class ReportePagoProveedoresService extends FichaDataService implements Resolve<any>{
	
	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private archivoService: ArchivoService
    ) {
		super(_httpClient, snackBar, hashid);
	}

	verArchivo(evidencia: ArchivoProjection){
		return new Promise((resolve, reject) => {
            this.archivoService.descargarArchivo(evidencia.id)
                .subscribe((response: any) => {
					this.archivoService.verArchivo(evidencia,response.body);
                    resolve(response);

                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
	}

    descargarArchivo(id: number, extension: string){
		return new Promise((resolve, reject) => {
            this.archivoService.descargarArchivo(id)
                .subscribe((response: any) => {
					this._httpClient.downloadArchivo(response, extension);
					this.snackBar.dismiss();
                    resolve(response);
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
