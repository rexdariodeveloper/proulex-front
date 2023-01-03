import { Sucursal, SucursalComboProjection } from './sucursal';
import { Cliente, ClienteComboProjection } from './cliente';
import { Usuario } from '@models/usuario';
import { ProgramaGrupoIncompanyArchivo, ProgramaGrupoIncompanyArchivoEditarProjection } from './programa-grupo-incompany-archivo';
//import { ProgramaGrupoIncompanyGrupo, ProgramaGrupoIncompanyGrupoEditarProjection } from './programa-grupo-incompany-grupo';
import { ProgramaGrupo, ProgramaGrupoEditarProjection } from './programa-grupo';

export class ProgramaGrupoIncompany {
	public id?: number;
    public codigo?: string;
    public sucursal?: Sucursal;
    public sucursalId?: number;
    public cliente?: Cliente;
    public clienteId?: number;
    public activo?: boolean;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
    public grupos?: ProgramaGrupo[];	
    public archivos?: ProgramaGrupoIncompanyArchivo[];
}

export class ProgramaGrupoIncompanyEditarProjection{
	public id?: number;
    public codigo?: string;
    public sucursal?: SucursalComboProjection;
    public cliente?: ClienteComboProjection;
    public activo?: boolean;
    public fechaModificacion?: Date;
    public grupos?: ProgramaGrupoEditarProjection[];	
    public archivos?: ProgramaGrupoIncompanyArchivoEditarProjection[];
}

