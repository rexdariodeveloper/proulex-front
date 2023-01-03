import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { EstadoService } from '@services/estado.service';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class DepartamentosService extends FichaDataService implements Resolve<any>{
	
	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService
    ) {
		super(_httpClient, snackBar, hashid);
	}

	borrar(departamentoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.put(null,`/api/v1/departamentos/delete/${this.hashid.encode(departamentoId)}`,true)
				.subscribe((response: any) => {
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

    borrarHabilidad(hrId: number): Promise < any > {
        return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.put(null,`/api/v1/departamento-habilidad-responsabilidad/delete/${this.hashid.encode(hrId)}`,true)
				.subscribe((response: any) => {
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
