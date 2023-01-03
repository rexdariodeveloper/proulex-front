import { Component, Input, ViewEncapsulation } from "@angular/core";
import { ArticuloComponenteArbolProjection } from "@app/main/modelos/articulo-componente";
import { fuseAnimations } from "@fuse/animations";

@Component({
    selector: 'articulo-componente-nodo',
    templateUrl: './articulo-componente-nodo.component.html',
    styleUrls: ['./articulo-componente-nodo.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ArticuloComponenteNodoComponent {

	@Input() componente: ArticuloComponenteArbolProjection;
	@Input() sangria: number = 0;

	mostrarHijos: boolean = false;

	constructor(){}

	onMostrarHijos(){
		// debugger;
		if(this.componente?.componente?.componentes?.length){
			this.mostrarHijos = !this.mostrarHijos;
		}
	}

}