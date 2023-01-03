import { Usuario } from '@models/usuario';

export class EmpresaDiaNoLaboralFijo {
	public id: number;
    public dia: number;
    public mes: number;
    public descripcion: string;
    public activo: boolean;
    public fechaCreacion: Date;
    public creadoPor: Usuario;
    public creadoPorId: number;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
}

export class EmpresaDiaNoLaboralFijoEditarProjection{
	public id?: number;
	public dia?: number;
    public mes?: number;
	public descripcion?: string;
    public activo?: boolean;
	public fechaModificacion?: Date;
}