import { Usuario } from '@models/usuario';
import { ProgramaIdiomaExamenDetalle, ProgramaIdiomaExamenDetalleEditarProjection } from './programa-idioma-examen-detalle';

export class ProgramaIdiomaExamen {
	public id?: number;
    public programaIdiomaNivelId?: number;
    public nombre?: string;
    public porcentaje?: number;
    public activo?: boolean;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
    public orden?: number;
    public detalles?: ProgramaIdiomaExamenDetalle[];
}

export class ProgramaIdiomaExamenEditarProjection{
	public id?: number;
    public programaIdiomaNivelId?: number;
    public nombre?: string;
    public porcentaje?: number;
    public activo?: boolean;
    public orden?: number;
    public detalles?: ProgramaIdiomaExamenDetalleEditarProjection[];
}