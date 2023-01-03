import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';


import { environment } from '@environments/environment';
import { BehaviorSubject } from 'rxjs';
import { MimeTypeUtil } from '@pixvs/utils/mime-type.util';
import { SqlFkIx } from '@app/main/modelos/mapeos/sql-fk-ix';

@Injectable({ providedIn: 'root' })
export class HttpService {

	public errorLogout: BehaviorSubject<number> = new BehaviorSubject(-1);
	public cargandoArchivoImprimir: BehaviorSubject<boolean> = new BehaviorSubject(false);

	constructor(private _httpClient: HttpClient, private router: Router, public translate?: TranslateService,private _fuseTranslationLoaderService?: FuseTranslationLoaderService,) { 
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES); 
	}

	peticion(data: any, path: string, auth: boolean, metodo: string, files: Array<File>) {
		let url = environment.apiUrl + path;
		let headers: HttpHeaders = new HttpHeaders;
		let token: string;

		if (auth && localStorage.getItem('usuario')) {
			token = JSON.parse(localStorage.getItem('token'));
			headers = headers.append('Authorization', 'Bearer ' + token);
		}

		if (files != null) {
			data = new FormData();
			for (let i = 0; i < files.length; i++) {
				data.append("uploads[]", files[i], files[i].name);
			}
		} else {
			if (metodo != 'get_file' && metodo != 'upload') {
				headers = headers.append('Content-Type', 'application/json');
			}
			headers = headers.append('Accept', '*/*');
		}

		switch (metodo) {
			case 'post':
            case 'upload':
				return this._httpClient
					.post(url, data, { headers: headers, withCredentials: (auth ? true : false) });
			case 'put':
				return this._httpClient
					.put(url, data, { headers: headers, withCredentials: (auth ? true : false) });
			case 'get':
				return this._httpClient
					.get(url, { headers: headers, withCredentials: (auth ? true : false) });
			case 'get_file':
				return this._httpClient
					.get(url, { headers: headers, observe: 'response', withCredentials: (auth ? true : false), responseType: 'blob' as 'json' });
			case 'post_get_file':
				return this._httpClient
					.post(url, data, { headers: headers, observe: 'response', withCredentials: (auth ? true : false), responseType: 'blob' as 'json' });
			case 'delete':
				return this._httpClient
					.delete(url, { headers: headers, withCredentials: (auth ? true : false) });

		}

	}


	post(data: any, path: string, auth: boolean) {
		return this.peticion(data, path, auth, 'post', null);
	}

	put(data: any, path: string, auth: boolean) {
		return this.peticion(data, path, auth, 'put', null);
	}

	get(path: string, auth: boolean) {
		return this.peticion(null, path, auth, 'get', null);
	}

	get_file(path: string, auth: boolean) {
		return this.peticion(null, path, auth, 'get_file', null);
	}

	post_get_file(data: any, path: string, auth: boolean) {
		return this.peticion(data, path, auth, 'post_get_file', null);
	}

	delete(path: string, auth: boolean) {
		return this.peticion(null, path, auth, 'delete', null);
	}

	upload(path: string, auth: boolean, files: Array<File>) {
		return this.peticion(null, path, auth, 'post', files);
	}
    
    upload_form(data: FormData, path: string, auth: boolean) {
		return this.peticion(data,path,auth,'upload',null);
	}

	downloadExcel(data: any) {
		const blob = new Blob([data.body], { type: data.body.type });
		const element = document.createElement('a');
		element.href = URL.createObjectURL(blob);

		let filename = this.getFilenameFromContentDisposition(data.headers.get("content-disposition"),'xlsx');

		element.download = filename;
		document.body.appendChild(element);
		element.click();
	}

	downloadPDF(data: any) {
		this.downloadArchivo(data, 'pdf');
	}

	downloadArchivo(data: any, archivoExtension?: string){
		const blob = new Blob([data.body], { type: data.body.type });
		const element = document.createElement('a');
		element.href = URL.createObjectURL(blob);

		let filename = this.getFilenameFromContentDisposition(data.headers.get("content-disposition"),archivoExtension);

		element.download = filename;
		document.body.appendChild(element);
		element.click();
	}

	downloadZip(data: any) {
		const blob = new Blob([data.body], { type: data.body.type });
		const element = document.createElement('a');
		element.href = URL.createObjectURL(blob);

		let filename = this.getFilenameFromContentDisposition(data.headers.get("content-disposition"),'zip');

		element.download = filename;
		document.body.appendChild(element);
		element.click();
	}

	printPDF(data: any) {
		this.printArchivo(data, 'pdf');
	}
	
	printArchivo(data: any, archivoExtension?: string){
		this.cargandoArchivoImprimir.next(true);
		const blob = new Blob([data.body], { type: data.body.type });

		let doc: any = document.getElementById('iframe-print');
		doc.src = URL.createObjectURL(blob);
		doc.onload = () => {
			this.cargandoArchivoImprimir.next(false);
			doc.contentWindow.print();
		}
	}

	openFile(blob: Blob, extension?: string) {
		let type = blob.type;
		if(extension){
			type = MimeTypeUtil.mapPorExtension[extension]
		}
		const blobConstruido = new Blob([blob], { type });
		let urlBlob: string = URL.createObjectURL(blobConstruido);
		window.open(urlBlob,'_blank');
	}


	getFilenameFromContentDisposition(disposition: any, extension: string) {
		let filename = "archivo."+extension;
		try{
			if (extension && disposition && disposition.indexOf('attachment') !== -1) {
				var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
				var matches = filenameRegex.exec(disposition);
				if (matches != null && matches[1]) {
					filename = matches[1].replace(/['"]/g, '');
				}
			}else if(!extension && disposition){
				filename = disposition.split('filename=')[1].split(';')[0];
			}

		}catch(error){
			console.log(error);
		}
		return filename;
	}

	getError(error: any) {
		let mensaje = this.translate.instant('MENSAJE.ERROR_INESPERADO');
		let status = null;

		if (error instanceof HttpErrorResponse) {
			mensaje = (!!error?.error && error?.error["message"]) ? error?.error["message"] : error?.message;
			status = error?.error?.status ? error?.error?.status : error?.status;
		}else{
			mensaje = (!!error?.error && error?.error["message"]) ? error?.error["message"] : error?.message;
			status = error?.error?.status ? error?.error?.status : error?.status;
		}

		switch(status){
			case 0:
				mensaje = this.translate.instant('MENSAJE.PROBLEMA_CONEXION').replace("#", mensaje)
				break;
			case 404:
				mensaje = "(404) "+this.translate.instant('MENSAJE.ERROR_INESPERADO').replace("#", mensaje)
				break;
			case 1506:
				mensaje = this.translate.instant('MENSAJE.INVENTARIO_NEGATIVO').replace("#", mensaje)
				break;
			case 1515:
				mensaje = this.translate.instant('MENSAJE.SQL_NULL').replace("#",error?.message)
				break;
			case 1547:
				mensaje = this.translate.instant('MENSAJE.SQL_DELETE_FK').replace("#", mensaje)
				break;
			case 1548:
				mensaje = SqlFkIx.encuentraErrorPersonalizado(mensaje)
				if(mensaje)
					break;
				mensaje = this.translate.instant('MENSAJE.SQL_EX_INTEGRIDAD_DATOS').replace("#", mensaje)
				break;
			case 1557:
				mensaje = this.translate.instant('MENSAJE.CONCURRENCIA').replace("#", mensaje)
				break;
			default:
				break;

		}

		return mensaje;
	}

	getMenuPublico(){
        return this.peticion(null,'/v1/usuario/menu',false,'get',null);
    }

    enviarCorreo(datos: any){
    	return this.peticion(datos,'/mail/enviar-correo',false,'post',null);
    }

}
