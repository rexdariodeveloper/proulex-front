import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { CXPFactura, CXPFacturaAlertaCXPSPProjection, CXPFacturaPagoProveedoresProjection } from './cxpfactura';
import { ProveedorPagoProveedoresProjection } from './proveedor';

export class CXPSolicitudPagoDetalle {
    public id?: number;
    public cxpFactura?: CXPFactura;
    public cxpFacturaId: number;
    public estatus?: ControlMaestroMultipleComboProjection;
    public estatusId: number;
    public montoProgramado?: number;
}

export class CXPSolicitudPagoDetalleListadoProjection {

	public id: number;
    public proveedor: ProveedorPagoProveedoresProjection;
    public cxpFactura: CXPFacturaPagoProveedoresProjection;
    public estatus: ControlMaestroMultipleComboProjection;
	public montoProgramado?: number;
}

export class CXPSolicitudPagoDetalleAlertaProjection {
    public id?: number;
    public cxpFactura?: CXPFacturaAlertaCXPSPProjection;
    public estatusId?: number;
    public montoProgramado?: number;
}