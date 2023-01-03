import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { JsonResponse } from "@models/json-response";
import { HttpService } from "@services/http.service";

@Injectable()
export class PixvsMatSelectService {

    constructor(
        private _httpClient: HttpService,
        private snackBar: MatSnackBar
    ) {
    }

    getDatos(ruta: string, busqueda: string): Promise < any > {
        let requestBody = {
            busqueda
        };
		return new Promise((resolve, reject) => {
			this._httpClient.post(JSON.stringify(requestBody),`${ruta}`,true)
				.subscribe((response: any) => {
					if (response.status != 200) {
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

    getError(error: HttpErrorResponse) {
        return this._httpClient.getError(error);
    }

}