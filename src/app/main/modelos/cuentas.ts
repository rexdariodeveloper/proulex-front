import { Usuario } from "@models/usuario";
import { Banco } from "./banco";
import { Moneda } from "./moneda";

export class Cuenta {
	public id?: number;
    public codigo?: string;
    public descripcion?: string;
    public moneda?: Moneda;
    public monedaId?: number;
    public banco?: Banco;
    public bancoId?: number;
    public convenio?: string;
    public clabe?: string;
    public activo?: boolean;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaCreacion?: Date;
    public fechaModificacion?: Date;

    constructor(object){
        this.id                 = object?.id || null;
        this.codigo             = object?.codigo || null;
        this.descripcion        = object?.descripcion || null;
        this.moneda             = object?.moneda || null;
        this.monedaId           = object?.monedaId || null;
        this.banco              = object?.banco || null;
        this.bancoId            = object?.bancoId || null;
        this.convenio           = object?.convenio || null;
        this.clabe              = object?.clabe || null;
        this.activo             = object?.activo || true;
        this.creadoPor          = object?.creadoPor || null;
        this.creadoPorId        = object?.creadoPorId || null;
        this.modificadoPor      = object?.modificadoPor || null;
        this.modificadoPorId    = object?.modificadoPorId || null;
        this.fechaCreacion      = object?.fechaCreacion || null;
        this.fechaModificacion  = object?.fechaModificacion || null;
    }
}

export class CuentaBancariaComboProjection {

    public id?: number;
    public codigo?: string;
    public descripcion?: string;
    public monedaId?: number;
    public bancoId?: number;

}