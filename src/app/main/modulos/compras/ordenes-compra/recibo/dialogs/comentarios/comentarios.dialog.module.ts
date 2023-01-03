import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ComentariosDialogComponent } from './comentarios.dialog';

@NgModule({
    declarations: [
		ComentariosDialogComponent
	],
	imports: [
		MatButtonModule
	],
	entryComponents: [
		ComentariosDialogComponent
	],
	exports: [
		ComentariosDialogComponent
	]
})
export class ComentariosDialogModule {
}