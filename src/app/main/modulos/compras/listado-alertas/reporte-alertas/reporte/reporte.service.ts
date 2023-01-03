import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { JsonResponse } from '@models/json-response';
import { BehaviorSubject } from 'rxjs';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

@Injectable()
export class ReporteAlertasService extends FichaDataService implements Resolve<any>{

	onEstatusChange: BehaviorSubject<boolean> = new BehaviorSubject(false);
	onActualizarRegistrosChange: BehaviorSubject<boolean> = new BehaviorSubject(false);
	
	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private _fuseSidebarService: FuseSidebarService
    ) {
		super(_httpClient, snackBar, hashid);
	}
	
	changeStatus(data : any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(JSON.stringify(data),'/v1/alerta/estatus', true)
                .subscribe((response: any) => {
                    if(response.status == 200){
                        this.onEstatusChange.next(true);
                        this._fuseSidebarService.getAutorizaciones();
                    }else{
                        this.onActualizarRegistrosChange.next(true);
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    this.cargando = false;
                    resolve(response);
                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
	}

	verAlerta(alertaDetalleId: number, actualizarSidebar: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(JSON.stringify({alertaDetalleId}),'/v1/alerta/ver', true)
                .subscribe((response: any) => {
					if(actualizarSidebar){
						this._fuseSidebarService.getAutorizaciones();
					}
                    resolve(response);
                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
	}

}
