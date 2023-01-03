import { Localidad } from "./localidad";
import { PedidoReciboDetalle } from "./recibo-pedido-detalle";

export class PedidoReciboDetalleLocalidad {
	public id?: number;
    public pedidoReciboDetalle?: PedidoReciboDetalle;
    public pedidoReciboDetalleId?: number;
    public localidad?: Localidad;
    public localidadId?: number;
    public cantidad?: number;
}

export class PedidoReciboDetalleLocalidadProjection {
	public id?: number;
    public localidadId?: number;
    public cantidad?: number;
}