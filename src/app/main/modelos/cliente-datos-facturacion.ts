import { Cliente } from "./cliente";
import { DatosFacturacion } from "./datos-facturacion";

export class ClienteDatosFacturacion {

    public id?: number;
    public clienteId?: number;
    public cliente?: Cliente;
    public datosFacturacionId?: number;
    public datosFacturacion?: DatosFacturacion;
    public predeterminado?: boolean;

    public idTmp: number;
}