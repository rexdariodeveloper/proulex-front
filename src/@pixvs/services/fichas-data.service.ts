import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from './ficha-data.service';
import { HashidsService } from './hashids.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class FichasDataService extends FichaDataService implements Resolve<any>
{
    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
        translate?: TranslateService,
    ) {
        super(_httpClient, snackBar, hashid, translate);
    }
}
