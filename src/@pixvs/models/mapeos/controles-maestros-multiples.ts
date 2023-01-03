export class ControlesMaestrosMultiples {

	static CMM_Estatus = {
		ACTIVO: 1000001,
		INACTIVO: 1000002,
		BORRADO: 1000003
	};

	static CMM_MP_TipoNodo = {
		MODULO: 1000010,
		FICHA: 1000011,
		REPORTE: 1000012
	};


	static CMM_SYS_SistemaAcceso = {
		WEB: 1000021,
		APP: 1000022
	};

	static CMM_EP_TipoEstadisticaPagina = {
		SECCION: 1000051,
		CONTENIDO: 1000052,
		ENLACE: 1000053
	};

	static CMM_ACE_TipoAprobacion = {
        USUARIO      : 1000101,
        DEPARTAMENTO : 1000102,
    };
    static CMM_ACE_TipoOrden = {
        PARALELA   : 1000111,
        SECUENCIAL : 1000112,
    };
    static CMM_ACE_TipoCondicionAprobacion = {
        UNA_APROBACION     : 1000121,
        TODAS_APROBACIONES : 1000122,
        NOTIFICAR_CREADOR  : 1000123,
    };
    static CMM_ACE_TipoMonto = {
        DIARIO     : 1000131,
        MENSUAL    : 1000132,
        EXHIBICION : 1000133,
    };
    static CMM_CALC_TipoConfigAlerta = {
        NOTIFICACION : 1000141,
        AMBOS        : 1000142,
        AUTORIZACION : 1000143,
    };
    static CMM_CALE_EstatusAlerta = {
        EN_PROCESO  : 1000151,
        RECHAZADA   : 1000152,
        EN_REVISION : 1000153,
        AUTORIZADA  : 1000154,
        CANCELADA   : 1000155,
    };
    static CMM_CALC_TipoMovimiento = {
        SOLICITUD_PAGO : 1000161,
        REQUISICIONES  : 1000162,
        ORDENES_COMPRA : 1000163,
        PEDIDOS        : 1000164,
        SURTIR_PEDIDOS : 1000165,
        PAGOS          : 1000166,
    };
    static CMM_CALRD_TipoAlerta = {
        NOTIFICACION : 1000171,
        AUTORIZACION : 1000172,
    };
    static CMM_ACEN_TipoNotificacion = {
        INICIAL : 1000181,
        FINAL   : 1000182,
    };
    static CMM_USU_TipoId = {
        SUPER_ADMIN : 1000191,
        ALUMNO   : 1000192,
        SIIAU: 1000194,
        PLATAFORMA: 1000193
    };

    static CMM_EMPC_TipoPermiso = {
        OCULTAR: 1000030,
        SOLO_LECTURA: 1000031
    };
}