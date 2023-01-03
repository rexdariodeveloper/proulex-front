import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { fuseAnimations } from "@fuse/animations";

@Component({
	selector: 'pixvs-calculadora',
	templateUrl: './calculadora.component.html',
	styleUrls: ['./calculadora.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'w-100-p h-100-p'
    }
})
export class PixvsCalculadoraComponent implements OnInit {

	constructor(
	) {
	}

	ngOnInit() {
    }

}