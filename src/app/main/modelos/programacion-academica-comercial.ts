import { Usuario } from "@models/usuario";
import { PACiclo, PACicloComboProjection, PACicloFechaProjection } from "./paciclo";
import { ProgramacionAcademicaComercialDetalle, ProgramacionAcademicaComercialDetalleCursoProjection, ProgramacionAcademicaComercialDetalleEditarProjection } from "./programacion-academica-comercial-detalle";

export class ProgramacionAcademicaComercial {
	
	public id?: number;
	public activo?: boolean;
	public codigo?: string;
	public nombre?: string;
	public paCiclo?: PACiclo;
	public paCicloId?: number;
	public fechaCreacion?: any;
	public creadoPor?: Usuario;
	public creadoPorId?: number;
	public modificadoPor?: Usuario;
	public modificadoPorId?: number;
	public fechaModificacion?: any;
	public detalles?: ProgramacionAcademicaComercialDetalle[];

}

export class ProgramacionAcademicaComercialListadoProjection {

	public id?: number;
    public codigo?: string;
    public nombre?: string;
    public fechaInicio?: any;
    public fechaFin?: any;
    public paCiclo?: string;
    public activo?: boolean;

}

export class ProgramacionAcademicaComercialEditarProjection {

	public id?: number;
    public codigo?: string;
    public nombre?: string;
    public paCiclo?: PACicloFechaProjection;
    public activo?: boolean;
    public fechaModificacion?: any;
    public detalles?: ProgramacionAcademicaComercialDetalleEditarProjection[];

}

export class ProgramacionAcademicaComercialComboProjection {

	public id?: number;
    public nombre?: string;
    public detalles?: ProgramacionAcademicaComercialDetalleEditarProjection[];

}

export class ProgramacionAcademicaComercialCursoProjection {

	public id?: number;
	public nombre?: string;
	public paCiclo?: PACicloFechaProjection;
    public detalles?: ProgramacionAcademicaComercialDetalleCursoProjection[];

}

export class PAComercialComboFiltroProjection {
	public id?: number;
	public codigo?: string;
	public nombre?: string;
}