import { Sucursal, SucursalComboProjection } from './sucursal';

export class PADescuentoSucursal {
	public id?: number;
    public descuentoId?: number;
    public sucursal?: Sucursal;
    public sucursalId?: number;
    public activo?: boolean;
}

export class PADescuentoSucursalEditarProjection{
	public id?: number;
    public descuentoId?: number;
    public sucursal?: SucursalComboProjection;
    public activo?: boolean;
}