import { ControlMaestroMultipleComboSimpleProjection } from "@models/control-maestro-multiple";
import { AlumnoComboProjection } from "./alumno";
import { ArticuloComboSimpleProjection } from "./articulo";
import { OrdenVentaDetalleReferenciaOVProjection } from "./orden-venta-detalle";
import { ProgramaIdiomaComboProjection } from "./programa-idioma";

export class AlumnoExamenCertificacion {
	public id?: number;
    public alumno?: AlumnoComboProjection;
    public alumnoId?: number;
    public articulo?: ArticuloComboSimpleProjection;
    public articuloId?: number;
    public ordenVentaDetalle?: OrdenVentaDetalleReferenciaOVProjection;
    public ordenVentaDetalleId?: number;
    public tipo?: ControlMaestroMultipleComboSimpleProjection;
    public tipoId?: number;
    public curso?: ProgramaIdiomaComboProjection;
    public cursoId?: number;
    public estatus?: ControlMaestroMultipleComboSimpleProjection;
    public estatusId?: number;
    public calificacion?: number;
    public nivel?: number;
    public fechaCreacion?: Date;
    public fechaModificacion?: Date;
}