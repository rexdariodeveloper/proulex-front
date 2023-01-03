import { Injectable, IterableDiffers } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';


@Injectable({ providedIn: 'root' })
export class ValidatorService {

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
    ) { 
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
    }

    isOnlyLetter(control : FormControl){
        if(!control.value) return null;
        if(!!control.value.match("^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]*$")) return null;
        else return {'letter' : true};
    }

    isOnlyNumber(control : FormControl){
        if(!control.value) return null;
        if(!!control.value.match("^[0-9.]*$")) return null;
        else return{'number': true};
    }

    getMessage(valor : FormControl){
        
        if(valor.hasError('email')) return this.translate.instant('ERRORES_CAPTURA.ERROR_CORREO');
        if(valor.hasError('required')) return  this.translate.instant('ERRORES_CAPTURA.CAMPO_REQUERIDO');
        if(valor.hasError('maxlength')) return this.translate.instant("ERRORES_CAPTURA.ERROR_GENERAL_CARACTERES_MAXIMO").replace("#", valor.errors.maxlength.requiredLength);
        if(valor.hasError('minlength')) return this.translate.instant("ERRORES_CAPTURA.ERROR_GENERAL_CARACTERES_MINIMO").replace("#", valor.errors.minlength.requiredLength);
        if(valor.hasError('pattern'))   return this.translate.instant("ERRORES_CAPTURA.ERROR_FORMATO");
        if(valor.hasError('letter')) return this.translate.instant("ERRORES_CAPTURA.CAMPO_SOLO_LETRAS");
		if(valor.hasError('number')) return this.translate.instant("ERRORES_CAPTURA.CAMPO_SOLO_NUMEROS");
		if(valor.hasError('max')) return this.translate.instant("ERRORES_CAPTURA.ERROR_GENERAL_NUMERO_MAXIMO").replace("#", valor.errors.max.max);
        if(valor.hasError('min')) return this.translate.instant("ERRORES_CAPTURA.ERROR_GENERAL_NUMERO_MINIMO").replace("#", valor.errors.min.min);
       
        return null;
    }
    
}