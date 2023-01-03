import { Pipe, PipeTransform } from '@angular/core';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';

@Pipe({ name: 'aLetra' })
export class TextoPipe implements PipeTransform {

    lang: string = 'es';
    /* 
        Se agrego la propiedad de nombre, ya que en los archivos donde se utiliza, se manda el nombre de la moneda
            y por ello, no coincidia con los valores de SAT, y por ello siempre se usaba MXN
    */
    currencyDetails: any[] = [
        {sat: 'MXN', clave:'MXN', plural:'PESOS', singular:'PESO', nombre: 'Peso'},
        {sat: 'USD', clave:'USD', plural:'CURRENCY.DOLARES' , singular:'CURRENCY.DOLAR', nombre: 'Dólar'},
        {sat: 'EUR', clave:'EUR', plural:'EUROS' , singular:'EURO', nombre: 'Euro'}
    ];

    constructor(private translate: TranslateService, private _fuseTranslationLoaderService: FuseTranslationLoaderService,) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this.lang = translate.currentLang;
    }

    transform(numero: string | number, currency?: string): string {
        let num = Number(numero);

        if (isNaN(num))
            return '';
        if(num < 0)
            return '';
        if(num > 999999999.99)
            return '';

        let cur = this.currencyDetails.find( detail => detail.nombre == (currency? currency : 'Peso'));
        
        return this.getTexto(num, cur);
    }

    unidades(number: number): string {
        let arrayUnidadesES: string[] = ['UN','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
        let arrayUnidadesEN: string[] = ['ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE'];
        if(number == 0)
            return "";
        if(this.lang == 'es')
            return arrayUnidadesES[number - 1];
        else
            return arrayUnidadesEN[number - 1];
    }

    decenas(number: number): string {
        let arrayDecenasES: string[] = ["DIECI","VEINTI","TREINTA","CUARENTA","CINCUENTA","SESENTA","SETENTA","OCHENTA","NOVENTA"];
        let arrayDiezES: string[]    = ["DIEZ","ONCE","DOCE","TRECE","CATORCE","QUINCE"];
        let arrayDecenasEN: string[] = ["TEN","TWENTY","THIRTY","FORTY","FIFTY","SIXTY","SEVENTY","EIGHTY","NINETY"];
        let arrayDiezEN: string[]    = ["TEN","ELEVEN","TWELVE","THIRTEEN","FOURTEEN","FIFTEEN","SIXTEEN","SEVENTEEN","EIGHTEEN","NINETEEN"];

        let decena = Math.floor(number / 10);
        let unidad = Math.floor((number - (decena * 10)));

        if(decena == 0)
            return this.unidades(unidad);

        if(this.lang == 'es'){
            if(decena == 1){
                if(unidad <= 5)
                    return arrayDiezES[unidad];
                else
                    return arrayDecenasES[decena - 1] + this.unidades(unidad);
            }
            else if(decena == 2){
                if(unidad == 0)
                    return "VEINTE";
                else
                    return arrayDecenasES[decena - 1] + this.unidades(unidad);
            } 
            else{
                if(unidad == 0)
                    return arrayDecenasES[decena -1];
                else
                    return arrayDecenasES[decena - 1] +' Y '+ this.unidades(unidad);
            } 
        }
        else {
            if(decena == 1){
                return arrayDiezEN[unidad];
            }
            else {
                if(unidad == 0)
                    return arrayDecenasEN[decena - 1];
                else
                    return arrayDecenasEN[decena - 1] + ' ' + this.unidades(unidad);
            }
        }
        
    }

    centenas(number: number): string {
        let arrayCentenasES: string[] = ['CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
        let arrayCentenasEN: string[] = ["ONE HUNDRED","TWO HUNDRED","THREE HUNDRED","FOUR HUNDRED","FIVE HUNDRED","SIX HUNDRED","SEVEN HUNDRED","EIGTH HUNDRED","NINE HUNDRED"];
        
        let centenas = Math.floor(number / 100);
        let decenas  = number - (centenas * 100);

        if(centenas == 0)
            return this.decenas(decenas);

        if(this.lang == 'es'){
            if(centenas == 1 && decenas == 0)
                return "CIEN";
            else
                return arrayCentenasES[centenas - 1] + ' ' + this.decenas(decenas);
        }
        else {
            return arrayCentenasEN[centenas - 1] + ' ' + this.decenas(decenas);
        }
    }

    miles(number: number): string {
        let cientos = Math.floor(number / 1000);
        let resto   = Math.floor((number - (cientos * 1000)));

        let miles = '';
        if(this.lang == 'es')
            miles    = this.seccion(number, 1000, 'UN MIL', 'MIL');
        else
            miles    = this.seccion(number, 1000, 'THOUSAND', 'THOUSAND');
        let centenas = this.centenas(resto);

        return miles == ''? centenas : (miles + ' ' + centenas);
    }

    millones(number: number): string {
        let cientos = Math.floor(number / 1000000);
        let resto   = Math.floor((number - (cientos * 1000000)));
        
        let millones = '';
        if(this.lang == 'es')
            millones = this.seccion(number, 1000000, 'UN MILLÓN', 'MILLONES');
        else
            millones = this.seccion(number, 1000000, 'MILLION', 'MILLION');
        let miles    = this.miles(resto);

        return millones == ''? miles : (millones + ' ' + miles);
    }

    seccion(number: number, divisor: number, singular: string, plural: string): string {
        let cientos = Math.floor(number / divisor);
        //let resto   = number - (cientos * divisor);

        if(cientos == 0)
            return "";
        else if(cientos == 1)
            return singular;
        else
            return this.centenas(cientos) + ' ' + plural;
    }

    getTexto(number: number, currency: any): string {
        let entero   = Math.floor(number);
        let decimal  = Math.floor((number - entero) * 100);
        let singular = currency.singular;
        let plural   = currency.plural;
        let clave    = currency.clave;

        if(entero == 0)
            return this.translate.instant('CURRENCY.CERO') + " " + this.translate.instant(plural) + " " + decimal + "/100 " + clave;
        else if(entero == 1)
            return this.translate.instant('CURRENCY.UNO') + " " + this.translate.instant(singular) + " " + decimal + "/100 " + clave;
        else
            return this.millones(number) +" "+ this.translate.instant(plural) + " " + decimal + "/100 " + clave;
    }
}