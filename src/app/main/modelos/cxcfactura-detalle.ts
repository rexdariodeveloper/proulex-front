import { ControlMaestroMultiple } from "@models/control-maestro-multiple";
import { ClienteRemisionDetalle } from "./cliente-remision-detalle";
import { CXCFactura } from "./cxcfactura";
import { CXCFacturaDetalleImpuesto } from "./cxcfactura-detalle-impuesto";

export class CXCFacturaDetalle {

    public id?: number;
    public facturaId?: number;
    public claveProdServ?: string;
    public noIdentificacion?: string;
    public descripcion?: string;
    public unidadMedidaId?: number;
    public cantidad?: number;
    public valorUnitario?: number;
    public importe?: number;
    public descuento?: number;
    public objetoImpuestoId?: number;
    public referenciaId?: number;

    public impuestos?: CXCFacturaDetalleImpuesto[];

    public cxcFactura?: CXCFactura;
    public cxcFacturaId?: number;
    public clienteRemisionDetalle?: ClienteRemisionDetalle;
    public clienteRemisionDetalleId?: number;
    public numeroLinea?: number;
    public precioUnitario?: number;
    public iva?: number;
    public ivaExento?: boolean;
    public ieps?: number;
    public iepsCuotaFija?: number;
    public tipoRegistro?: ControlMaestroMultiple;
    public tipoRegistroId?: number;
    public tipoRetencion?: ControlMaestroMultiple;
    public tipoRetencionId?: number;
    public articuloId?: number;
}