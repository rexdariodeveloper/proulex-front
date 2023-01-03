import { DatosFacturaIVA } from './datos-factura-iva';

export class DatosFacturaConcepto{

	public iva: DatosFacturaIVA;
    public concepto: string;
    public um: string;
    public umClave: string;
    public cantidad: number;
    public precioUnitario: number;
    public descuento: number;
    public importe: number;

}