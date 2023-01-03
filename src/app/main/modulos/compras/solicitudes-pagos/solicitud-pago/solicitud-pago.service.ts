import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { ArticuloCategoriaService } from '@app/main/services/articulo-categoria.service';
import { ArticuloCategoriaComboProjection } from '@app/main/modelos/articulo-categoria';
import { JsonResponse } from '@models/json-response';
import { ArticuloSubcategoriaService } from '@app/main/services/articulo-subcategoria.service';
import { ArticuloSubcategoriaComboProjection } from '@app/main/modelos/articulo-subcategoria';
import { ArticuloSubtipoService } from '@app/main/services/articulo-subtipo.service';
import { ArticuloSubtipoComboProjection } from '@app/main/modelos/articulo-subtipo';
import { ArchivoService } from '@app/main/services/archivo.service';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { EstadoService } from '@app/main/services/estado.service';
import { JsonFacturaXML } from '@app/main/modelos/json-factura-xml';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';
import { ArchivoProjection } from '@models/archivo';


@Injectable()
export class SolicitudPagoService extends FichaDataService implements Resolve<any>{
	
	onComboEstadosChanged: BehaviorSubject <EstadoComboProjection[]> ;
	onPDFChanged: BehaviorSubject <number> ;
	onXMLChanged: BehaviorSubject <JsonFacturaXML> ;
	
	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService,
		private archivoService: ArchivoService
    ) {
		super(_httpClient, snackBar, hashid);
		// this.consultasIniciales = [];
		this.onComboEstadosChanged = new BehaviorSubject(null);
		this.onPDFChanged = new BehaviorSubject(null);
		this.onXMLChanged = new BehaviorSubject(null);
	}
	
	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */
	getComboEstados(paisId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboEstadosChanged.next(response.data);
					} else {
						this.onComboEstadosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboEstadosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	subirArchivo(archivo: File, proveedorRfc: string, esXML: boolean): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			if(esXML){
				this.archivoService.fileUploadXML(archivo,ArchivosEstructurasCarpetas.PAGOS_CXP.id,null,false,true,proveedorRfc,`/api/v1/solicitud-pago/upload/xml`)
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
				this.archivoService.fileUpload(archivo,ArchivosEstructurasCarpetas.PAGOS_CXP.id,null,false,true,proveedorRfc)
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
