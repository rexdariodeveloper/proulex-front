import { ArchivoProjection } from "@models/archivo";
import { ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { Usuario } from "@models/usuario";

export class EmpleadoDocumentoEditarProjection{
	public id?: number;
    public empleadoId?: number;
    public tipoDocumento?: ControlMaestroMultipleComboProjection;
    public archivoId?: number;
    public archivo?: ArchivoProjection;
    public fechaVencimiento?: Date;
    public fechaVigencia?: Date;
    public activo?: boolean;
    public tipoProcesoRHId?: number;
}