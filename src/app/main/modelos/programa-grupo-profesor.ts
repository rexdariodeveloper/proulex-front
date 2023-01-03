import { Empleado, EmpleadoComboProjection } from "./empleado";
import { ProgramaGrupo } from "./programa-grupo";

export class ProgramaGrupoProfesor {

    public id?: number;
    public grupo?: ProgramaGrupo;
    public grupoId?: number;
    public empleado?: Empleado;
    public empleadoId?: number;
    public fechaInicio?: any;
    public motivo?: string;
    public sueldo?: number;
    public fechaCreacion?: any;
    public activo?: boolean;

}

export class ProgramaGrupoProfesorListadoGrupoProjection {

    public id?: number;
    public grupoId?: number;
    public empleado?: EmpleadoComboProjection;
    public fechaInicio?: any;
    public motivo?: string;
    public sueldo?: number;
    public activo?: boolean;

}