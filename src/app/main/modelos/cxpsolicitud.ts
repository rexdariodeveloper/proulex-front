import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { CXPSolicitudPagoDetalle, CXPSolicitudPagoDetalleAlertaProjection, CXPSolicitudPagoDetalleListadoProjection } from './cxpsolicitud-detalle';
import { ProveedorPagoProveedoresProjection } from './proveedor'

export class CXPSolicitudPago {
	public id?: number;
	public codigoSolicitud: string;
	public estatus?: ControlMaestroMultipleComboProjection;
	public estatusId: number;
	public sucursal?: any;
	public sucursalId: number; 
	public detalles: CXPSolicitudPagoDetalle[];

	public fechaCreacion?: string;
	public creadoPor?: Usuario;
	public creadoPorId?: number;
	public fechaModificacion?: string;
	public modificadoPor?: Usuario;
	public modificadoPorId?: number;
}

export class CXPSolicitudPagoListadoProjection {

	public id: number;
    public codigoSolicitud: string;
    public fechaCreacion: Date;
	public proveedores: ProveedorPagoProveedoresProjection[];
	public montoProgramado: number;
	public creadoPor: UsuarioComboProjection;
	public totalFacturas: number;
	public facturaPDFId?: number;
	public facturaXMLId?: number;
	public detalles: CXPSolicitudPagoDetalleListadoProjection[];

}

export class CXPSolicitudPagoAlertaProjection {
	public id?: number;
	public codigoSolicitud: string;
	public detalles: CXPSolicitudPagoDetalleAlertaProjection[];

	public creadoPor?: UsuarioComboProjection;

	public fechaCreacion?: string;
	public fechaModificacion?: string;
}