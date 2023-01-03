import { ControlMaestroMultiple } from "@models/control-maestro-multiple";
import { Usuario } from "@models/usuario";
import { CXPFactura, CXPSolicitudFacturaEditarProjection } from "./cxpfactura";
import { CXPSolicitudPagoServicio } from "./cxpsolicitud-pago-servicio";

export class CXPSolicitudPagoServicioDetalle {

	public id?: number;
    public cxpSolicitudPagoServicio?: CXPSolicitudPagoServicio;
    public cxpSolicitudPagoServicioId?: number;
    public cxpFactura?: CXPFactura;
    public cxpFacturaId?: number;
    public estatus?: ControlMaestroMultiple;
    public estatusId?: number;
    public fechaModificacion?: Date;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;

}

export class CXPSolicitudPagoServicioDetalleEditarProjection{

	public id?: number;
    public cxpFactura?: CXPSolicitudFacturaEditarProjection;
    public cxpFacturaId?: number;
    public estatusId?: number;

}