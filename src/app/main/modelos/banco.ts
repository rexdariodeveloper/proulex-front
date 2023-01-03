import { Usuario } from "@models/usuario";

export class Banco {
    public id?: number;
    public codigo?: string;
    public rfc?: string;
    public razonSocial?: string;
    public nombre?: string;
    public activo?: boolean;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaCreacion?: Date;
    public fechaModificacion?: Date;

    constructor(object?) {
        this.id = object?.id || null;
        this.nombre = object?.nombre || null;
        this.codigo = (object?.codigo || '').toUpperCase();
        this.rfc = (object?.rfc || '').toUpperCase();
        this.razonSocial = (object?.razonSocial || '').toUpperCase();
        this.activo = object ? object.activo : true;
        this.creadoPor = object?.creadoPor || null;
        this.creadoPorId = object?.creadoPorId || null;
        this.modificadoPor = object?.modificadoPor || null;
        this.modificadoPorId = object?.modificadoPorId || null;
        this.fechaCreacion = object?.fechaCreacion || null;
        this.fechaModificacion = object?.fechaModificacion || null;
    }
}