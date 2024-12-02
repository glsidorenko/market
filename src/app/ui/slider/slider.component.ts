import { Component, computed, OnDestroy, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { SlideItem } from '../../types';
import { CommonModule } from '@angular/common';
import { sliderInfo } from '../../sliderInfo';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent implements OnInit, OnDestroy {
  slides: Signal<SlideItem[]> = signal(sliderInfo);
  currentSlideIndex: WritableSignal<number> = signal(0);
  totalSlides = computed(() => {
    const slides = this.slides();
    return slides.length - 1;
  });
  timeoutId?: NodeJS.Timeout; 


  ngOnInit(): void {
    this.resetTimer();
  }
  
  ngOnDestroy() {
    if(this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  resetTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if(this.isLastSlide()) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      console.log('timeout')
      this.nextSlide();
    }, 5000);
  }

  getSlideUrl() {
    return `url('${this.slides()[this.currentSlideIndex()].url}')`;
  }

  isFirstSlide = computed(() => {
    const currentSlide = this.currentSlideIndex();

    return currentSlide === 0;
  })

  isLastSlide = computed(() => {
    const currentSlide = this.currentSlideIndex();
    const totalSlides = this.totalSlides();

    return currentSlide === totalSlides;
  })

  nextSlide() {
    const isLastSlide = this.isLastSlide();

    if(isLastSlide) {
      return 
    }

    this.resetTimer();
    this.currentSlideIndex.update((value) => value + 1);
  }

  previousSlide() {
    const isFirstSlide = this.isFirstSlide();

    if(isFirstSlide) {
      return
    }

    this.resetTimer();
    this.currentSlideIndex.update(value => value - 1);
  }

  setCurrentSlideIndex(slideIndex: number) {
    this.resetTimer();
    this.currentSlideIndex.set(slideIndex);
  }
}


