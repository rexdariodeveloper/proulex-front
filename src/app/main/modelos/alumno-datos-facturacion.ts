import { Alumno } from "./alumno";
import { DatosFacturacion } from "./datos-facturacion";

export class AlumnoDatosFacturacion {

    public id?: number;
    public alumnoId?: number;
    public alumno?: Alumno;
    public datosFacturacionId?: number;
    public datosFacturacion?: DatosFacturacion;
    public predeterminado?: boolean;

    public idTmp: number;
}