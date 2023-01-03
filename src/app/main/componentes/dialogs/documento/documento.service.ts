import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ArchivoProjection } from '@models/archivo';
import { JsonResponse } from '@models/json-response';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DocumentoService extends FichaDataService implements Resolve<any> {

  onDocumentoUploadChanged: BehaviorSubject <number> = new BehaviorSubject(null);
  onArchivoChanged: BehaviorSubject <ArchivoProjection> = new BehaviorSubject(null);

  constructor(
    _httpClient: HttpService,
    _snackBar: MatSnackBar,
    _hashid: HashidsService,
    private _archivoService: ArchivoService
  ) { 
    super(_httpClient, _snackBar, _hashid);
  }

  subirDocumento(archivo: File, subCarpeta: string): Promise < any >{
		return new Promise((resolve, reject) => {
			this._archivoService.fileUpload(archivo,ArchivosEstructurasCarpetas.DOCUMENTOS.documentos,ControlesMaestrosMultiples.CMM_EMP_TipoArchivo.DOCUMENTO,false,true, subCarpeta)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDocumentoUploadChanged.next(response.data);
					} else {
						this.onDocumentoUploadChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDocumentoUploadChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

  getDocumento(archivoId: number): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._archivoService.getProjection(archivoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onArchivoChanged.next(response.data);
					} else {
						this.onArchivoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onArchivoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}
}
