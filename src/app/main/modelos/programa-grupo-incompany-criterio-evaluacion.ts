import { PAModalidad,PAModalidadComboProjection } from './pamodalidad';
import { PAActividadEvaluacion, PAActividadEvaluacionComboProjection } from './paactividad';
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';


export class ProgramaGrupoIncompanyCriterioEvaluacion {
	public id?: number;
    public grupoId?: number;
    public actividadEvaluacion?: PAActividadEvaluacion;
    public actividadEvaluacionId?: number;
    public modalidad?: PAModalidad;
    public modalidadId?: number;
    public testFormat?: ControlMaestroMultiple;
    public testFormatId?: number;
    public fechaAplica?: Date;
    public score?: number;
    public time?: number;
    public activo?: boolean;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
}

export class ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection {
	public id?: number;
    public grupoId?: number;
    public actividadEvaluacion?: PAActividadEvaluacionComboProjection;
    public modalidad?: PAModalidadComboProjection;
    public testFormat?: ControlMaestroMultipleComboProjection;
    public fechaAplica?: Date;
    public score?: number;
    public time?: number;
    public activo?: boolean;
    public dias?: number;
}