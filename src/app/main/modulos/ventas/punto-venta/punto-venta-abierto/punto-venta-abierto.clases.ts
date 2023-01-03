import { ElementRef } from "@angular/core";
import { OrdenVentaDetalle } from "@app/main/modelos/orden-venta-detalle";

export class OrdenVentaDetalleDatasource extends OrdenVentaDetalle{
	public descripcion: string;
	public alumnoId: number;
	public nombreAlumno: string;
	public total: number;
	public idTmp: number;
	public montoSubtotal: number;
    public montoIva: number;
    public montoIeps: number;
	public grupoId: number;
	public idiomaId: number;
	public programaId: number;
	public nivel: number;
	public becaUDGId: number;
	public noAplicaDescuentos?: boolean;
}

export class InfiniteScrollController {

	public scrollIndex: number;
	public maxBusqueda: number;
	private scrollFinalizado: boolean;
	private lowestPositionY: number = 0;

	constructor(
		private elementRef: ElementRef,
		private getRegistros: () => {},
		maxBusqueda: number = 100
	){
		this.scrollIndex = 0;
		this.maxBusqueda = maxBusqueda
		this.scrollFinalizado = false;
	}

	scrollToStart(){
		if(this.elementRef && this.scrollIndex == 0){
			this.elementRef.nativeElement.scrollTo(0,0);
		}
	}

	registrosRecuperados(totalRegistros: number){
		if(this.scrollIndex != 0 && totalRegistros < this.maxBusqueda){
			this.scrollFinalizado = true;
		}else{
			this.scrollFinalizado = false;
		}
	}

	onScrollDown(e){
		const scrollLocation = e.target.scrollTop; // how far user scrolled
		if(!this.scrollFinalizado && this.lowestPositionY < scrollLocation){
			this.lowestPositionY = scrollLocation;
			const tableViewHeight = e.target.offsetHeight // viewport: ~500px
			const tableScrollHeight = e.target.scrollHeight // length of all table
	
			// If the user has scrolled within 500px of the bottom, add more data
			const buffer = 500;
			const limit = tableScrollHeight - tableViewHeight - buffer;
			if (scrollLocation > limit) {
				this.scrollIndex += this.maxBusqueda;
				this.getRegistros();
			}
		}
	}

}

export class CardExtra {
    id: string;
    esExtra: boolean;
    nombre: string;
}

/**
 * Controlador de inscripciones en el PV
 *
 * @export
 * @class AlumnosRepetidosController
 */
export class AlumnosRepetidosController {

	/**
	 * Propiedad que controla las inscripciones con grupo por alumno (solo se permite 1 inscripción por idioma)
	 *
	 * @private
	 * @type {{[alumnoId:string]: {[idiomaId:string]: boolean}}}
	 * @memberof AlumnosRepetidosController
	 */
	private inscripcionMap: {[alumnoId:string]: {[idiomaId:string]: boolean}};
	/**
	 * Propiedad que controla las inscripciones sin grupo por alumno (se le permite al alumno inscribirse a varios niveles del mismo curso a la vez)
	 *
	 * @private
	 * @type {{[alumnoId:string]: {[idiomaId:string]: {[programaId:string]: {[nivel:string]: boolean}}}}}
	 * @memberof AlumnosRepetidosController
	 */
	private sinGrupoMap: {[alumnoId:string]: {[idiomaId:string]: {[programaId:string]: {[nivel:string]: boolean}}}};

	/**
	 * Crea una instancia de AlumnosRepetidosController.
	 * @memberof AlumnosRepetidosController
	 */
	constructor(){
		this.limpiar();
	}

	/**
	 * Guarda el registro de que el alumno X ya cuenta con una inscripción al grupo Y
	 *
	 * @param {number} alumnoId
	 * @param {number} idiomaId
	 * @return {*}  {void}
	 * @memberof AlumnosRepetidosController
	 */
	agregar(alumnoId: number, idiomaId: number): void {
		// En caso de que algún parámetro sea null termina el proceso
		if(!alumnoId || !idiomaId){
			return;
		}
		
		// En caso de que el alumno no cuente con ninguna relación, se inicializa con un objeto vacío
		if(!this.inscripcionMap[String(alumnoId)]){
			this.inscripcionMap[String(alumnoId)] = {};
		}

		// Se guarda el registro de que el alumno ya cuenta con una relación al idioma
		this.inscripcionMap[String(alumnoId)][String(idiomaId)] = true;
	}

	/**
	 * Guarda el registro de que el alumno X ya cuenta con una inscripción sin grupo con el idioma A, programa el  B y el nivel C
	 *
	 * @param {number} alumnoId
	 * @param {number} idiomaId
	 * @param {number} programaId
	 * @param {number} nivel
	 * @return {*}  {void}
	 * @memberof AlumnosRepetidosController
	 */
	agregarSinGrupo(alumnoId: number, idiomaId: number, programaId: number, nivel: number): void {
		// En caso de que algún parámetro sea null termina el proceso
		if(!alumnoId || !idiomaId || !programaId || !nivel){
			return;
		}
		
		// En caso de que el alumno no cuente con ninguna relación, se inicializa con un objeto vacío
		if(!this.sinGrupoMap[String(alumnoId)]){
			this.sinGrupoMap[String(alumnoId)] = {};
		}
		if(!this.sinGrupoMap[String(alumnoId)][String(idiomaId)]){
			this.sinGrupoMap[String(alumnoId)][String(idiomaId)] = {};
		}
		if(!this.sinGrupoMap[String(alumnoId)][String(idiomaId)][String(programaId)]){
			this.sinGrupoMap[String(alumnoId)][String(idiomaId)][String(programaId)] = {};
		}

		// Se guarda el registro de que el alumno ya cuenta con una relación idioma-programa-nivel
		this.sinGrupoMap[String(alumnoId)][String(idiomaId)][String(programaId)][String(nivel)] = true;
	}

