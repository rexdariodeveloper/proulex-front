export class PixvsMatTreeNodo<TInfo,TChildren> {
	public info: TInfo;
	public ocultarSeleccion: boolean;
	public ocultarAcciones: boolean;
	public selected: boolean;
	public children?: PixvsMatTreeNodo<TInfo,TChildren>[];
	public accionesExtra?: PixvsMatTreeNodoAccion<TChildren>[];
	[key:string]: any;
}

export class PixvsMatTreeNodoAccion<T> {
	icono: string;
	tooltip: string;
	accion: (s: T) => void
}