import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonResponse } from '@models/json-response';
import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { EstadisticaPagina } from '@models/estadistica-pagina';


@Injectable({ providedIn: 'root' })
export abstract class EstadisticaPaginaService {

    datos: any;

    /**
     * Constructor
     *
     * @param {HttpService} _httpClient
     */
    constructor(
        public _httpClient: HttpService,
        public snackBar: MatSnackBar,
        private deviceService: DeviceDetectorService
    ) {

    }


    guardar(url: string, tipo_id: number): Promise<any> {

        let data: EstadisticaPagina = new EstadisticaPagina();
        data.tipoId = tipo_id;
        data.url = url;

        data.os = this.deviceService.os;
        data.osVersion = this.deviceService.os_version;
        data.browser = this.deviceService.browser;
        data.dispositivo = this.getDispositivo();

        return new Promise((resolve, reject) => {

            this._httpClient.post(data, "/v1/estadistica-pagina/registro", true)
                .subscribe((response: any) => {

                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        if (response.status == 1557) {
                            this.snackBar.open(this.getError(response), 'OK', {
                                duration: 5000,
                            });
                        } else {
                            this.datos = [];
                            this.snackBar.open(response.message, 'OK', {
                                duration: 5000,
                            });
                        }
                    }

                    resolve(response);
                }, err => {
                    this.datos = [];
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    getDispositivo() {
        if (this.deviceService.isMobile())
            return "Móvil";
        else if (this.deviceService.isTablet())
            return "Tablet";
        else
            return "Escritorio";



    }

    getError(error: HttpErrorResponse) {
        return this._httpClient.getError(error);
    }


}
