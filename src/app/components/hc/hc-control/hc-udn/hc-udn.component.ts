import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-hc-udn',
  templateUrl: './hc-udn.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HcUdnComponent implements OnInit {

  @Input() data:any []

  constructor() { }

  ngOnInit() {
  }

}
