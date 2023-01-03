import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class DashboardService extends FichaDataService implements Resolve<any>
{
    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
    ) {
        super(_httpClient, snackBar, hashid);
        this.onBannerDataChanged = new BehaviorSubject(null);
        this.onHorizontalBarChanged = new BehaviorSubject(null);
        this.onPieChartChanged = new BehaviorSubject(null);
        this.onTableChanged = new BehaviorSubject(null);
        this.onTreeMapChanged = new BehaviorSubject(null);
    }

    onBannerDataChanged: BehaviorSubject<any>;
    onHorizontalBarChanged: BehaviorSubject<any>;
    onPieChartChanged: BehaviorSubject<any>;
    onTableChanged: BehaviorSubject<any>;
    onTreeMapChanged: BehaviorSubject<any>;

    getBannerData() {
        let data = [];

        data.push({'año':'2020', 'mes':'ENE', 'value': 93835});
        data.push({'año':'2020', 'mes':'FEB', 'value': 79849});
        data.push({'año':'2020', 'mes':'MAR', 'value': 37034});
        data.push({'año':'2020', 'mes':'ABR', 'value': 75537});
        data.push({'año':'2020', 'mes':'MAY', 'value': 44249});
        data.push({'año':'2020', 'mes':'JUN', 'value': 75292});
        data.push({'año':'2020', 'mes':'JUL', 'value': 44526});
        data.push({'año':'2020', 'mes':'AGO', 'value': 99790});
        data.push({'año':'2020', 'mes':'SEP', 'value': 12635});
        data.push({'año':'2020', 'mes':'OCT', 'value': 10261});
        data.push({'año':'2020', 'mes':'NOV', 'value': 1185});
        data.push({'año':'2020', 'mes':'DIC', 'value': 60940});

        data.push({'año':'2021', 'mes':'ENE', 'value': 72109});
        data.push({'año':'2021', 'mes':'FEB', 'value': 49464});
        data.push({'año':'2021', 'mes':'MAR', 'value': 60038});
        data.push({'año':'2021', 'mes':'ABR', 'value': 73338});
        data.push({'año':'2021', 'mes':'MAY', 'value': 53614});

        this.datos = data;
        this.onBannerDataChanged.next({data: this.datos});
    }

    getHorizontalBarData(formData): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(formData,`/api/v1/dashboard/horario-idioma`,true)
				.subscribe((response: any) => {
					if (response.status == 200) {
						this.onHorizontalBarChanged.next(response.data);
					} else {
						this.onHorizontalBarChanged.next(null);
						this.snackBar.open(this.getError(response), 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.onHorizontalBarChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
        });
    }

    getPieChartData(formData): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(formData,`/api/v1/dashboard/programa`,true)
				.subscribe((response: any) => {
					if (response.status == 200) {
						this.onPieChartChanged.next(response.data);
					} else {
						this.onPieChartChanged.next(null);
						this.snackBar.open(this.getError(response), 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.onPieChartChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
        });
    }

    getTableData(formData): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(formData,`/api/v1/dashboard/descuentos`,true)
				.subscribe((response: any) => {
					if (response.status == 200) {
						this.onTableChanged.next(response.data);
					} else {
						this.onTableChanged.next(null);
						this.snackBar.open(this.getError(response), 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.onTableChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
        });
    }

    getTreeMapData(formData): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(formData,`/api/v1/dashboard/sede`,true)
				.subscribe((response: any) => {
					if (response.status == 200) {
						this.onTreeMapChanged.next(response.data);
					} else {
						this.onTreeMapChanged.next(null);
						this.snackBar.open(this.getError(response), 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.onTreeMapChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
        });
    }
}