import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { Sucursal, SucursalComboProjection } from './sucursal';

export class PADescuentoUsuarioAutorizado {
	public id?: number;
    public descuentoId?: number;
    public usuario?: Usuario;
    public usuarioId?: number;
    public sucursal?: Sucursal;
    public sucursalId?: number;
    public activo?: boolean;
}

export class PADescuentoUsuarioAutorizadoEditarProjection{
	public id?: number;
    public descuentoId?: number;
    public usuario?: UsuarioComboProjection;
    public sucursal?: SucursalComboProjection;
    public activo?: boolean;
}