import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-hc-puestos',
  templateUrl: './hc-puestos.component.html',
  styles: []
})
export class HcPuestosComponent implements OnInit {

  @Input() data:any=[]
  @Input() index:any='a'

  constructor() { }

  ngOnInit() {
  }

}
