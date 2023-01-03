import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProgramaService } from '@app/main/services/programa.service';
import { ProgramaCalcularDiasProjection } from '@app/main/modelos/programa';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class ProgramacionAcademicaComercialService extends FichaDataService implements Resolve<any>
{

	onProgramasCalcularDiasChanged: BehaviorSubject<ProgramaCalcularDiasProjection[]> = new BehaviorSubject(null);

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
		private _programaService: ProgramaService
    ) {
        super(_httpClient, snackBar, hashid);
    }

	getProgramasCalcularDias(idiomaId: number, modalidadId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._programaService.getProgramasCalcularDias(idiomaId,modalidadId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onProgramasCalcularDiasChanged.next(response.data);
					} else {
						this.onProgramasCalcularDiasChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onProgramasCalcularDiasChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}
    
}