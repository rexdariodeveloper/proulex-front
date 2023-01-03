import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PAModalidad, PAModalidadComboProjection, PAModalidadDiasProjection } from './pamodalidad';
import { Programa, ProgramaCalcularDiasProjection, ProgramaComboProjection } from './programa';
import { ProgramacionAcademicaComercial } from './programacion-academica-comercial';

export class ProgramacionAcademicaComercialDetalle {

	public id?: number;
	public programacionAcademicaComercial?: ProgramacionAcademicaComercial;
	public programacionAcademicaComercialId?: number;
	public idioma?: ControlMaestroMultiple;
	public idiomaId?: number;
	public paModalidad?: PAModalidad;
	public paModalidadId?: number;
	public fechaInicio?: any;
	public fechaFin?: any;
	public comentarios?: string;
	public programas?: Programa[];

}

export class ProgramacionAcademicaComercialDetalleEditarProjection {

	public id?: number;
	public idioma?: ControlMaestroMultipleComboProjection;
    public paModalidad?: PAModalidadDiasProjection;
    public fechaInicio?: any;
    public fechaFin?: any;
    public numeroClases?: number;
    public comentarios?: string;
    public programas?: ProgramaCalcularDiasProjection[];

	// Campos para usar solo en front
	public idTmp?: number;
	public programasStr?: string;

}

export class ProgramacionAcademicaComercialDetalleCursoProjection {

	public id?: number;
    public idioma?: ControlMaestroMultipleComboProjection;
    public paModalidad?: PAModalidadComboProjection;
    public programas?: ProgramaComboProjection[];
    public fechaInicio?: any;
    public fechaFin?: any;

}

export class ProgramacionAcademicaComercialDetalleMetaListadoProjection {
	public paModalidadId?: number;
    public paModalidadNombre?: string;
    public fechaInicio?: any;
    public fechaFin?: any;
}