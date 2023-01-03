import { PAModalidad, PAModalidadComboProjection } from './pamodalidad';
import { Usuario } from '@models/usuario';

export class ProgramaIdiomaExamenModalidad{
	public id?: number;
    public examenDetalleId?: number;
    public modalidad?: PAModalidad ;
    public modalidadlId?: number;
    public dias?: string;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
}

export class ProgramaIdiomaExamenModalidadEditarProjection{
	public id?: number;
    public examenDetalleId?: number;
    public modalidad?: PAModalidadComboProjection;
    public dias?: string;
}