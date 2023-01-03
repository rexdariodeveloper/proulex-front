import { Usuario } from '@models/usuario';

export class PAModalidadHorario {
	public id: number;
    public modalidadId: number;
    public nombre: string;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
}

export class PAModalidadHorarioComboProjection{
	public id?: number;	
	public modalidadId?: number;
    public nombre?: string;
    public codigo?: string;
    public horaFin?: any;
}

export class PAModalidadHorarioComboSimpleProjection{
	public id?: number;
    public nombre?: string;
    public horaInicio?: any;
    public horaFin?: any;
}