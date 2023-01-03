import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { JsonResponse } from '@models/json-response';
import { MunicipioComboProjection } from '@models/municipio';
import { HttpService } from '@pixvs/services/http.service';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PuestoService extends FichaDataService implements Resolve<any>{

	onComboEstadosChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
	onEstadosFacturacionChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
    onMunicipiosFacturacionChanged: BehaviorSubject<MunicipioComboProjection[]> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService
	) {
		super(_httpClient, snackBar, hashid);
	}

	
}