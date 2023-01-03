import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { fuseAnimations } from "@fuse/animations";

@Component({
	selector: 'pixvs-bloqueo-pantalla',
	templateUrl: './bloqueo-pantalla.component.html',
	styleUrls: ['./bloqueo-pantalla.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixvsBloqueoPantallaComponent implements OnInit {

	constructor(
	) {
	}

	ngOnInit() {
    }

}