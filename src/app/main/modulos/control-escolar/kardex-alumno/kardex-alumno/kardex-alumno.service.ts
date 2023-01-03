import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Resolve } from "@angular/router";
import { JsonResponse } from "@models/json-response";
import { FichasDataService } from "@services/fichas-data.service";
import { HashidsService } from "@services/hashids.service";
import { HttpService } from "@services/http.service";

@Injectable()
export class KardexAlumnoService extends FichasDataService implements Resolve<any>{

    private urlApiAlumnos = '/api/v1/alumnos';
	private urlApiKardexAlumno = '/api/v1/kardex-alumno';

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService
    ) {
        super(_httpClient, snackBar, hashid);
    }

    existeAlumno(codigoAlumno: string, imprimir: boolean): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApiAlumnos}/existe/${codigoAlumno}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.data) {
                        if(imprimir){
                            this.imprimirPDFConFiltros(this.urlApiKardexAlumno + '/pdf/',{codigoAlumno})
                        }else{
                            this.getArchivoURL(this.urlApiKardexAlumno + '/pdf/',{codigoAlumno})
                        }
					} else {
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
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

	descargarSubreporte(url: string): Promise<any> {
		url = url.replace("http://localhost:4200", "");

		this.cargando = true;

		return new Promise((resolve, reject) => {
			this._httpClient.get_file(this.urlApiKardexAlumno + url, true)
				.subscribe((response: any) => {
					this._httpClient.downloadPDF(response);
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