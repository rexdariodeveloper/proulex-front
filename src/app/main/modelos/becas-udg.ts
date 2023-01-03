import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { PAModalidad, PAModalidadComboProjection } from "./pamodalidad";
import { ProgramaIdioma, ProgramaIdiomaComboProjection } from "./programa-idioma";

export class BecaUDG {

    public id?: number;
    public codigoBeca?: string;
    public codigoEmpleado?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public parentesco?: string;
    public descuento?: number;
    public programaIdioma?: ProgramaIdioma;
    public programaIdiomaId?: number;
    public nivel?: number;
    public paModalidad?: PAModalidad;
    public paModalidadId?: number;
    public firmaDigital?: string;
    public fechaAlta?: number;
    public estatus?: ControlMaestroMultiple;
    public estatusId?: number;
    public tipo?: ControlMaestroMultiple;
    public tipoId?: number;
    public entidad?: ControlMaestroMultiple;
    public entidadId?: number;
    public codigoAlumno?: string;
    public solicitudId?: number;
    public comentarios?: string;
    public fechaExpiracion?: Date;
    public siapId?: number;
    public entidadBeca?: any;
    public entidadBecaId?: number;
}

export class BecaUDGListadoProjection {

    public id?: number;
    public codigoProulex?: string;
    public codigoBeca?: string;
    public codigoEmpleado?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public descuento?: number;
    public curso?: string;
    public nivel?: number;
    public modalidad?: string;
    public alumnoId?: number;
    public entidadBeca?: string;

}

export class BecaUDGEditarProjection {

    public id?: number;
    public codigoBeca?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public descuento?: number;
    public programaIdioma?: ProgramaIdiomaComboProjection;
    public nivel?: number;
    public paModalidad?: PAModalidadComboProjection;
    public fechaAlta?: Date;
    public estatus?: ControlMaestroMultipleComboProjection;
    public tipo?: ControlMaestroMultipleComboProjection;
    public entidad?: ControlMaestroMultipleComboProjection;
    public codigoAlumno?: string;
    public solicitudId?: number;
    public comentarios?: string;
    public fechaExpiracion?: Date;
    public entidadBeca?: any;
}