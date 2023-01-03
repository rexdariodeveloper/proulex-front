import { ControlMaestroMultiple } from "@models/control-maestro-multiple";
import { SATRegimenFiscal } from "@models/sat-regimen-fiscal";
import { Estado } from "./estado";
import { Municipio } from "./municipio";
import { Pais } from "./pais";

export class DatosFacturacion {

    public id?: number;
    public tipoPersonaId?: number;
    public tipoPersona?: ControlMaestroMultiple;
    public rfc?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public razonSocial?: string;
    public registroIdentidadFiscal?: string;
    public regimenFiscalId?: number;
    public regimenFiscal?: SATRegimenFiscal;
    public calle?: string;
    public numeroExterior?: string;
    public numeroInterior?: string;
    public colonia?: string;
    public cp?: string;
    public paisId?: number;
    public pais?: Pais;
    public estadoId?: number;
    public estado?: Estado;
    public municipioId?: number;
    public municipio?: Municipio;
    public ciudad?: string;
    public correoElectronico?: string;
    public telefonoFijo?: string;
    public telefonoMovil?: string;
    public telefonoTrabajo?: string;
    public telefonoTrabajoExtension?: string;
    public telefonoMensajeriaInstantanea?: string;

    public alumno?: boolean;
    public cliente?: boolean;
    public valor?: string;
}

export class DatosFacturacionRfcComboProjection{
	public id?: number;
	public rfc?: string;
}