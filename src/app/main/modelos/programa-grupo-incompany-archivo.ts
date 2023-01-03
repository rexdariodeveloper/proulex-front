import { ArchivoProjection, Archivo } from "@models/archivo";

export class ProgramaGrupoIncompanyArchivo {
	public id?: number;
	public programaIncompanyId?: number;
	public archivo?: Archivo;
	public archivoId?: number;
}

export class ProgramaGrupoIncompanyArchivoEditarProjection{
	public id?: number;
	public programaIncompanyId?: number;
	public archivo?: ArchivoProjection;
}