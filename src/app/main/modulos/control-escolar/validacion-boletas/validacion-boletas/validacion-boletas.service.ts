import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { Resolve } from '@angular/router';
import { HttpService } from '@services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HashidsService } from '@services/hashids.service';

@Injectable()
export class ValidacionBoletasService extends FichaDataService implements Resolve<any> {
    constructor(
        _httpClient: HttpService,
        _snackBar: MatSnackBar,
        _hashid: HashidsService,
    ) {
        super(_httpClient, _snackBar, _hashid);
     }
    
}