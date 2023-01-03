import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionDocumentosRHService extends FichaDataService implements Resolve<any> {

  constructor(
    _httpService: HttpService,
    _snackBar: MatSnackBar,
    _hashidsService: HashidsService
  ) {
    super(_httpService, _snackBar, _hashidsService);
   }
}
