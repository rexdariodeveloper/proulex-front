import { CXCFactura } from "./cxcfactura";

export class CXCPagoDetalle {

    public id?: number;
    public pagoId?: number;
    public doctoRelacionadoId?: number;
    public doctoRelacionado?: CXCFactura;
    public noParcialidad?: number;
    public importeSaldoAnterior?: number;
    public importePagado?: number;
    public importeSaldoInsoluto?: number;
    public objetoImpuestoId?: number;
}