import { Usuario } from '@models/usuario';
export class SucursalFormasPago{
    public id: number;
    public sucursalId: number;
    public formaPagoId: number;
    public usarEnPV: boolean;
    public activo: boolean;
    public fechaCreacion?: Date;
	public creadoPor?: Usuario;
	public creadoPorId?: number;
	public fechaModificacion?: Date;
	public modificadoPor?: Usuario;
    public modificadoPorId?: number;
}


export class SucursalFormasPagoEditar{
    public id: number;
    public sucursalId: number;
    public formaPagoId: number;
    public usarEnPV: boolean;
    public activo: boolean;
}

export class SucursalFormasPagoCombo{
    public id: number;
    public sucursalId: number;
    public formaPagoId: number;
    public usarEnPV: boolean;
}