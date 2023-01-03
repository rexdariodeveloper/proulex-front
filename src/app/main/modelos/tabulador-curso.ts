import { Programa, ProgramaComboProjection } from './programa';
import { PAModalidad, PAModalidadComboProjection } from './pamodalidad';
import { PAModalidadHorario, PAModalidadHorarioComboProjection } from './pamodalidad-horario';
import { ProgramaIdioma, ProgramaIdiomaComboProjection } from './programa-idioma';

export class TabuladorCurso {
	public id?: number;
    public tabuladorId?: number;
    public programa?: Programa;
    public programaId?: number;
    public modalidad?: PAModalidad;
    public modalidadId?: number;
    public modalidadHorario?: PAModalidadHorario;
    public modalidadHorarioId?: number;
    public programaIdioma?: ProgramaIdioma;
    public programaIdiomaId?: number;
    public activo?: boolean;
}

export class TabuladorCursoEditarProjection{
	public id?: number;
    public tabuladorId?: number;
    public programa?: ProgramaComboProjection;
	public modalidad?: PAModalidadComboProjection;
	public modalidadHorario?: PAModalidadHorarioComboProjection;
	public programaIdioma?: ProgramaIdiomaComboProjection;
	public activo?: boolean;
}