import { Usuario } from '@models/usuario';
import { PAModalidadComboProjection, PAModalidad } from './pamodalidad';

export class ProgramaIdiomaModalidad {
    public id: number;
    public programaIdiomaId: number;
    public modalidadId: number;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
}

export class ProgramaIdiomaModalidadEditarProjection{
    public id?: number;
    public programaIdiomaId?: number;
    public modalidad?: PAModalidadComboProjection;
    public fechaModificacion?: Date;
}