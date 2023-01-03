import { PAModalidadComboProjection } from './pamodalidad';
import { ProgramaIdiomaExamen, ProgramaIdiomaExamenEditarProjection } from './programa-idioma-examen';

export class ProgramaIdiomaNivel {
	public id?: number;
    public programaIdiomaId?: number;
    public nivelInicial?: number;
    public nivelFinal?: number;
    public activo?: boolean;
    public examenes?: ProgramaIdiomaExamen[];
}

export class ProgramaIdiomaNivelEditarProjection{
	public id?: number;
    public modalidadId?: number;
    public modalidad?: PAModalidadComboProjection;
    public programaIdiomaId?: number;
    public nivelInicial?: number;
    public nivelFinal?: number;
    public activo?: boolean;
    public examenes?: ProgramaIdiomaExamenEditarProjection[];
}