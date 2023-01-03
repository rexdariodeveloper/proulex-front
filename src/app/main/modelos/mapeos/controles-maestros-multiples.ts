export class ControlesMaestrosMultiples {

	static CMM_OCR_TipoArchivo = {
		EVIDENCIA: 2000101,
        FACTURA: 2000102
	};

	static CMM_ART_TipoCosto = {
		ULTIMO_COSTO: 2000041,
		COSTO_PROMEDIO: 2000042,
		COSTO_ESTANDAR: 2000043,
	};

	static CMM_OC_EstatusOC = {
		EN_EDICION: 2000061,
        BORRADA: 2000062,
        ABIERTA: 2000063,
        CERRADA: 2000064,
        CANCELADA: 2000065,
        RECIBO_PARCIAL: 2000066,
        RECIBIDA: 2000067,
        FACTURADA: 2000068
	};

	static CMM_CXPF_EstatusFactura = {
        BORRADO: 2000111,
        ABIERTA: 2000112,
        CERRADA: 2000113,
        CANCELADA: 2000114,
        PAGO_PROGRAMADO: 2000115,
        PAGO_PROGRAMADO_EN_PROCESO: 2000116,
        PAGO_PARCIAL: 2000117,
        PAGADA: 2000118
    };

    static CMM_CXPF_TipoRegistro = {
        NOTA_DE_DEBITO: 2000121,
		FACTURA_CXP: 2000122,
		FACTURA_SERVICIO_CXP: 2000123
    };

    static CMM_CCXP_TipoPago = {
        NO_PAGAR: 2000141,
        PAGO_DE_INMEDIATO: 2000142,
        PAGO_PROGRAMADO: 2000143
    };

    static CMM_CXPF_TipoRetencion = {
        ISR: 2000151,
        IVA: 2000152
	};
	
	static CMM_CXPS_EstadoSolicitudPago = {
        ACEPTADA: 2000161,
        PAGADA: 2000162,
        CANCELADA: 2000163,
        BORRADA: 2000164,
        POR_AUTORIZAR: 2000165,
        RECHAZADA: 2000166
    };

    static CMM_CXPP_EstatusPago = {
        PAGO_PARCIAL: 2000171,
        PAGADO: 2000172,
        PAGO_CANCELADO: 2000173
    }

    static CMM_CXPP_FormaPago = {
        TRANSFERENCIA_ELECTRONICA_DE_FONDOS: 2000181,
        EFECTIVO: 2000182,
        TARJETA_DE_CREDITO: 2000183,
        TARJETA_DE_DEBITO: 2000184,
        POR_DEFINIR: 2000185
    }

    static CMM_REQ_EstatusRequisicion = {
        GUARDADO: 2000191,
        POR_AUTORIZAR: 2000192,
        AUTORIZADA: 2000193,
        EN_REVISION: 2000194,
        RECHAZADA: 2000195,
        EN_PROCESO: 2000196,
        CONVERTIDA: 2000197,
        BORRADA: 2000198
    }

    static CMM_REQP_EstatusRequisicionPartida = {
        ABIERTA: 2000201,
        REVISION: 2000202,
        RECHAZADO: 2000203
    }

    static CMM_SUC_TipoSucursal = {
        ZMG: 2000211,
        FORANEA: 2000212,
        ALLIANCE: 2000213
    }

    static CMM_IMP_TipoImpresion = {
        LOCAL: 2000231,
        COMPARTIDA: 2000232,
        IP: 2000233
	};

	static CMM_CXPSPS_EstadoSolicitudPago = {
        ACEPTADA: 2000281,
        PAGADA: 2000282,
        CANCELADA: 2000283,
        BORRADA: 2000284,
        POR_AUTORIZAR: 2000285,
        RECHAZADA: 2000286
    };

    static CMM_CPXSPRH_TipoPago = {
        RETIRO_CAJA_AHORRO: 2000356,
        PENSION_ALIMENTICIA: 2000357,
        INCAPACIDAD_PERSONAL: 2000358,
        PAGO_BECARIO: 2000359
    };

    static CMM_RFC_TipoPersona = {
        FISICA: 2000410,
        MORAL: 2000411,
        EXTRANJERO: 2000412
    };

    static CMM_ALU_ProgramaJOBS = {
        JOBS: 2000530,
        JOBS_SEMS: 2000531
    }

    static CMM_AA_TipoAsistencia = {
        ASISTENCIA: 2000550,
        FALTA: 2000551,
        FALTA_JUSTIFICADA: 2000552,
        RETARDO: 2000553,
    }

    static CMM_INS_Estatus = {
        PAGADA: 2000510,
        PENDIENTE_DE_PAGO: 2000511,
        CANCELADA: 2000512
    }

    static CMM_INSSG_Estatus = {
        PAGADA: 2000540,
        PENDIENTE_DE_PAGO: 2000541,
        ASIGNADA: 2000542,
        CANCELADA: 2000543
    }

    static CMM_CE_MedioEnteradoProulex = {
        _nombre: 'CMM_CE_MedioEnteradoProulex'
    }

    static CMM_CE_RazonEleccionProulex = {
        _nombre: 'CMM_CE_RazonEleccionProulex'
    }

    static CMM_ALUEC_Estatus = {
        _nombre: 'CMM_ALUEC_Estatus',
        EN_PROCESO: 2000640,
        FINALIZADO: 2000641,
        CANCELADO: 2000642,
        RELACIONADO: 2000643
    }

    static CMM_ALUEC_Tipo = {
        _nombre: 'CMM_ALUEC_Tipo',
        EXAMEN: 2000650,
        CERTIFICACION: 2000651
    }

    static CMM_RH_TipoProcesoRH = {
        NUEVA_CONTRATACION: 2000900,
        RENOVACION: 2000901,
        BAJA: 2000902,
        CAMBIO: 2000903
    }

    static CMM_GEN_TipoOpcion = {
        OPCIONAL: 2000910,
        OBLIATORIO: 2000911,
        NO_REQUERIDO: 2000912,
    }

    static CMM_GEN_TipoVigencia = {
        VIGENCIA: 2000920,
        FECHA_DE_VENCIMIENTO: 2000921,
        NO_APLICA: 2000922,
    }

    static CMM_PROGRU_Estatus = {
        ACTIVO: 2000620,
        FINALIZADO: 2000621,
        CANCELADO: 2000622,

        _nombre: "CMM_PROGRU_Estatus",
    }

    static CMM_UMT_TipoTiempo = {
        DIA: 2000930,
        MES: 2000931,
        ANIO: 2000932
    }

    static CMM_ENT_TipoHorario = {
        CARGA_HORA_SEMANA: 2000940,
        ROLAR_TURNO: 2000941,
        HORARIO_FIJO: 2000942,
    }

    static CMM_EMP_Estatus = {
        ACTIVO: 2000950,
        BORRADO: 2000951,
        GUARDADO: 2000952,
        PROSPECTO: 2000953,
        BAJA: 2000954,
        RENOVADO: 2000955,
        AUTORIZADO: 2000956
    }

    static CMM_EMP_TipoEmpleado = {
        ADMINISTRATIVO: 2000293,
        ACADEMICO: 2000294,
        BECARIO: 2000295
    }

    static CMM_EMP_TipoArchivo = {
        DOCUMENTO: 2000960
    }

    static CMM_OVC_TiposDocumento = {
        NOTA_DE_VENTA_O_FACTURA: 2000740,
        NUMERO_DE_CORTE: 2000741,
        COMPROBANTE_DE_PAGO: 2000742,
        IDENTIFICACION_OFICIAL_DE_LA_PERSONA_QUE_RECIBE_LA_TRANSFERENCIA: 2000743
    };

    static CMM_OVC_TipoMovimiento = {
        DEVOLUCION: 2000080,
        CANCELACION: 2000081
    };

    static CMM_SUC_TipoFacturaGlobal = {
        POR_SEDE: 2000440,
        POR_USUARIO: 2000441
    };

    static CMM_ART_Idioma = {
        ACADEMY: 2001050
    }
}