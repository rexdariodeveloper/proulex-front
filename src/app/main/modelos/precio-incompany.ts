import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { PrecioIncompanyDetalle, PrecioIncompanyDetalleEditarProjection } from './precio-incompany-detalles';
import { PrecioIncompanySucursal, PrecioIncompanySucursalEditarProjection } from './precio-incompany-sucursal';

export class PrecioIncompany {
	public id?: number;
    public codigo?: string;
    public nombre?: string;
    public fechaInicio?: Date;
    public fechaFin?: Date;
    public estatus?: ControlMaestroMultiple;
    public estatusId?: number;
    public indeterminado?: boolean;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaUltimaModificacion?: Date;
    public detalles?: PrecioIncompanyDetalle[];
    public sucursales?: PrecioIncompanySucursal[];
}

export class PrecioIncompanyEditarProjection{
	public id?: number;
    public codigo?: string;
    public nombre?: string;
    public fechaInicio?: Date;
    public fechaFin?: Date;
    public estatus?: ControlMaestroMultipleComboProjection;
    public indeterminado?: boolean;
    public fechaUltimaModificacion?: Date;
    public modificadoPor?: UsuarioComboProjection;
    public sucursales?: PrecioIncompanySucursalEditarProjection[];
}

export class PrecioIncompanyComboProjection{
    public id?: number;
    public nombre?: string;
}

export class PrecioIncompanyComboZonaProjection{
    public id?: number;
    public nombre?: string;
    public precioVenta?: number;
    public porcentajeTransporte?: number;
}

export class PrecioIncompanyComisionProjection{
	public id?: number;
    public nombre?: string;
    public detalles?: PrecioIncompanyDetalleEditarProjection[];
}