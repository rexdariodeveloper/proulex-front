import { Usuario } from '@models/usuario';

export class PAProfesorCategoria { 
	public id?: number;
    public categoria?: string;
    public salarioDiario?: number;
    public activo?: boolean;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public fechaCreacion?: Date;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
}

export class PAProfesorComboProjection{
	public id?: number;
    public categoria?: string;
}