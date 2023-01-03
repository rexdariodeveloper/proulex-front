import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { Usuario } from "@models/usuario";
import { Almacen, AlmacenComboProjection } from "./almacen";
import { Cliente, ClienteComboProjection } from "./cliente";
import { ClienteRemisionDetalle, ClienteRemisionDetalleEditarProjection } from "./cliente-remision-detalle"
import { Moneda, MonedaComboProjection } from "./moneda";

export class ClienteRemision {

    public id?: number;
    public codigo?: string;
    public cliente?: Cliente;
    public clienteId?: number;
    public fecha?: any;
    public moneda?: Moneda;
    public monedaId?: number;
    public almacenOrigen?: Almacen;
    public almacenOrigenId?: number;
    public almacenDestino?: Almacen;
    public almacenDestinoId?: number;
    public comentario?: string;
    public estatus?: ControlMaestroMultiple;
    public estatusId?: number;
    public fechaCreacion?: any;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public fechaModificacion?: any;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public detalles?: ClienteRemisionDetalle;

}

export class ClienteRemisionListadoProjection {

    public id?: number;
    public codigo?: string;
    public clienteNombre?: string;
    public clienteRFC?: string;
    public fecha?: any;
    public almacenOrigenNombre?: string;
    public almacenDestinoNombre?: string;
    public monto?: number;
    public estatusValor?: string;

}

export class ClienteRemisionEditarProjection {

    public id?: number;
    public codigo?: string;
    public cliente?: ClienteComboProjection;
    public fecha?: any;
    public moneda?: MonedaComboProjection;
    public almacenOrigen?: AlmacenComboProjection;
    public almacenDestino?: AlmacenComboProjection;
    public comentario?: string;
    public estatus?: ControlMaestroMultipleComboProjection;
    public fechaModificacion?: any;
    public detalles?: ClienteRemisionDetalleEditarProjection[];

}

export class ClienteRemisionFacturarProjection {

    id?: number;
    fecha?: any;
    codigo?: string;
    monto?: number;
    montoPorRelacionar?: number;

}