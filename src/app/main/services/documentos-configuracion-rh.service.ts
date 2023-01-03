import { Injectable } from "@angular/core";
import { HttpService } from "@services/http.service";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class DocumentosConfiguracionRHService {

	private urlApi = '/api/v1/configuracion-documentos-rh';

	constructor(
		public _httpClient: HttpService
	){}

	getListaDocumentosConfiguracionRH(tipoProcesoRHId: number, tipoContratoId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/listado/combo/${tipoProcesoRHId}/${tipoContratoId}`,true);
	}

}