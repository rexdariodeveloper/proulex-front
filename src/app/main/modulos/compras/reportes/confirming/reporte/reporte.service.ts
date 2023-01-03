import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';

@Injectable()
export class ReporteConfirmingService extends FichaDataService implements Resolve<any>{
	
	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService
    ) {
		super(_httpClient, snackBar, hashid);
	}
    
}
