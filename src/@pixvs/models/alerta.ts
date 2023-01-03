import { ControlMaestroMultiple } from './control-maestro-multiple';
import { AlertaDetalle } from './alerta-detalle';
import { Timestamp } from 'rxjs';
import { Usuario } from './usuario';
import { AlertaConfigProjection } from './alerta-config';

export class Alerta {

	public id: number;
	public alertaCId: number;
	public config: AlertaConfigProjection;
	public referenciaProcesoId: number;
	public codigoTramite: string;
	public estatusAlertaId: number;
	public estatusAlerta: ControlMaestroMultiple;
	public textoRepresentativo: string;
	public fechaInicio: Date;
	public creadoPorId: number;
	public fechaUltimaModificacion: Date;
	public modificadoPorId: number;
	public fechaAutorizacion: Date;
	public detalles: Array<AlertaDetalle>;

}

export class AlertaEtapa {
    public id?: number;
	public alertaConfigId?: number;
	public orden?: number;
	public tipoAprobacion?: ControlMaestroMultiple;
	public tipoAprobacionId?: number;
	public tipoOrden?: ControlMaestroMultiple;
	public tipoOrdenId?: number;
	public condicionAprobacion?: ControlMaestroMultiple;
	public condicionAprobacionId?: number;
	public criteriosEconomicos?: boolean;
	public notificarCreador?: boolean;
	public montoMinimo?: number;
	public montoMaximo?: number;
	public tipoMonto?: ControlMaestroMultiple;
	public tipoMontoId?: number;
	public autorizacionDirecta?: boolean;
	public estatusReferencia?: ControlMaestroMultiple;
	public estatusReferenciaId?: number;
	public tipoAlerta?: ControlMaestroMultiple;
	public tipoAlertaId?: number;
	public sucursalId?: number;
	public mostrarUsuario?: boolean;
	public fechaCreacion?: Date;
	public creadoPor?: Usuario;
	public creadoPorId?: number;
	public fechaModificacion?: Date;
	public modificadoPor?: Usuario;
	public modificadoPorId?: number;
	public detalles?: AlertaEtapaAprobacion[];
	public notificadores?: AlertaEtapaNotificacion[];
    public notificacionCorreo?: boolean;
	
	constructor(object){
		this.id = object?.id || null;
		this.alertaConfigId = object?.alertaConfigId || null;
		this.orden = object?.orden || null;
		this.tipoAprobacion = object?.tipoAprobacion || null;
		this.tipoAprobacionId = object?.tipoAprobacionId || null;
		this.tipoOrden = object?.tipoOrden || null;
		this.tipoOrdenId = object?.tipoOrdenId || null;
		this.condicionAprobacion = object?.condicionAprobacion || null;
		this.condicionAprobacionId = object?.condicionAprobacionId || null;
		this.criteriosEconomicos = object?.criteriosEconomicos || false;
		this.notificarCreador = object?.notificarCreador || false;
		this.montoMinimo = object?.montoMinimo || null;
		this.montoMaximo = object?.montoMaximo || null;
		this.tipoMonto = object?.tipoMonto || null;
		this.tipoMontoId = object?.tipoMontoId || null;
		this.autorizacionDirecta = object?.autorizacionDirecta || false;
		this.estatusReferencia = object?.estatusReferencia || null;
		this.estatusReferenciaId = object?.estatusReferenciaId || null;
		this.tipoAlerta = object?.tipoAlerta || null;
		this.tipoAlertaId = object?.tipoAlertaId || null;
		this.sucursalId = object?.sucursalId || null;
		this.mostrarUsuario = object?.mostrarUsuario || false;
		this.fechaCreacion = object?.fechaCreacion || null;
		this.creadoPor = object?.creadoPor || null;
		this.creadoPorId = object?.creadoPorId || null;
		this.fechaModificacion = object?.fechaModificacion || null;
		this.modificadoPor = object?.modificadoPor || null;
		this.modificadoPorId = object?.modificadoPorId || null;
		this.detalles = object?.detalles || [];
		this.notificadores = object?.notificadores || [];
        this.notificacionCorreo = object?.notificacionCorreo || false;
	}
}

export class AlertaEtapaAprobacion {
    public id?: number;
	public orden?: number;
	public aprobadorId?: number;
	public departamentoId?: number;
	public etapaId?: number;
	public aprobador?: Usuario;
	public activo?: boolean;
	
	constructor(object){
		this.id = object?.id || null;
		this.orden = object?.orden || null;
		this.aprobadorId = object?.aprobadorId || null;
		this.departamentoId = object?.departamentoId || null;
		this.etapaId = object?.etapaId || null;
		this.aprobador = object?.aprobador || null;
		this.activo = object?.activo || true;
	}
}

export class AlertaEtapaNotificacion {
    public id?: number;
	public usuarioNotificacionId?: number;
	public alertaConfiguracionId?: number;
	public tipoNotificacionAlerta?: number;
	public notificador?: Usuario;
	public activo?: boolean;

	constructor(object){
		this.id = object?.id || null;
		this.usuarioNotificacionId = object?.usuarioNotificacionId || null;
		this.alertaConfiguracionId = object?.alertaConfiguracionId || null;
		this.tipoNotificacionAlerta = object?.tipoNotificacionAlerta || null;
		this.notificador = object?.notificador || null;
		this.activo = object?.activo || true;
	}
}