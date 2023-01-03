import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class RolService extends FichaDataService implements Resolve<any>
{

    onPermisosChanged: BehaviorSubject<any>;
    
    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
    ) {
        super(_httpClient, snackBar, hashid);
        this.onPermisosChanged = new BehaviorSubject(null);
    }
    
    togglePermiso(permiso, url): Promise<any> {
        return new Promise((resolve, reject) => {
            
            this._httpClient.post(permiso, url, true)
                .subscribe((response: any) => {

                    if (response.status == 200) {
                        this.onPermisosChanged.next(response.data);
                    } else {
						let snackbarError;
                        switch(response.status){
                            case 1557:
                                snackbarError = this.snackBar.open(this.getError(response), 'OK', {
                                    duration: 5000,
                                });
                            break;
                            case 1558:
                                snackbarError = this.snackBar.open(this.translate.instant('MENSAJE.CORREO_EN_USO').replace("#",this.getError(response)), 'OK', {
                                    duration: 5000,
                                });
                            break;
                            default:
                                this.datos = [];
                                snackbarError = this.snackBar.open(response.message, 'OK', {
                                    duration: 5000,
                                });
                        }
						snackbarError.afterDismissed().subscribe(o => {
							this.onErrorGuardarChanged.next(true);
						});
                    }

                    resolve(response);
                }, err => {
                    let snackbarError = this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
					snackbarError.afterDismissed().subscribe(o => {
						this.onErrorGuardarChanged.next(true);
					});

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }
}
