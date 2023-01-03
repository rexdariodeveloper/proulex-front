import { Component, Input } from "@angular/core";
import { trigger, transition, style, animate } from "@angular/animations";

@Component({
  selector: "carousel",
  templateUrl: "./carousel.component.html",
  styleUrls: ["./carousel.component.scss"],
  animations: [
    trigger('carouselAnimation', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition('* => void', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})

export class CarouselComponent {
  @Input() slides: any;
  @Input() index: number;

  currentSlide = 0;

  constructor() {
  	
  }

  ngOnInit(): void {
    this.currentSlide = this.index;
   }

  onPreviousClick(): void {
    const previous = this.currentSlide - 1;
    this.currentSlide = previous < 0 ? this.slides.length - 1 : previous;
  }

  onNextClick(): void  {
    const next = this.currentSlide + 1;
    this.currentSlide = next === this.slides.length ? 0 : next;
  }
  
}