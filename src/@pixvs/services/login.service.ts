import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '@pixvs/services/http.service';
import { Usuario } from '@models/usuario';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { HashidsService } from './hashids.service';

@Injectable({ providedIn: 'root' })
export class LoginService {

	public isloggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private usuario: Usuario = new Usuario();
	private subscriptions: Array<Subscription> = [];

	constructor(
		private httpService: HttpService,
		private router: Router,
		private hashid: HashidsService
	) {
		this.usuario = JSON.parse(localStorage.getItem('usuario') || null);
		if (!localStorage.getItem('login') || !JSON.parse(localStorage.getItem('login'))) {
			this.isloggedIn.next(false);
		} else {
			this.isloggedIn.next(true);
		}
		this.httpService.errorLogout.subscribe(logout => {
			if (logout >= 0) {
				this.logout();
			}
		});
	}

	ngOnInit() { }

	login(usuario: string, contrasenia: string): Observable<any> {
		return this.httpService
			.post(JSON.stringify({ usuario, contrasenia }), '/v1/usuario/login', false);
	}

	loginSiiauGeneral(codigo: string, psw: string): Observable<any> {
		let ciclo = '';
		return this.httpService
			.post(JSON.stringify({ codigo, psw, ciclo }), '/v1/usuario/login_siiau_general', false);///v1/siiau/login
	}
	
	loginSiiau(codigo: string, psw: string): Observable<any> {
		let ciclo = '';
		return this.httpService
			.post(JSON.stringify({ codigo, psw, ciclo }), '/v1/usuario/login_siiau', false);///v1/siiau/login
	}

	verify(usuario: string, codigo: string): Observable<any> {
		return this.httpService
			.post(JSON.stringify({ usuario, codigo }), '/v1/usuario/verificar', false);
	}

	onLoggedIn(data: any) {
		this.usuario = data.usuario;
		if (this.usuario.archivoId != null) {
			this.usuario.img = environment.apiUrl + '/v1/archivo/' + this.hashid.encode(this.usuario.archivoId);
		}
		this.isloggedIn.next(true);
		localStorage.setItem('login', 'true');
		localStorage.setItem('usuario', JSON.stringify(this.usuario));
		localStorage.setItem('token', JSON.stringify(data.token));
	}

	onLoggedInSiiau(data: any){
		/*
		let usuario = {
			carrera: data.carrera,
			centro: data.centro,
			codigo: data.codigo,
			nombre: data.nombre,
			rol: data.rol
		};

		this.usuario = new Usuario();
		let partes = usuario.nombre.split(' ').reverse();
		this.usuario.primerApellido = partes[1];
		this.usuario.segundoApellido = partes[0];
		this.usuario.nombre = usuario.nombre.replace([partes[1],partes[0]].join(' '), '');
		this.usuario.nombreCompleto = usuario.nombre;
		this.usuario.token = data.token;
		*/
		this.usuario = data.usuario;

		this.isloggedIn.next(true);
		localStorage.setItem('login', 'true');
		localStorage.setItem('usuario', JSON.stringify(this.usuario));
		localStorage.setItem('token', JSON.stringify(data.token));
		localStorage.setItem('tokenSIIAU', JSON.stringify(data.tokenSIIAU));
		localStorage.setItem('datosSIIAU', JSON.stringify(data.datosSIIAU));
	} 

	logout() {
		localStorage.setItem('login', 'false');
		localStorage.removeItem('usuario');
		localStorage.removeItem('token');
		localStorage.removeItem('menu');
		localStorage.removeItem('tokenSIIAU');
        localStorage.removeItem('datosSIIAU');
        localStorage.removeItem('plantelPuntoVentaId');
        localStorage.removeItem('sucursalPuntoVentaId');
        localStorage.removeItem('ficha-listado-buscador');
		this.router.navigate(['/acceso/login']);
		this.isloggedIn.next(false);
	}

	getUsuario(): Usuario {
		return this.usuario;
	}

	generarRecuperacion(email: string): Observable<any> {
		return this.httpService
			.post(JSON.stringify({ email }), '/v1/usuario/recuperacion/generar', false);
	}

	buscarUsuarioRecuperacion(token: string): Observable<any> {
		return this.httpService
			.post(JSON.stringify({ token }), '/v1/usuario/recuperacion/buscar', false);
	}

	actualizarContrasenia(token: string, contrasenia: string): Observable<any> {
		return this.httpService
			.post(JSON.stringify({ token, contrasenia }), '/v1/usuario/recuperacion/reestablecer', false);
	}

	verificarCorreo(usuarioId: string): Observable<any> {
		return this.httpService
			.post(JSON.stringify({ 'usuarioId': usuarioId }), '/v1/usuario/confirm', false);
	}

	ngOnDestroy() {
		this.subscriptions.forEach((subscription: Subscription) => {
			if (!!subscription) {
				subscription.unsubscribe();
			}
		})
	}

	getError(error: HttpErrorResponse) {
		return this.httpService.getError(error);
	}
}
