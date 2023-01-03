import { Usuario } from '@models/usuario';

export class PAActividadEvaluacion {
	public id: number;
    public codigo: string;
    public actividad: string;
    public activo: boolean;
    public creadoPor: Usuario;
    public creadoPorId: number;
    public fechaCreacion: Date;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
}

export class PAActividadEvaluacionComboProjection{
	public id?: number;
    public codigo?: string;
    public actividad?: string;
}