import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from '@pixvs/services/http.service';
import { AlertaDetalle } from '@models/alerta-detalle';
import { Router, ActivatedRoute } from '@angular/router';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { ControlesMaestrosMultiples } from '@pixvs/models/mapeos/controles-maestros-multiples';
import { HashidsService } from '@services/hashids.service';

@Component({
    selector: 'quick-panel',
    templateUrl: './quick-panel.component.html',
    styleUrls: ['./quick-panel.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class QuickPanelComponent implements OnInit, OnDestroy {
    date: Date;
    notificaciones: any[];

    /**
     * Constructor
     */
    constructor(
        private _httpService: HttpService,
        private router: Router,
        private route: ActivatedRoute,
        public _fuseSidebarService: FuseSidebarService,
        private translationLoader: FuseTranslationLoaderService,
		private hashid: HashidsService
    ) {
        this.translationLoader.loadTranslations(english, spanish);

        // Set the defaults
        this.date = new Date();
    }


    ngOnInit(): void {

        this.getAutorizaciones();
    }


    getAutorizaciones(): void {

        this._fuseSidebarService.getAutorizaciones()

    }


    actualizaVisto(alertaDetalleId: number): void {

        this._httpService.put(JSON.stringify({alertaDetalleId}),'/v1/alerta/ver', true)
            .subscribe((response: any) => {
                this._fuseSidebarService.getAutorizaciones();
            },
                err => {
                    console.log(err);
                }
            )

    }

    ngOnDestroy(): void {
    }

    seleccionaAutorizacion(autorizacion: AlertaDetalle) {
        let etapa;
        if (!autorizacion.visto) {
            this.actualizaVisto(autorizacion.id);
        }

        autorizacion.visto = true;
        etapa = autorizacion.etapa;

        this._fuseSidebarService.getSidebar('quickPanel').toggleOpen();

        this._fuseSidebarService.setNotificaciones(this._fuseSidebarService.getListadoAutorizaciones().length);

		let encoded = this.hashid.encode(autorizacion.alerta.referenciaProcesoId);
        let url: string;
        url = !!autorizacion.alerta.config.urlAlerta? autorizacion.alerta.config.urlAlerta : (autorizacion.alerta.config.url + '/alerta/');
        this.router.navigate([url + encoded]);
    }

    seleccionaNotificacion(autorizacion: AlertaDetalle) {

        this.actualizaVisto(autorizacion.id);

        autorizacion.visto = true;

        this._fuseSidebarService.getSidebar('quickPanel').toggleOpen();

        this._fuseSidebarService.setNotificaciones(this._fuseSidebarService.getListadoAutorizaciones().length);

		let encoded = this.hashid.encode(autorizacion.alerta.referenciaProcesoId);
        let url: string;
        url = !!autorizacion.alerta.config.urlNotificacion? autorizacion.alerta.config.urlNotificacion : (autorizacion.alerta.config.url + '/ver/');

        this.router.navigate([url + encoded]);
    }
}
