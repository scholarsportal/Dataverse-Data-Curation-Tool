import { Component, effect, ElementRef, inject, input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var jQuery: any; // Declare jQuery
declare var $: any; // Declare jQuery

@Component({
  selector: 'dct-cross-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cross-table.component.html',
  styleUrl: './cross-table.component.css'
})
export class CrossTableComponent {
  @ViewChild('output') outputElement?: ElementRef;
  data = input.required<{ [variableLabel: string]: string }[]>();
  rows = input.required<string[]>();
  cols = input.required<string[]>();
  element: ElementRef = inject(ElementRef);

  constructor() {
    effect(() => {
      if (this.data()) {
        this.createTable(this.data(), this.rows(), this.cols());
      }
    });
  }

  createTable(data: { [id: string]: string }[], rows: string[], cols: string[]) {
    if (!this.element?.nativeElement?.children) {
      console.log('Cannot build element');
      return;
    }
    const container = this.element.nativeElement;
    const inst = jQuery(container);
    const targetElement = inst.find('#output');
    if (!targetElement) {
      console.log('No element found');
      return;
    }
    while (targetElement.firstChild) {
      targetElement.removeChild(targetElement.firstChild);
    }

    targetElement.pivotUI(
      data,
      {
        rows: rows,
        cols: cols,
        aggregatorName: 'Count as Fraction of Total'
      },
      true
    );
  }
}