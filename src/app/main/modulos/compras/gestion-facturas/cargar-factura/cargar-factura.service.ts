import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';
import { JsonResponse } from '@models/json-response';
import { JsonFacturaXML } from '@app/main/modelos/json-factura-xml';
import { OrdenCompraRelacionarProjection } from '@app/main/modelos/orden-compra';
import { OrdenCompraDetalleRelacionarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { ArchivoProjection } from '@models/archivo';

@Injectable()
export class CargarFacturaService extends FichaDataService implements Resolve<any>
{

	onPDFChanged: BehaviorSubject <number> ;
	onXMLChanged: BehaviorSubject <JsonFacturaXML> ;
	onOrdenesCompraChanged: BehaviorSubject <OrdenCompraRelacionarProjection[]> ;
	onOrdenesCompraDetallesChanged: BehaviorSubject <OrdenCompraDetalleRelacionarProjection[]> ;

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private archivoService: ArchivoService,
		private impuestosArticuloService: ImpuestosArticuloService
    ) {
		super(_httpClient, snackBar, hashid);
		
		this.onPDFChanged = new BehaviorSubject(null);
		this.onXMLChanged = new BehaviorSubject(null);
		this.onOrdenesCompraChanged = new BehaviorSubject(null);
		this.onOrdenesCompraDetallesChanged = new BehaviorSubject(null);
	}
	
	subirArchivo(archivo: File, proveedorRfc: string, esXML: boolean): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			if(esXML){
				this.archivoService.fileUploadXML(archivo,ArchivosEstructurasCarpetas.FACTURAS_CXP.id,null,false,true,proveedorRfc,`/api/v1/gestion-facturas/upload/xml`)
					.subscribe((response: any) => {
						this.cargando = false;
						if (response.status == 200) {
							this.onXMLChanged.next(response.data);
						} else {
							this.onXMLChanged.next(null);
							this.snackBar.open(response.message, 'OK', {
								duration: 5000,
							});
						}
						resolve(response);
					}, err => {
						this.cargando = false;
						this.onXMLChanged.next(null);
						this.snackBar.open(this.getError(err), 'OK', {
							duration: 5000,
						});
						resolve(new JsonResponse(500, this.getError(err), null, null));
					});
			}else{
				this.archivoService.fileUpload(archivo,ArchivosEstructurasCarpetas.FACTURAS_CXP.id,null,false,true,proveedorRfc)
					.subscribe((response: any) => {
						this.cargando = false;
						if (response.status == 200) {
							this.onPDFChanged.next(response.data);
						} else {
							this.onPDFChanged.next(null);
							this.snackBar.open(response.message, 'OK', {
								duration: 5000,
							});
						}
						resolve(response);
					}, err => {
						this.cargando = false;
						this.onPDFChanged.next(null);
						this.snackBar.open(this.getError(err), 'OK', {
							duration: 5000,
						});
						resolve(new JsonResponse(500, this.getError(err), null, null));
					});
			}
		});
	}

	getOrdenesCompra(proveedorId: number): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`/api/v1/gestion-facturas/oc/relacionar/${this.hashid.encode(proveedorId)}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onOrdenesCompraChanged.next(response.data);
					} else {
						this.onOrdenesCompraChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onOrdenesCompraChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getOrdenesCompraDetalles(ordenCompraId: number): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`/api/v1/gestion-facturas/oc/relacionar/${this.hashid.encode(ordenCompraId)}/detalles`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onOrdenesCompraDetallesChanged.next(response.data);
					} else {
						this.onOrdenesCompraDetallesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onOrdenesCompraDetallesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getTotal(cantidad: number, precioUnitario: number, descuento: number, iva: number, ieps: number, cuotaFija: number, decimales: number = 6): number{
		return this.impuestosArticuloService.getMontos(cantidad,precioUnitario,descuento,iva,ieps,cuotaFija, decimales).total;
	}

	verArchivo(evidencia: ArchivoProjection){
		return new Promise((resolve, reject) => {
            this.archivoService.descargarArchivo(evidencia.id)
                .subscribe((response: any) => {
					this.archivoService.verArchivo(evidencia,response.body);
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