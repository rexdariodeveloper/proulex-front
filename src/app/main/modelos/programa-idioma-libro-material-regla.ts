import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';

export class ProgramaIdiomaLibroMaterialRegla {
	public id?: number;
    public programaLibroMateriallId?: number;
    public carrera?: ControlMaestroMultiple;
    public carreraId?: number;
    public borrado?: boolean;
}

export class ProgramaIdiomaLibroMaterialReglaEditarProjection{
	public id?: number;
    public programaLibroMateriallId?: number;
    public carrera?: ControlMaestroMultipleComboProjection;
    public borrado?: boolean;
}