import { Usuario } from "@models/usuario";
import { ProgramaMetaDetalle, ProgramaMetaDetalleEditarProjection } from "./programa-meta-detalle";
import { ProgramacionAcademicaComercial, ProgramacionAcademicaComercialComboProjection } from "./programacion-academica-comercial";

export class ProgramaMeta {
    public id?: number;
    public activo?: boolean;
    public codigo?: string;
    public programacionAcademicaComercial?: ProgramacionAcademicaComercial;
    public programacionAcademicaComercialId?: number;
    public fechaCreacion?: any;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: any;
    public detalles?: ProgramaMetaDetalle[];
}

export class ProgramaMetaListadoProjection {
    public id?: number;
    public codigo?: string;
    public nombre?: string;
    public ciclo?: string;
    public meta?: number;
    public inscripciones?: number;
}

export class ProgramaMetaEditarProjection {
    public id?: number;
    public codigo?: string;
    public programacionAcademicaComercial?: ProgramacionAcademicaComercialComboProjection;
    public detalles?: ProgramaMetaDetalleEditarProjection[];
    public fechaModificacion?: any;
}