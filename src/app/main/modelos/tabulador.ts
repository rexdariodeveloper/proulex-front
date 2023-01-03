import { TabuladorDetalle, TabuladorDetalleEditarProjection, TabuladorDetalleComboProjection } from './tabulador-detalle';
import { TabuladorCurso, TabuladorCursoEditarProjection } from './tabulador-curso';
import { Usuario } from '@models/usuario';

export class Tabulador { 
	public id?: number;
    public codigo?: string;
    public descripcion?: string;
    public pagoDiasFestivos?: boolean;
    public activo?: boolean;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaCreacion?: Date;
    public fechaModificacion?: Date;
    public detalles?: TabuladorDetalle[];
    public cursos?: TabuladorCurso[];
}

export class TabuladorEditarProjection{
	public id?: number;
    public codigo?: string;
    public descripcion?: string;
    public pagoDiasFestivos?: boolean;
    public activo?: boolean;
    public detalles?: TabuladorDetalleEditarProjection[];
    public cursos?: TabuladorCursoEditarProjection[];
}

export class TabuladorComboProjection{
    public id?: number;
    public codigo?: string;
    public detalles?: TabuladorDetalleComboProjection[];
}