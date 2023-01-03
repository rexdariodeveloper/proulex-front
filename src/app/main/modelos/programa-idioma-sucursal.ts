import { Usuario } from '@models/usuario';
import { Sucursal ,SucursalComboProjection } from './sucursal';

export class ProgramaIdiomaSucursal {
	public id: number;
    public programaIdiomaId: number;
    public sucursalId: number;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
}

export class ProgramaIdiomaSucursalEditarProjection{
	public id?: number;
	public programaIdiomaId?: number;
	public sucursal?: SucursalComboProjection;
}