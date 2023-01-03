import { ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { Usuario } from "@models/usuario";

export class DocumentosConfiguracionRH {
	public id: number;
    public tipoProcesoRHId: number;
    public tipoProcesoRH?: ControlMaestroMultipleComboProjection;
    public tipoDocumentoId: number;
    public tipoDocumento?: ControlMaestroMultipleComboProjection;
    public tipoContratoId?: number;
    public tipoContrato?: ControlMaestroMultipleComboProjection;
    public tipoOpcionId?: number;
    public tipoOpcion?: ControlMaestroMultipleComboProjection;
    public tipoVigenciaId?: number;
    public tipoVigencia?: ControlMaestroMultipleComboProjection;
    public tipoTiempoId?: number;
    public tipoTiempo?: ControlMaestroMultipleComboProjection;
    public vigenciaCantidad?: number;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public creadoPor?: Usuario;
	public fechaUltimaModificacion?: Date;
	public modificadoPorId?: number;
    public modificadoPor?: Usuario;

    constructor(documentosConfiguracionRH?){
        documentosConfiguracionRH = documentosConfiguracionRH || {};
        this.id = documentosConfiguracionRH.id || null;
        this.tipoProcesoRHId = documentosConfiguracionRH.tipoProcesoRHId || null;
        this.tipoProcesoRH = documentosConfiguracionRH.tipoProcesoRH || ControlMaestroMultipleComboProjection;
        this.tipoDocumentoId = documentosConfiguracionRH.tipoDocumentoId || null;
        this.tipoDocumento = documentosConfiguracionRH.tipoDocumento || ControlMaestroMultipleComboProjection;
        this.tipoContratoId = documentosConfiguracionRH.tipoContratoId || null;
        this.tipoContrato = documentosConfiguracionRH.tipoContrato || ControlMaestroMultipleComboProjection;
        this.tipoOpcionId = documentosConfiguracionRH.tipoOpcionId || null;
        this.tipoOpcion = documentosConfiguracionRH.tipoOpcion || ControlMaestroMultipleComboProjection;
        this.tipoVigenciaId = documentosConfiguracionRH.tipoVigenciaId || null;
        this.tipoVigencia = documentosConfiguracionRH.tipoVigencia || ControlMaestroMultipleComboProjection;
        this.tipoTiempoId = documentosConfiguracionRH.tipoTiempoId || null;
        this.tipoTiempo = documentosConfiguracionRH.tipoTiempo || ControlMaestroMultipleComboProjection;
        this.vigenciaCantidad = documentosConfiguracionRH.vigenciaCantidad || null;
        this.fechaCreacion = documentosConfiguracionRH.fechaCreacion || '';
        this.creadoPorId = documentosConfiguracionRH.creadoPorId || null;
        this.creadoPor = documentosConfiguracionRH.creadoPor || Usuario;
        this.fechaUltimaModificacion = documentosConfiguracionRH.fechaUltimaModificacion || '';
        this.modificadoPorId = documentosConfiguracionRH.modificadoPorId || null;
        this.modificadoPor = documentosConfiguracionRH.modificadoPor || Usuario;
    }
}

export class DocumentosConfiguracionRHEditarProjection{
    public id: number;
    public tipoProcesoRHId: number;
    public tipoProcesoRH?: ControlMaestroMultipleComboProjection;
    public tipoDocumentoId: number;
    public tipoDocumento?: ControlMaestroMultipleComboProjection;
    public tipoContratoId?: number;
    public tipoContrato?: ControlMaestroMultipleComboProjection;
    public tipoOpcionId?: number;
    public tipoOpcion?: ControlMaestroMultipleComboProjection;
    public tipoVigenciaId?: number;
    public tipoVigencia?: ControlMaestroMultipleComboProjection;
    public tipoTiempoId?: number;
    public tipoTiempo?: ControlMaestroMultipleComboProjection;
    public vigenciaCantidad?: number;
}