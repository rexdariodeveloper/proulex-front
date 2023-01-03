import { Pipe, PipeTransform } from '@angular/core';
import { TiposTelefono } from '../phone-picker.component';

@Pipe({name: 'PhonePickerTiposPipe'})
export class PhonePickerTiposPipe implements PipeTransform {
    transform(tiposSeleccionados: TiposTelefono[], tipoValidar: TiposTelefono): any {
        return !tiposSeleccionados.includes(tipoValidar);
    }
}