import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { CXPFactura } from './cxpfactura';
import { OrdenCompraRelacionarProjection } from './orden-compra';
import { OrdenCompraDetalleRelacionarProjection } from './orden-compra-detalle';
import { OrdenCompraRecibo } from './orden-compra-recibo';

export class CXPFacturaDetalle{

	public id?: number;
    public cxpFactura?: CXPFactura;
    public cxpFacturaId?: number;
    public recibo?: OrdenCompraRecibo;
    public reciboId?: number;
    public numeroLinea?: number;
    public descripcion?: string;
    public cantidad?: number;
    public precioUnitario?: number;
    public iva?: number;
    public ivaExento?: boolean;
    public ieps?: number;
    public iepsCuotaFija?: number;
    public tipoRegistro?: ControlMaestroMultiple;
    public tipoRegistroId?: number;
    public descuento?: number;
    public tipoRetencion?: ControlMaestroMultiple;
    public tipoRetencionId?: number;
	
	public ordenCompraDetalleId?: number;
    public cantidadRelacionar?: number;
    
    public articuloId?: number;
    public unidadMedidaId?: number;

}

export class CXPFacturaDetalleEditarProjection{

	public id: number;
    public descripcion: string;
    public tipoRetencion: ControlMaestroMultipleComboProjection;
	
	public cantidad?: number;
	public precioUnitario: number;
    public descuento?: number;
    public iva?: number;
    public ivaExento?: boolean;
    public ieps?: number;
	public iepsCuotaFija?: number;
	
	public ordenCompraDetalleId?: number;

}

export class CXPSolicitudFacturaDetalleEditarProjection{

	public id?: number;
    public numeroLinea?: number;
    public descripcion?: string;
    public cantidad?: number;
    public precioUnitario?: number;
    public iva?: number;
    public ivaExento?: boolean;
    public ieps?: number;
    public iepsCuotaFija?: number;
    public tipoRegistro?: ControlMaestroMultipleComboProjection;
    public tipoRegistroId?: number;
    public descuento?: number;
    public tipoRetencion?: ControlMaestroMultipleComboProjection;
    public tipoRetencionId?: number;
    public cantidadRelacionar?: number;
    public ordenCompraDetalleId?: number;
    public articuloId?: number;
    public unidadMedidaId?: number;

}