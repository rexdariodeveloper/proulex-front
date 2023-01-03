import { Component } from '@angular/core';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { fuseAnimations } from '@fuse/animations';
import { environment } from '@environments/environment';


import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'inicio',
    templateUrl: './inicio.component.html',
    styleUrls: ['./inicio.component.scss'],
    animations: fuseAnimations
})
export class InicioComponent {

    apiUrl = environment.apiUrl;
    /**
     * Constructor
     *
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     */
    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private titleService: Title
    ) {
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);
        this.titleService.setTitle("PIXVS");

    }
}
