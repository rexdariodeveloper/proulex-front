import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedondearDirective } from './redondear.directive';

@NgModule({
	declarations: [RedondearDirective],
	imports: [ CommonModule ],
	exports: [RedondearDirective]
})
export class RedondearDirectiveModule {}