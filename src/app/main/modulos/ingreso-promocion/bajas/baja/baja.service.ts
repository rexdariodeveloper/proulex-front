import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { DocumentosConfiguracionRHEditarProjection } from '@app/main/modelos/documentos-configuracion-rh';
import { EmpleadoContratoEditarProjection } from '@app/main/modelos/empleado-contrato';
import { ArchivoService } from '@app/main/services/archivo.service';
import { DocumentosConfiguracionRHService } from '@app/main/services/documentos-configuracion-rh.service';
import { JsonResponse } from '@models/json-response';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class BajaService extends FichaDataService implements Resolve<any> {

  private urlApi: string = '/api/v1/bajas';

  onDatosEmpleadoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
  onListaDocumentosConfiguracionRHChanged: BehaviorSubject<DocumentosConfiguracionRHEditarProjection[]> = new BehaviorSubject(null);

  constructor(
    _httpClient: HttpService,
    _snackBar: MatSnackBar,
    _hashid: HashidsService,
	  private _documentosConfiguracionRHService: DocumentosConfiguracionRHService,
	  private _archivoService: ArchivoService
  ) { 
    super(_httpClient, _snackBar, _hashid);
  }

  getDatosEmpleado(solicitudBajaContratoId: number, empleadoId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(this.urlApi + '/getDatosEmpleado/' + solicitudBajaContratoId + '/' + empleadoId, true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onDatosEmpleadoChanged.next(response.data);
				else {
					this.onDatosEmpleadoChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onDatosChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

	getListaDocumentosConfiguracionRH(tipoProcesoRHId: number, tipoContratoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._documentosConfiguracionRHService.getListaDocumentosConfiguracionRH(tipoProcesoRHId, tipoContratoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onListaDocumentosConfiguracionRHChanged.next(response.data);
					} else {
						this.onListaDocumentosConfiguracionRHChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onListaDocumentosConfiguracionRHChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}
}
