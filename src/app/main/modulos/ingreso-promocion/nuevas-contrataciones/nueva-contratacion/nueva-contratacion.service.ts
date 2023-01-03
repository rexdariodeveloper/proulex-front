import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { MunicipioService } from '@app/main/services/municipio.service';
import { EstadoComboProjection } from '@models/estado';
import { JsonResponse } from '@models/json-response';
import { MunicipioComboProjection } from '@models/municipio';
import { EstadoService } from '@app/main/services/estado.service';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';
import { BehaviorSubject } from 'rxjs';
import { DocumentosConfiguracionRHService } from '@app/main/services/documentos-configuracion-rh.service';
import { ArchivoProjection } from '@models/archivo';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { DocumentosConfiguracionRHEditarProjection } from '@app/main/modelos/documentos-configuracion-rh';

@Injectable()
export class NuevaContratacionService extends FichaDataService implements Resolve<any> {

  onListaEstadoNacimientoChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
  onListaEstadoChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
  onListaEstadoLaboralChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
  onListaMunicipioChanged: BehaviorSubject<MunicipioComboProjection[]> = new BehaviorSubject(null);
  onListaMunicipioLaboralChanged: BehaviorSubject<MunicipioComboProjection[]> = new BehaviorSubject(null);
  onListaDocumentosConfiguracionRHChanged: BehaviorSubject<DocumentosConfiguracionRHEditarProjection[]> = new BehaviorSubject(null);
  onArchivoChanged: BehaviorSubject <ArchivoProjection> = new BehaviorSubject(null);

  constructor(
    _httpClient: HttpService,
    _snackBar: MatSnackBar,
    _hashid: HashidsService,
    private _estadoService: EstadoService,
    private _municipioService: MunicipioService,
	private _documentosConfiguracionRHService: DocumentosConfiguracionRHService,
	private _archivoService: ArchivoService
  ) { 
    super(_httpClient, _snackBar, _hashid);
  }

  getListaEstadoNacimiento(paisId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onListaEstadoNacimientoChanged.next(response.data);
					} else {
						this.onListaEstadoNacimientoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onListaEstadoNacimientoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getListaEstado(paisId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onListaEstadoChanged.next(response.data);
					} else {
						this.onListaEstadoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onListaEstadoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getListaEstadoLaboral(paisId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onListaEstadoLaboralChanged.next(response.data);
					} else {
						this.onListaEstadoLaboralChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onListaEstadoLaboralChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}
	
	getListaMunicipio(estadoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._municipioService.getCombo(estadoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onListaMunicipioChanged.next(response.data);
					} else {
						this.onListaMunicipioChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onListaMunicipioChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getListaMunicipioLaboral(estadoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._municipioService.getCombo(estadoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onListaMunicipioLaboralChanged.next(response.data);
					} else {
						this.onListaMunicipioLaboralChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onListaMunicipioLaboralChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
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
