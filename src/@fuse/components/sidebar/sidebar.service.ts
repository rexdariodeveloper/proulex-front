import { Injectable } from '@angular/core';

import { FuseSidebarComponent } from './sidebar.component';
import { AlertaDetalle } from '@models/alerta-detalle';
import { Usuario } from '@models/usuario';
import { HttpService } from '@services/http.service';

@Injectable({
    providedIn: 'root'
})
export class FuseSidebarService {
    // Private
    private _registry: { [key: string]: FuseSidebarComponent } = {};

    //Alertas y Notificaiones
    private _notificaciones: number = 0
    private autorizaciones: Array<AlertaDetalle>;
    private notificaciones: Array<AlertaDetalle>;

    /**
     * Constructor
     */
    constructor(private _httpService: HttpService) {

    }

    /**
     * Add the sidebar to the registry
     *
     * @param key
     * @param sidebar
     */
    register(key, sidebar): void {
        // Check if the key already being used
        if (this._registry[key]) {
            console.error(`The sidebar with the key '${key}' already exists. Either unregister it first or use a unique key.`);

            return;
        }

        // Add to the registry
        this._registry[key] = sidebar;
    }

    /**
     * Remove the sidebar from the registry
     *
     * @param key
     */
    unregister(key): void {
        // Check if the sidebar exists
        if (!this._registry[key]) {
            console.warn(`The sidebar with the key '${key}' doesn't exist in the registry.`);
        }

        // Unregister the sidebar
        delete this._registry[key];
    }

    /**
     * Return the sidebar with the given key
     *
     * @param key
     * @returns {FuseSidebarComponent}
     */
    getSidebar(key): FuseSidebarComponent {
        // Check if the sidebar exists
        if (!this._registry[key]) {
            console.warn(`The sidebar with the key '${key}' doesn't exist in the registry.`);

            return;
        }

        // Return the sidebar
        return this._registry[key];
    }

    getNotificaciones(): number {
        return this._notificaciones
    }

    setNotificaciones(notificaciones: number): void {
        this._notificaciones = notificaciones;
    }

    getAutorizaciones(): Promise<any> {

        // return null;
        let usuario: Usuario = JSON.parse(localStorage.getItem('usuario'));

        if (usuario) {

            return new Promise((resolve, reject) => {
                this._httpService.get('/v1/alerta/usuario/' + usuario.id, true)
                    .subscribe((response: any) => {
                        this.autorizaciones = response.data.alertas;
                        this.notificaciones = response.data.notificaciones;


                        let sp: number[] = [];

                        this.autorizaciones.forEach(a => {
                            sp.push(a.alerta.referenciaProcesoId);
                        });

                        let aut = {
                            "sp": sp
                        }

                        localStorage.setItem('autorizaciones', JSON.stringify(aut));

                        this.setNotificaciones((this.autorizaciones.length || 0) + (this.notificaciones.length || 0));

                        resolve(this.autorizaciones);
                    }, reject);
            });
        } else {
            return null;
        }

    }

    getListadoAutorizaciones(): Array<AlertaDetalle> {
        return this.autorizaciones;
    }

    getListadoNotificaciones(): Array<AlertaDetalle> {
        return this.notificaciones;
    }
}
