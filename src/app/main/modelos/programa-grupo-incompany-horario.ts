import { Usuario } from '@models/usuario';

export class ProgramaGrupoIncompanyHorario {
	public id?: number;
    public grupoId?: number;
    public dia?: string;
    public horaInicio?: any;
    public horaFin?: any;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
}

export class ProgramaGrupoIncompanyHorarioEditarProjection{
	public id?: number;
    public grupoId?: number;
    public dia?: string;
    public horaInicio?: any;
    public horaFin?: any;
}