import { Usuario } from '@models/usuario';

export class EmpresaDiaNoLaboral {
	public id: number;
    public fecha: Date;
    public descripcion: string;
    public activo: boolean;
    public fechaCreacion: Date;
    public creadoPor: Usuario;
    public creadoPorId: number;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
}

export class EmpresaDiaNoLaboralEditarProjection{
	public id?: number;
	public fecha?: Date;
	public descripcion?: string;
    public activo?: boolean;
	public fechaModificacion?: Date;
}