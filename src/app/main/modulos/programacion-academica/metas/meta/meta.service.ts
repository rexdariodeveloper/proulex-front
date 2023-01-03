import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { JsonResponse } from '@models/json-response';
import { ProgramacionAcademicaComercialDetalleMetaListadoProjection } from '@app/main/modelos/programacion-academica-comercial-detalle';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';

@Injectable()
export class MetaService extends FichaDataService implements Resolve<any>{

    private urlApi = '/api/v1/programas-metas';

    onProgramacionAcademicaComercialDetallesChanged: BehaviorSubject<ProgramacionAcademicaComercialDetalleMetaListadoProjection[]> = new BehaviorSubject(null);
    onXLSXChanged: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
		private archivoService: ArchivoService
    ) {
        super(_httpClient, snackBar, hashid);
    }

    getDetallesProgramacionAcademicaComercial(programacionAcademicaComercialId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/programacion-academica-comercial-detalles/${programacionAcademicaComercialId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onProgramacionAcademicaComercialDetallesChanged.next(response.data);
					} else {
						this.onProgramacionAcademicaComercialDetallesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onProgramacionAcademicaComercialDetallesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	exportar(programaMetaId: number): Promise<any> {
		return new Promise((resolve, reject) => {
            this._httpClient.get_file(`/api/v1/programas-metas/download/excel/${programaMetaId}`, true)
                .subscribe((response: any) => {

                    this._httpClient.downloadExcel(response);
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

	getPlantilla(programacionAcademicaComercialId: number): Promise<any> {
		return new Promise((resolve, reject) => {
            this._httpClient.get_file(`/api/v1/programas-metas/download/plantilla/${programacionAcademicaComercialId}`, true)
                .subscribe((response: any) => {

                    this._httpClient.downloadExcel(response);
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

	subirArchivo(archivo: File): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.archivoService.fileUploadXML(archivo,null,null,false,true,null,`/api/v1/programas-metas/upload/xml`)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onXLSXChanged.next(response.data);
					} else {
						this.onXLSXChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onXLSXChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}
    
}