import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MontoCalculosDirective } from './monto-calculos.directive';

@NgModule({
	declarations: [MontoCalculosDirective],
	imports: [ CommonModule ],
	exports: [MontoCalculosDirective]
})
export class MontoCalculosModule {}