import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PAActividadEvaluacion, PAActividadEvaluacionComboProjection } from './paactividad';
import { ProgramaIdiomaExamenModalidad, ProgramaIdiomaExamenModalidadEditarProjection } from './programa-idioma-examen-modalidad';
import { ProgramaIdiomaExamenUnidad, ProgramaIdiomaExamenUnidadEditarProjection } from './programa-idioma-examen-unidad';

export class ProgramaIdiomaExamenDetalle {
	public id?: number;
    public programaIdiomaExamenId?: number;
    public actividadEvaluacion?: PAActividadEvaluacion;
    public actividadEvaluacionId?: number;
    public test?: ControlMaestroMultiple;
    public testId?: number;
    public time?: number;
    public puntaje?: number;
    public continuos?: boolean;
    public activo?: boolean;
    public modalidades?: ProgramaIdiomaExamenModalidad[];
    public unidades?: ProgramaIdiomaExamenUnidad[];
}

export class ProgramaIdiomaExamenDetalleEditarProjection{
	public id?: number;
    public programaIdiomaExamenId?: number;
    public actividadEvaluacion?: PAActividadEvaluacionComboProjection;
    public test?: ControlMaestroMultipleComboProjection;
    public time?: number;
    public puntaje?: number;
    public continuos?: boolean;
    public activo?: boolean;
    public modalidades?: ProgramaIdiomaExamenModalidadEditarProjection[];
    public unidades?: ProgramaIdiomaExamenUnidadEditarProjection[];
}