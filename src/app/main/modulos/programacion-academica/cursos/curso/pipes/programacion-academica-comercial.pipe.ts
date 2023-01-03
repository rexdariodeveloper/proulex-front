import { Pipe, PipeTransform } from '@angular/core';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
import { ProgramacionAcademicaComercialCursoProjection } from '@app/main/modelos/programacion-academica-comercial';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';

@Pipe({name: 'CursoProgramacionAcademicaComercialPipe'})
export class CursoProgramacionAcademicaComercialPipe implements PipeTransform {
    transform(programacionAcademicaComercial: ProgramacionAcademicaComercialCursoProjection[], idiomaId: number, programaId: number): ProgramacionAcademicaComercialCursoProjection[] {
        if(!idiomaId || !programaId){
            return [];
        }
        return programacionAcademicaComercial?.filter(pac => {
            let retVal: boolean = false;
            for(let detalle of pac.detalles){
                if(detalle.idioma.id == idiomaId){
                    for(let programa of detalle.programas){
                        if(programa.id == programaId){
                            retVal = true;
                            break;
                        }
                    }
                    if(retVal){
                        break;
                    }
                }
            }
            return retVal;
        });
    }
}