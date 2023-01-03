import { DatosFactura } from './datos-factura';
import { DatosFacturaConcepto } from './datos-factura-concepto';
import { DatosFacturaProveedor } from './datos-factura-proveedor';

export class JsonFacturaXML{

	public id: number;
    public datosFactura: DatosFactura;
    public proveedor: DatosFacturaProveedor;
    public conceptos: DatosFacturaConcepto[];

}