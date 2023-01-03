import { Archivo, ArchivoProjection } from '@models/archivo';

export class EmpleadoDeduccionPercepcionDocumento {
	public id?: number;
    public empleadoDeduccionpercepcionId?: number;
    public archivo?: Archivo;
    public archivoId?: number;
    public activo?: boolean;
}

export class EmpleadoDeduccionPercepcionDocumentoEditarProjection{
	public id?: number;
    public empleadoDeduccionpercepcionId?: number;
    public archivo?: ArchivoProjection;
    public activo?: boolean;
}