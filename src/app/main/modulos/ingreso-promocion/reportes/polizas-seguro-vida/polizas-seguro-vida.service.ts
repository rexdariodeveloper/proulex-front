import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
//import { CursosService } from '@app/main/services/cursos-service';
import { ProgramasGruposService } from '@app/main/services/grupos.services';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';
import { ArchivoService } from '@app/main/services/archivo.service';

@Injectable()
export class PolizasSeguroVidaService extends FichasDataService implements Resolve<any>
{

	onKardexUrlChanged: BehaviorSubject<any> = new BehaviorSubject(null);

    constructor(
		_httpClient: HttpService,
		//public _cursosService: CursosService,
		public _gruposService: ProgramasGruposService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private _archivoService: ArchivoService,
    ) {
		super(_httpClient, snackBar, hashid);
		this.onKardexUrlChanged = new BehaviorSubject(null);
	}
	


	getZip(url: string, json: any): Promise<any> {
        this.cargando = true;
        return new Promise((resolve, reject) => {
            this._httpClient.post(json, url, true)
                .subscribe((response: any) => {
                	let blob = this.b64toBlob(response.data.archivo, this.obtenerContentType(response.data.extension));
                	this._archivoService.descargarArchivoResponse(blob,response.data.extension,'Contratos.zip');
                    this.cargando = false;
                }, err => {
                    this.onKardexUrlChanged.next(null);
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    byteArrayToBlob(byteArray: Array<any>, extension: string): Blob{
		let byteArrayParsed = new Uint8Array(byteArray);
		debugger;
		return new Blob([byteArrayParsed], { type: this.obtenerContentType(extension) });
	}
    
    obtenerContentType(archivoExtension: string): string{
		switch(archivoExtension){

			case ".pdf":
				return "application/pdf";
			case ".xml":
				return "application/xml";

			case ".gif":
				return "image/gif";
			case ".ico":
				return "image/x-icon";
			case ".jpg":
			case ".jpeg":
				return "image/jpeg";
			case ".svg":
				return "image/svg+xml";
			case ".tif":
			case ".tiff":
				return "image/tiff";
			case ".webp":
				return "image/webp";
			case ".zip":
				return "application/zip";
			case ".rar":
				return "application/x-rar-compressed";

			default:
				return "*/*";
		}
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