import { Pipe, PipeTransform } from '@angular/core';
import { MenuListadoGeneral } from '@models/menu-listado-general';

@Pipe({name: 'BuscarMenuPipe'})
export class BuscarMenuPipe implements PipeTransform {
	transform(menu: MenuListadoGeneral[] = [], textoBuscar: string = ''): MenuListadoGeneral[] {
		return this.buscarMenuES(menu,textoBuscar);
	}

	private buscarMenuES(menuListado: MenuListadoGeneral[], textoBuscar: string): MenuListadoGeneral[] {
		let menuFiltrado: MenuListadoGeneral[] = [];
		for(let menu of menuListado){
			if(menu.titulo.toLowerCase().includes(textoBuscar.toLowerCase())){
				menuFiltrado.push(menu);
			}else{
				let children = this.buscarMenuES(menu.children,textoBuscar);
				if(children.length){
					let menuAgregar = {...menu};
					menuAgregar.children = children;
					menuFiltrado.push(menuAgregar);
				}
			}
		}
		return menuFiltrado;
	}

	private buscarMenuEN(menuListado: MenuListadoGeneral[], textoBuscar: string): MenuListadoGeneral[] {
		let menuFiltrado: MenuListadoGeneral[] = [];
		for(let menu of menuListado){
			if(menu.tituloEN.toLowerCase().includes(textoBuscar.toLowerCase())){
				menuFiltrado.push(menu);
			}else{
				let children = this.buscarMenuEN(menu.children,textoBuscar);
				if(children.length){
					let menuAgregar = {...menu};
					menuAgregar.children = children;
					menuFiltrado.push(menuAgregar);
				}
			}
		}
		return menuFiltrado;
	}
}