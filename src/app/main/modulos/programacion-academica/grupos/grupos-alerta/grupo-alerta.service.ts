import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HashidsService } from '@services/hashids.service';
import { FichasDataService } from '@services/fichas-data.service';

@Injectable()
export class GrupoAlertasService extends FichasDataService implements Resolve<any>
{

	urlApi: string = '/api/v1/grupos';

    constructor(
		_httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
    ) {
		super(_httpClient, snackBar, hashid);
	}
    
}