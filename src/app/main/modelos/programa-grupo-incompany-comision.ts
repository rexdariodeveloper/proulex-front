import { Usuario } from "@models/usuario";

export class ProgramaGrupoIncompanyComisionEditarProjection {
    public id?: number;
    public grupoId?: number;
    public usuarioId?: number;
	public usuario?: Usuario;
    public porcentaje?: number;
    public montoComision?: number;
    public activo?: boolean;
}