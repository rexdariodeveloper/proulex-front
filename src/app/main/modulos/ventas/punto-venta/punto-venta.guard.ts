import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '@pixvs/services/authentication.service';
import { UsuarioLocalService } from '@pixvs/services/usuario.service';

import { environment } from '@environments/environment';
import { PuntoVentaGeneralService } from '@app/main/services/punto-venta.service';

@Injectable({ providedIn: 'root' })
export class PuntoVentaGuard implements CanActivate {
    constructor(
        private router: Router,
        private _puntoVentaGeneralService: PuntoVentaGeneralService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const sucursalActualId = this._puntoVentaGeneralService.getSucursalId();

        if(!!sucursalActualId){
            this.router.navigate(['/app/ventas/punto-venta/abierto']);
            return false;
        }else{
            return true;
        }
        
    }
}
