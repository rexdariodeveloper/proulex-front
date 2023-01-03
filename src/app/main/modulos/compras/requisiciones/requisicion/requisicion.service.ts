import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { Observable } from 'rxjs';
import { RequisicionEditarProjection } from '@app/main/modelos/requisicion';
import { ArchivoService } from '@app/main/services/archivo.service';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class RequisicionService extends FichaDataService implements Resolve<any>
{
    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private _archivoService: ArchivoService
    ) {
        super(_httpClient, snackBar, hashid);
	}
	
	descargarPDF(requisicion: RequisicionEditarProjection): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get_file(`/api/v1/requisiciones/pdf/${this.hashid.encode(requisicion.id)}`,true)
			.subscribe((response: any) => {
					this.cargando = false;
					this._archivoService.descargarArchivoResponse(response.body, '.pdf', requisicion.codigo + '.pdf')
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