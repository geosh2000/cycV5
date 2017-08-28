import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appButtonSave]'
})
export class ButtonSaveDirective {

  constructor(
              private el:ElementRef
  ) {

      console.log(el)

  }

}
