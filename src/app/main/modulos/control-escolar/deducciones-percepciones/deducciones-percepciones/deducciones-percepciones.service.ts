import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ProgramacionAcademicaComercialEditarProjection } from '@app/main/modelos/programacion-academica-comercial';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';
import { ArchivoProjection } from '@models/archivo';
import { ProgramasGruposService } from '@app/main/services/grupos.services';

@Injectable()
export class DeduccionesPercepcionesService extends FichasDataService implements Resolve<any>
{
	onEnviarChanged: BehaviorSubject <boolean> ;
	onSueldoChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onPDFChanged: BehaviorSubject <number> ;
    constructor(
		_httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		public _gruposService: ProgramasGruposService,
		private archivoService: ArchivoService
    ) {
		super(_httpClient, snackBar, hashid);
		this.onEnviarChanged = new BehaviorSubject(null);
		this.onPDFChanged = new BehaviorSubject(null);
		
	}


	getDatosSueldo(idEmpleado: number, idDeduccionPercepcion: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._gruposService.getDatosSueldoEmpleadoDeduccionPercepcion(idEmpleado,idDeduccionPercepcion)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onSueldoChanged.next(response.data);
					} else {
						this.onSueldoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onSueldoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}
   	
   	subirArchivo(archivo: File, empleadoNombre: string): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.archivoService.fileUpload(archivo,ArchivosEstructurasCarpetas.PAGOS_CXP.id,null,false,true,empleadoNombre)
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
					//this.archivoService.verArchivo(evidencia,response.body);
					this.archivoService.descargarArchivoResponse(response.body,evidencia.nombreOriginal.split('.').pop(),evidencia.nombreOriginal);
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