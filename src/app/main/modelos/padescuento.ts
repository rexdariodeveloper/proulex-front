import { PADescuentoDetalle,PADescuentoDetalleEditarProjection } from './padescuento-detalle';
import { PADescuentoArticulo, PADescuentoArticuloEditarProjection } from './padescuento-articulo';
import { PADescuentoSucursal, PADescuentoSucursalEditarProjection } from './padescuento-sucursal';
import { PADescuentoUsuarioAutorizado, PADescuentoUsuarioAutorizadoEditarProjection } from './padescuento-usuario-autorizado';
import { Usuario } from '@models/usuario';
import { ControlMaestroMultipleComboProjection, ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { Cliente, ClienteComboProjection } from './cliente';

export class PADescuento {
	public id?: number;
    public codigo?: string;
    public concepto?: string;
    public porcentajeDescuento?: number;
    public fechaInicio?: Date;
    public fechaFin?: Date;
    public descuentoRelacionadoCliente?: boolean;
    public activo?: boolean;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
    public detalles?: PADescuentoDetalle[];
    public articulos?: PADescuentoArticulo[];
    public sucursales?: PADescuentoSucursal[];
    public usuariosAutorizados?: PADescuentoUsuarioAutorizado[];
    public clienteId?: number;
    public cliente?: Cliente;
    public tipo?: ControlMaestroMultiple;
    public tipoId?: number;
    public prioridadEvaluacion?: number;
}

export class PADescuentoEditarProjection{
	public id?: number;
    public codigo?: string;
    public concepto?: string;
    public porcentajeDescuento?: number;
    public fechaInicio?: Date;
    public fechaFin?: Date;
    public descuentoRelacionadoCliente?: boolean;
    public activo?: boolean;
    public fechaModificacion?: Date;
    public detalles?: PADescuentoDetalleEditarProjection[];
    public articulos?: PADescuentoArticuloEditarProjection[];
    public sucursales?: PADescuentoSucursalEditarProjection[];
    public usuariosAutorizados?: PADescuentoUsuarioAutorizadoEditarProjection[];
    public cliente?: ClienteComboProjection;
    public tipo?: ControlMaestroMultipleComboProjection;
    public prioridadEvaluacion?: number;
}