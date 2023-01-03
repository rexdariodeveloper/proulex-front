import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '@pixvs/services/authentication.service';
import { UsuarioLocalService } from '@pixvs/services/usuario.service';

import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private UsuarioLocalService: UsuarioLocalService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.UsuarioLocalService.getUsuarioActual();
        const enviroment = environment;

        if(enviroment.noRequiredLogin ){
            return true;
        }

        if(!enviroment.noRequiredLogin){
            // if (currentUser && 
            //     (state.url.includes("/nuevo") || state.url.includes("/ver") || state.url.includes("/editar") || state.url.includes("/alerta")
            //         || state.url.startsWith("/sistema/") || state.url == "/inicio" || state.url == "/" || this.UsuarioLocalService.getPermisos().indexOf(state.url) > -1)) {
            if (currentUser && (state.url.startsWith("/sistema/") || state.url == "/inicio" || state.url == "/")) {
                // authorised so return true
                return true;
            }
            for(let rutaPermiso of (this.UsuarioLocalService.getPermisos() || [])){
                if(state.url.startsWith(rutaPermiso)){
                    // authorised so return true
                    return true;
                }
            }

            if (this.UsuarioLocalService.isLogin()) {
                // logged in so redirect to 404
                this.router.navigate(['/sistema/errors/error-404'], { queryParams: { returnUrl: state.url } });
                return false;
            }

            // not logged in so redirect to login page with the return url
            this.router.navigate(['/acceso/login'], { queryParams: { returnUrl: state.url } });
            return false;
        }
        
    }
}
