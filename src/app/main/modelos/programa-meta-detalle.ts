import { PAModalidad } from "./pamodalidad";
import { Programa, ProgramaComboProjection } from "./programa";
import { ProgramaMeta } from "./programa-meta";
import { ProgramacionAcademicaComercialDetalle } from "./programacion-academica-comercial-detalle";
import { Sucursal, SucursalComboProjection } from "./sucursal";

export class ProgramaMetaDetalle {
    public id?: number;
    public programaMeta?: ProgramaMeta;
    public programaMetaId?: number;
    public sucursal?: Sucursal;
    public sucursalId?: number;
    public paModalidad?: PAModalidad;
    public paModalidadId?: number;
    public fechaInicio?: any;
    public meta?: number;
}

export class ProgramaMetaDetalleProjection {
    public id?: number;
    public sucursal?: SucursalComboProjection;
}

export class ProgramaMetaDetalleEditarProjection {
    public id?: number;
    public sucursalId?: number;
    public paModalidadId?: number;
    public fechaInicio?: any;
    public meta?: number;
}