import { ArchivoProjection } from "@models/archivo";
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { Usuario, UsuarioComboProjection } from "@models/usuario";
import { CXPSolicitudPagoServicioDetalle, CXPSolicitudPagoServicioDetalleEditarProjection } from "./cxpsolicitud-pago-servicio-detalle";
import { Sucursal, SucursalComboProjection } from "./sucursal";

export class CXPSolicitudPagoServicio {

	public id?: number;
    public codigoSolicitudPagoServicio?: string;
    public estatus?: ControlMaestroMultiple;
    public estatusId?: number;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public sucursal?: Sucursal;
    public sucursalId?: number;
    public comentarios?: string;
    public fechaModificacion?: Date;
    public detalles?: CXPSolicitudPagoServicioDetalle[];
	
}

export class CXPSolicitudPagoServicioConfirmarInfoProjection{

	public id?: number;
    public fechaModificacion?: Date;

}

export class CXPSolicitudPagoServicioEditarProjection {

	public id?: number;
    public codigoSolicitudPagoServicio?: string;
    public estatus?: ControlMaestroMultipleComboProjection;
    public estatusId?: number;
    public fechaCreacion?: Date;
    public creadoPor?: UsuarioComboProjection;
    public creadoPorId?: number;
    public modificadoPor?: UsuarioComboProjection;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
    public sucursal?: SucursalComboProjection;
    public sucursalId?: number;
    public detalles?: CXPSolicitudPagoServicioDetalleEditarProjection[];
    public facturaPDF?: ArchivoProjection;
    public facturaXML?: ArchivoProjection;
    public comentarios?: string;

}