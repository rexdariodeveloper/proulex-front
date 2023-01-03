import { Usuario } from '@models/usuario';
import { ProgramaIdioma, ProgramaIdiomaEditarProjection } from './programa-idioma';
export class Programa {
	public id: number;
    public codigo: string;
    public nombre: string;
    public activo: boolean;
    public jobs?: boolean;
    public jobsSems?: boolean;
    public fechaCreacion: Date;
    public creadoPor: Usuario;
    public creadoPorId: number;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
    public idiomas: ProgramaIdioma[];
}

export class ProgramaEditarProjection{
	public id?: number;
    public codigo?: string;
    public activo?: boolean;
    public jobs?: boolean;
    public jobsSems?: boolean;
    public nombre?: string;
    public fechaModificacion?: Date;
 	public idiomas?: ProgramaIdiomaEditarProjection[];   
}

export class ProgramaComboProjection{
    public id?: number;
    public nombre?: string;
    public codigo?: string;
    public academy?: boolean;
}

export class ProgramaCalcularDiasProjection {

	public id?: number;
    public codigo?: string;
    public nombre?: string;
    public horasTotales?: number;
    public numeroNiveles?: number;

}

export class ProgramaCardProjection {

    public id?: number;
    public nombre?: string;
    public codigo?: string;
    public imagenId?: number;
    public jobsSems?: boolean;

}