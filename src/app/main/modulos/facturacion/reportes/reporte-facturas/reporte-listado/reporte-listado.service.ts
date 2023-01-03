import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { ArchivoService } from '@app/main/services/archivo.service';
import { JsonResponse } from '@models/json-response';
import { IconSnackBarComponent } from '@pixvs/componentes/snackbars/icon-snack-bar.component';
import { FichasDataService } from '@services/fichas-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';

@Injectable()
export class ReporteFacturasService extends FichasDataService implements Resolve<any> {

  	private urlApi = '/api/v1/reporte-facturas';

	constructor(
		_httpClient: HttpService,
		_snackBar: MatSnackBar,
		_hashid: HashidsService,
		private _archivoService: ArchivoService
	) { 
		super(_httpClient, _snackBar, _hashid);
	}

  	imprimirArchivo(facturaId: number, archivoId: number): Promise<any> {
		let body = {
			facturaId: this.hashid.encode(facturaId),
			archivoId: archivoId
		};

		this.cargando = true;

		return new Promise((resolve, reject) => {
			this._httpClient.post_get_file(JSON.stringify(body), `${this.urlApi}/imprimir/archivos`, true)
				.subscribe((response: any) => {
					this.cargando = false;
					this._httpClient.downloadArchivo(response);
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

	descargarFacturas(json: any): Promise<any> {
        this.cargando = true;
        return new Promise((resolve, reject) => {
            this._httpClient.post(json, `${this.urlApi}/exportar/facturas`, true)
                .subscribe((response: any) => {
					if(response.status == 200){
						let blob = this.b64toBlob(response.data.archivo, 'application/zip');
						this._archivoService.descargarArchivoResponse(blob,response.data.extension, response.data.nombreArchivo);
						this.cargando = false;
					}
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

	b64toBlob = (b64Data, contentType='', sliceSize=512) => {
		const byteCharacters = atob(b64Data);
		const byteArrays = [];
  
		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			const slice = byteCharacters.slice(offset, offset + sliceSize);
	
			const byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}
	
			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}
  
		const blob = new Blob(byteArrays, {type: contentType});
		return blob;
	}
}
