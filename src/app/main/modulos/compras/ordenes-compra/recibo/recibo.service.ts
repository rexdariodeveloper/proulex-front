import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { JsonResponse } from '@models/json-response';
import { ArchivoProjection } from '@models/archivo';

@Injectable()
export class ReciboOrdenCompraService extends FichaDataService implements Resolve<any>{
	
	onFacturaUploadChanged: BehaviorSubject <number> ;
	onEvidenciaUploadChanged: BehaviorSubject <number> ;

	onArchivoChanged: BehaviorSubject <ArchivoProjection> ;

	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private archivoService: ArchivoService
    ) {
		super(_httpClient, snackBar, hashid);
		
		this.onFacturaUploadChanged = new BehaviorSubject(null);
		this.onEvidenciaUploadChanged = new BehaviorSubject(null);

		this.onArchivoChanged = new BehaviorSubject(null);
	}
	
	subirFactura(archivo: File): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.archivoService.fileUpload(archivo,ArchivosEstructurasCarpetas.RECIBOS.FACTURAS,ControlesMaestrosMultiples.CMM_OCR_TipoArchivo.FACTURA,false,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onFacturaUploadChanged.next(response.data);
					} else {
						this.onFacturaUploadChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onFacturaUploadChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	subirEvidencia(archivo: File): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.archivoService.fileUpload(archivo,ArchivosEstructurasCarpetas.RECIBOS.EVIDENCIA,ControlesMaestrosMultiples.CMM_OCR_TipoArchivo.EVIDENCIA,false,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onFacturaUploadChanged.next(response.data);
					} else {
						this.onFacturaUploadChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onFacturaUploadChanged.next(null);
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
			this.archivoService.getProjection(archivoId)
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
    
}