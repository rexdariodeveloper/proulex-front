import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { Almacen, AlmacenComboDomicilioProjection, AlmacenComboProjection } from './almacen';
import { Departamento, DepartamentoComboProjection } from '../../../@pixvs/models/departamento';
import { RequisicionPartida, RequisicionPartidaEditarProjection } from './requisicion-partida';
import { Sucursal, SucursalComboProjection } from './sucursal';

export class Requisicion {
	public id: number;
    public codigo: string;
    public fecha: Date;
    public estadoRequisicion: ControlMaestroMultiple;
    public estadoRequisicionId: number;
    public comentarios: string;
    public departamento: Departamento;
    public departamentoId: number;
    public almacen: Almacen;
    public almacenId: number;
    public enviadaPor: Usuario;
    public enviadaPorId: number;
    public fechaCreacion: Date;
    public creadoPor: Usuario;
    public creadoPorId: number;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
    public partidas: RequisicionPartida[];
}

export class RequisicionListadoProjection {
	public id: number;
    public codigo: string;
    public fecha: Date;
    public departamento: DepartamentoComboProjection;
    public sucursal: SucursalComboProjection;
    public almacen: AlmacenComboProjection;
    public creadoPor: UsuarioComboProjection;
    public estadoRequisicion: ControlMaestroMultipleComboProjection;
}

export class RequisicionEditarProjection {
	public id: number;
    public codigo: string;
    public fecha: Date;
    public estadoRequisicion: ControlMaestroMultipleComboProjection;
    public comentarios: string;
    public departamento: DepartamentoComboProjection;
    public sucursal: SucursalComboProjection;
    public almacen: AlmacenComboProjection;
	public enviadaPor: UsuarioComboProjection;
	creadoPor?: UsuarioComboProjection;
    public fechaModificacion: Date;
    public partidas: RequisicionPartidaEditarProjection[];
}

export class RequisicionConvertirListadoProjection {
	public id: number;
    public codigo: string;
    public fecha: Date;
    public sucursal: SucursalComboProjection;
    public almacen: AlmacenComboDomicilioProjection;
	public departamento: DepartamentoComboProjection;
	public comentarios: string;
    public estadoRequisicion: ControlMaestroMultipleComboProjection;
}