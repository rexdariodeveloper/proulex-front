import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { EstadoService } from '@app/main/services/estado.service';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class ProgramaService extends FichaDataService implements Resolve<any>{

	onComboEstadosChanged: BehaviorSubject <EstadoComboProjection[]> = new BehaviorSubject(null);

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService
    ) {
        super(_httpClient, snackBar, hashid);
	}
	
	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */
	
    
}