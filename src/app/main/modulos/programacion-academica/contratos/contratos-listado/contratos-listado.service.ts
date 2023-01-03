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
export class ContratosService extends FichasDataService implements Resolve<any>
{

	onComboProgramaCicloChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onComboFechasInicioChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
    onComboAnioChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
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
		this.onComboProgramaCicloChanged = new BehaviorSubject(null);
		this.onComboFechasInicioChanged = new BehaviorSubject(null);
		this.onKardexUrlChanged = new BehaviorSubject(null);
	}
	
	getComboProgramacionCiclo(sucursalId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._gruposService.getSucursalEsJobs(sucursalId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboProgramaCicloChanged.next(response.data);
					} else {
						this.onComboProgramaCicloChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboProgramaCicloChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getFechasInicioByCiclo(cicloId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._gruposService.getFechasInicioByCiclo(cicloId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboFechasInicioChanged.next(response.data);
					} else {
						this.onComboFechasInicioChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboFechasInicioChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

    getFechasInicioByAnioAndSucursalAndModalidad(anio: number, idSucursal: number, idModalidad: number): Promise < any > {
        if(anio === null){
            return new Promise((resolve, reject) => {
                this.onComboAnioChanged.next(null);
                resolve(null);
            })
        }else{
            return new Promise((resolve, reject) => {
                this.cargando = true;
                this._gruposService.getFechasInicioByAnioAndSucursalAndModalidad(anio, idSucursal, idModalidad)
                    .subscribe((response: any) => {
                        this.cargando = false;
                        if (response.status == 200) {
                            this.onComboAnioChanged.next(response.data);
                        } else {
                            this.onComboAnioChanged.next(null);
                            this.snackBar.open(response.message, 'OK', {
                                duration: 5000,
                            });
                        }
                        resolve(response);
                    }, err => {
                        this.cargando = false;
                        this.onComboAnioChanged.next(null);
                        this.snackBar.open(this.getError(err), 'OK', {
                            duration: 5000,
                        });
                        resolve(new JsonResponse(500, this.getError(err), null, null));
                    });
            });
        }

	}

    

	getZip(json: any): Promise<any> {
        this.cargando = true;
        return new Promise((resolve, reject) => {
            this._httpClient.post(json, '/api/v1/contratos/template/generarReporte', true)
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