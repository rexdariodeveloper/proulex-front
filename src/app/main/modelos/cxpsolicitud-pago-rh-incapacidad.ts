import { CXPSolicitudPagoRHIncapacidadDetalle,CXPSolicitudPagoRHIncapacidadDetalleEditarProjection } from './cxpsolicitud-pago-rh-incapacidad-detalle';

export class CXPSolicitudPagoRHIncapacidad {
	public id?: number;
    public cpxSolicitudPagoRhId?: number;
    public folioIncapacidad?: string;
    public fechaInicio?: Date;
    public fechaFin?: Date;
    public detalles?: CXPSolicitudPagoRHIncapacidadDetalle[];
}

export class CXPSolicitudPagoRHIncapacidadEditarProjection{
	public id?: number;
	public cpxSolicitudPagoRhId?: number;
	public folioIncapacidad?: string;
	public fechaInicio?: Date;
    public fechaFin?: Date;
    public detalles?: CXPSolicitudPagoRHIncapacidadDetalleEditarProjection[];
}