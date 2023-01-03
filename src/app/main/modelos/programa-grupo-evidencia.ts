import { ArchivoProjection } from "@models/archivo";

export class ProgramaGrupoEvidencia {
    public id?: number;
    public grupoId?: number;
    public archivoId?: number;
    public archivo?: ArchivoProjection;
    public nombre?: string;
    public vigente?: boolean;
}