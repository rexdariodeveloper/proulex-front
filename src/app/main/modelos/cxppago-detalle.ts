import { CXPFactura } from './cxpfactura';
import { CXPPago } from './cxppago';

export class CXPPagoDetalle {

	public id?: number;
    public cxpPago?: CXPPago;
    public cxpPagoId?: number;
    public cxpFactura?: CXPFactura;
    public cxpFacturaId?: number;
    public montoAplicado?: number;
    public comentario?: string;

}