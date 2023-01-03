import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Programa, ProgramaComboProjection } from './programa';

export class EmpleadoCurso {
	public id?: number;
    public empleadoId?: number;
    public idioma?: ControlMaestroMultiple;
    public idiomaId?: number;
    public programa?: Programa;
    public programaId?: number;
    public comentarios?: string;
    public activo?: boolean;	
}

export class EmpleadoCursoEditarProjection{
	public id?: number;
    public empleadoId?: number;
    public idioma?: ControlMaestroMultipleComboProjection;
    public programa?: ProgramaComboProjection;
    public comentarios?: string;
    public activo?: boolean;
}