export class FichaListadoConfig {
    static EXCEL: number = 1;
    static PERSONALIZADO: number = 2;
    static ARCHIVO_BY_ID: number = 3;
    static ARCHIVO_BY_HASHID: number = 4;

    public icono?: string;
    public columnaId: string;
    public rutaDestino: string;
    public rutaDestinoSoloLectura?: boolean = false;
    public nodoId?: string;
    public localeEN: any;
    public localeES: any;
    public columns: any[];
    public displayedColumns: string[];
    public columasFechas: string[];
    public listadoMenuOpciones: ListadoMenuOpciones[];
    public listadoAcciones?: ListadoAcciones[];
    public reordenamiento?: boolean ;
    public omitirRedireccionVer?: boolean ;
    public paginatorSize?: number;
    public ocultarPaginado?: boolean;
    public ocultarBotonNuevo?: boolean;
    public mostrarBotonEnviar?: boolean;
    public ocultarBotonRefrescar?: boolean = false;
    public etiquetaEnviar?: string;
    public ocultarPaginador?: boolean;
    public cargarUnicoRegistro?: boolean;
    public esFusePerfectScrollbar?: boolean = true;

}

export interface ListadoMenuOpciones {
    id?: number;
    title: string;
    icon?: string;
    tipo: number | string;
    url?: string;
}

export interface ListadoAcciones {
    title: string;
    tipo:  number | string;
    icon?: string;
	url?:  string;
    ocultarBotonTodo?: boolean;
	
	columnaIndicadorMostrar?:  string;
	columnaIndicadorOcultar?:  string;
	
	columnaOpcionesMenu?:  string;
	columnaMostrarOpcionMenu?:  string;
	
    accion?: (element: any, event?, id?) => void;
}