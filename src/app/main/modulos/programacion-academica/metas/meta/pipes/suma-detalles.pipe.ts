import { Pipe, PipeTransform } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ProgramacionAcademicaComercialDetalleMetaListadoProjection } from '@app/main/modelos/programacion-academica-comercial-detalle';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import * as moment from 'moment';

@Pipe({name: 'MetaSumaDetallesPipe'})
export class MetaSumaDetallesPipe implements PipeTransform {
    transform(datasource: MatTableDataSource<ProgramacionAcademicaComercialDetalleMetaListadoProjection>, sedeSeleccionada: SucursalComboProjection, programaMetaDetallesJsonEditar: {[sucursalId:string]: {[paModalidadId:string]: {[fechaInicio:string]: number}}} = {}): number {
        let metaTotal: number = 0;
        datasource.filteredData.forEach(detalle => {
            metaTotal += ((programaMetaDetallesJsonEditar[sedeSeleccionada.id] || {})[detalle.paModalidadId] || {})[moment(detalle.fechaInicio).format('YYYY-MM-DD')] || 0;
        });
        return metaTotal;
    }
}