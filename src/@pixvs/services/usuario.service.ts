import { Injectable } from '@angular/core';

import { HttpService } from '@pixvs/services/http.service';

import { environment } from '@environments/environment';
import { Usuario } from '@models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioLocalService {
    constructor(private httpService: HttpService) { }

    getUsuarioActual(): Usuario {
        return JSON.parse(localStorage.getItem('usuario') || null);
    }

    getPermisos(): Array<string> {
        return JSON.parse(localStorage.getItem('menu_permisos') || null);
    }

    isLogin(): boolean {
        return JSON.parse(localStorage.getItem('login')) === true;
    }

}
