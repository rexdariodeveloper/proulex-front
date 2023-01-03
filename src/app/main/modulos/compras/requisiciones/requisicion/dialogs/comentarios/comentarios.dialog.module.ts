import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RequisicionComentariosDialogComponent } from './comentarios.dialog';

@NgModule({
    declarations: [
		RequisicionComentariosDialogComponent
	],
	imports: [
		MatButtonModule
	],
	entryComponents: [
		RequisicionComentariosDialogComponent
	],
	exports: [
		RequisicionComentariosDialogComponent
	]
})
export class RequisicionComentariosDialogModule {
}