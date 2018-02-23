import { Component, ElementRef, NgZone, Host, Directive, Input } from '@angular/core';


@Component({
  selector: 'tablesorter',
  template: `<table id='tablesorter'></table>`
})
export class TablesorterComponent {

  constructor(private el: ElementRef, private zone: NgZone) {
  }

}
