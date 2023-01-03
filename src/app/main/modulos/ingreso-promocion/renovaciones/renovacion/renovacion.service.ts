import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';

@Injectable()
export class RenovacionService extends FichaDataService implements Resolve<any> {

  constructor(
    _httpClient: HttpService,
    _snackBar: MatSnackBar,
    _hashid: HashidsService,
  ) {
    super(_httpClient, _snackBar, _hashid);
   }
}
