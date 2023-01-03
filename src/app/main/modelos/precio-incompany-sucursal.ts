import { Sucursal, SucursalComboProjection } from './sucursal';

export class PrecioIncompanySucursal {
	public id?: number;
    public precioIncompanyId?: number;
    public sucursal?: Sucursal;
    public sucursalId?: number;
}

export class PrecioIncompanySucursalEditarProjection {
	public id?: number;
    public precioIncompanyId?: number;
    public sucursal?: SucursalComboProjection;
}