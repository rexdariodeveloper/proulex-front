import { Injectable } from '@angular/core';
import { ArchivoProjection } from '@models/archivo';
import { MimeTypeUtil } from '@pixvs/utils/mime-type.util';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ArchivoService {

	onError: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor(
		public _httpClient: HttpService,
		private hashid: HashidsService
	){}

	fileUpload(file: File, idEstructuraArchivo: number, idTipo: number, publico: boolean, activo: boolean, subcarpeta: string = null): Observable<Object>{
		let formData: FormData = new FormData();
		formData.append('file',file,file.name);
		formData.append('idEstructuraArchivo',String(idEstructuraArchivo));
		formData.append('subcarpeta',subcarpeta);
		formData.append('idTipo',String(idTipo || 0));
		formData.append('publico',String(publico));
		formData.append('activo',String(activo));
		return this._httpClient.upload_form(formData,`/api/v1/upload`,true);
	}

	fileUploadXML(file: File, idEstructuraArchivo: number, idTipo: number, publico: boolean, activo: boolean, subcarpeta: string = null, ruta: string): Observable<Object>{
		let formData: FormData = new FormData();
		formData.append('file',file,file.name);
		formData.append('idEstructuraArchivo',String(idEstructuraArchivo));
		formData.append('subcarpeta',subcarpeta);
		formData.append('idTipo',String(idTipo || 0));
		formData.append('publico',String(publico));
		formData.append('activo',String(activo));
		return this._httpClient.upload_form(formData,ruta,true);
	}

	getProjection(archivoId: number): Observable<Object>{
		return this._httpClient.get(`/api/v1/archivo/projection/${this.hashid.encode(archivoId)}`,true);
	}

	descargarArchivo(archivoId: number): Observable<any>{
		return this._httpClient.get_file(`/api/v1/archivo/${this.hashid.encode(archivoId)}`, true);
	}

	verArchivo(archivo: ArchivoProjection, blob: Blob){
		let extension: string = archivo.nombreOriginal.substr(archivo.nombreOriginal.lastIndexOf('.'));
		this._httpClient.openFile(blob,extension);
	}

	descargarArchivoResponse(blob: Blob, archivoExtension?: string, archivoNombre?: string): boolean{
		try{
			if(archivoExtension){
				blob = new Blob([blob], {type: MimeTypeUtil.mapPorExtension[archivoExtension]});
			}
			let fileURL: string = window.URL.createObjectURL(blob);
			let a: any = document.createElement("a");
		    document.body.appendChild(a);
		    a.style = "display: none";
			a.href = fileURL;
			a.download = archivoNombre || ("temp" + (archivoExtension || ""));
			a.click();
			window.URL.revokeObjectURL(fileURL);
			document.body.removeChild(a);
			return true;
		}catch(e){
			console.log(e);
			return false;
		}
	}

}