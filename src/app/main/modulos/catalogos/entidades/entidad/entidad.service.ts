import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { EstadoService } from '@app/main/services/estado.service';
import { JsonResponse } from '@models/json-response';
import { HttpService } from '@pixvs/services/http.service';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { ArchivoService } from '@app/main/services/archivo.service';
import { BehaviorSubject } from 'rxjs';
import { ArchivoProjection } from '@models/archivo';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';


@Injectable()
export class EntidadService extends FichaDataService implements Resolve<any>{

	onComboEstadosChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
	onPDFChanged: BehaviorSubject <number> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService,
		private archivoService: ArchivoService
	) {
		super(_httpClient, snackBar, hashid);
	}

	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */
	getComboEstados(paisId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboEstadosChanged.next(response.data);
					} else {
						this.onComboEstadosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboEstadosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	subirArchivo(archivo: File): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.archivoService.fileUpload(archivo,ArchivosEstructurasCarpetas.RECIBOS.id,null,false,true,null)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onPDFChanged.next(response.data);
					} else {
						this.onPDFChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onPDFChanged.next(null);
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