import { Archivo, ArchivoProjection } from "@models/archivo";
import { ControlMaestroMultiple, ControlMaestroMultipleComboSimpleProjection } from "@models/control-maestro-multiple";
import { OrdenVentaCancelacion } from "./orden-venta-cancelacion";

export class OrdenVentaCancelacionArchivo {

    public id?: number;
    public ordenVentaCancelacion?: OrdenVentaCancelacion;
    public ordenVentaCancelacionId?: number;
    public archivo?: Archivo;
    public archivoId?: number;
    public tipoDocumento?: ControlMaestroMultiple;
    public tipoDocumentoId?: number;
    public valor?: string;

}

export class OrdenVentaCancelacionArchivoEditarProjection {

    public id?: number;
    public archivo?: ArchivoProjection;
    public tipoDocumento?: ControlMaestroMultipleComboSimpleProjection;
    public valor?: string;

}