	/**
	 * Elimina la relación alumno-idioma de las incripciones con grupo
	 *
	 * @param {number} alumnoId
	 * @param {number} idiomaId
	 * @return {*}  {void}
	 * @memberof AlumnosRepetidosController
	 */
	eliminar(alumnoId: number, idiomaId: number): void{
		// En caso de que algún parámetro sea null termina el proceso
		if(!alumnoId || !idiomaId){
			return;
		}
		
		// En caso de que el alumno no cuente con ninguna relación, se inicializa con un objeto vacío
		if(!this.inscripcionMap[String(alumnoId)]){
			this.inscripcionMap[String(alumnoId)] = {};
		}
		
		// Se guarda el registro de que el alumno ya no cuenta con una relación al idioma
		this.inscripcionMap[String(alumnoId)][String(idiomaId)] = false;
	}

	/**
	 * Elimina la relación alumno-idioma-programa-nivel de las incripciones sin grupo
	 *
	 * @param {number} alumnoId
	 * @param {number} idiomaId
	 * @param {number} programaId
	 * @param {number} nivel
	 * @return {*}  {void}
	 * @memberof AlumnosRepetidosController
	 */
	eliminarSinGrupo(alumnoId: number, idiomaId: number, programaId: number, nivel: number): void{
		// En caso de que algún parámetro sea null termina el proceso
		if(!alumnoId || !idiomaId || !programaId || !nivel){
			return;
		}
		
		// En caso de que el alumno no cuente con ninguna relación, se inicializa con un objeto vacío
		if(!this.sinGrupoMap[String(alumnoId)]){
			this.sinGrupoMap[String(alumnoId)] = {};
		}
		if(!this.sinGrupoMap[String(alumnoId)][String(idiomaId)]){
			this.sinGrupoMap[String(alumnoId)][String(idiomaId)] = {};
		}
		if(!this.sinGrupoMap[String(alumnoId)][String(idiomaId)][String(programaId)]){
			this.sinGrupoMap[String(alumnoId)][String(idiomaId)][String(programaId)] = {};
		}
		
		// Se guarda el registro de que el alumno ya no cuenta con una relación al idioma-programa-nivel
		this.sinGrupoMap[String(alumnoId)][String(idiomaId)][String(programaId)][String(nivel)] = false;
	}

	/**
	 * Verifica si el alumno ya cuenta con una relación al idioma indicado (se debe utilizar en inscripciones con grupo)
	 *
	 * @param {number} alumnoId
	 * @param {number} idiomaId
	 * @return {*}  {boolean}
	 * @memberof AlumnosRepetidosController
	 */
	alumnoYaInscrito(alumnoId: number, idiomaId: number): boolean{
		// En caso de que algún parámetro sea null termina el proceso
		if(!alumnoId || !idiomaId){
			return false;
		}
		
		// Si no hay registros relacionados al alumno en inscripcionMap ni sinGrupoMap significa que no tiene inscripciones
		if(!this.inscripcionMap[String(alumnoId)] && !this.sinGrupoMap[String(alumnoId)]){
			return false;
		}
		
		// Si el alumno ya cuenta con una inscripción con grupo, se retorna true
		if(this.inscripcionMap[String(alumnoId)][String(idiomaId)]){
			return true;
		}

		// En caso de que el alumno no cuente con una relación con grupo, se busca que tenga una inscripción sin grupo en el idioma indicado
		if(!this.sinGrupoMap[String(alumnoId)] || !this.sinGrupoMap[String(alumnoId)][String(idiomaId)]){
			return false;
		}
		for(let programaId in this.sinGrupoMap[String(alumnoId)][String(idiomaId)]){
			for(let nivel in this.sinGrupoMap[String(alumnoId)][String(idiomaId)][String(programaId)]){
				if(this.sinGrupoMap[String(alumnoId)][String(idiomaId)][String(programaId)][String(nivel)]){
					return true;
				}
			}
		}

		// En caso de que no eexista ninguna relación alumno-idioma (con grupo) ni alumno-idioma-programa-nivel (sin grupo) se retorna false
		return false;
	}

	/**
	 * Verifica si el alumno ya cuenta con una relación al conjunto idioma-programa-nivel indicado (se debe utilizar en inscripciones sin grupo)
	 *
	 * @param {number} alumnoId
	 * @param {number} idiomaId
	 * @param {number} programaId
	 * @param {number} nivel
	 * @return {*}  {boolean}
	 * @memberof AlumnosRepetidosController
	 */
	alumnoYaInscritoSinGrupo(alumnoId: number, idiomaId: number, programaId: number, nivel: number): boolean{
		// En caso de que algún parámetro sea null termina el proceso
		if(!alumnoId || !idiomaId || !programaId || !nivel){
			return;
		}
		
		// Si no hay registros relacionados al alumno en sinGrupoMap significa que no tiene inscripciones
		if(!this.sinGrupoMap[String(alumnoId)] || !this.sinGrupoMap[String(alumnoId)][String(idiomaId)] || !this.sinGrupoMap[String(alumnoId)][String(idiomaId)][String(programaId)]){
			return false;
		}
		
		// En caso de que si exista la relación se retorna lo quee contenga dicha relación
		return !!this.sinGrupoMap[String(alumnoId)][String(idiomaId)][String(programaId)][String(nivel)];
	}

	/**
	 * Reinicia los mapeos
	 *
	 * @return {*}  {void}
	 * @memberof AlumnosRepetidosController
	 */
	limpiar(): void{
		this.inscripcionMap = {};
		this.sinGrupoMap = {};
	}

}