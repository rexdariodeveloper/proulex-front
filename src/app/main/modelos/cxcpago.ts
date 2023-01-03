import { CXCFactura } from "./cxcfactura";
import { CXCPagoDetalle } from "./cxcpago-detalle";
import { FormaPagoComboProjection } from "./FormaPago";
import { MonedaComboProjection } from "./moneda";

export class CXCPago {

    public id?: number;
    public facturaId?: number;
    public factura?: CXCFactura;
    public version?: string;
    public fecha?: Date;
    public formaPagoId?: number;
    public formaPago?: FormaPagoComboProjection;
    public monedaId?: number;
    public moneda?: MonedaComboProjection;
    public tipoCambio?: number;
    public noOperacion?: string;
    public cuentaOrdenante?: string;
    public cuentaOrdenanteEmisorRFC?: string;
    public cuentaOrdenanteNombreBanco?: string;
    public cuentaBeneficiarioId?: number;
    public cuentaBeneficiario?: string;
    public cuentaBeneficiarioEmisorRFC?: string;

    public detalles?: CXCPagoDetalle[];
}