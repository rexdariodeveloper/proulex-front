import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { FichasDataService } from '@services/fichas-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteAlumnosSinGrupoListadoService extends FichasDataService implements Resolve<any> {

  private urlApi = '/api/v1/reporte-alumnos-sin-grupo';

  constructor(
    _httpClient: HttpService,
		_snackBar: MatSnackBar,
		_hashid: HashidsService,
  ) { 
    super(_httpClient, _snackBar, _hashid);
  }
}
