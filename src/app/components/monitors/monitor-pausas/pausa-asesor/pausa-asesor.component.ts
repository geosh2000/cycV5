import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pausa-asesor',
  templateUrl: './pausa-asesor.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PausaAsesorComponent implements OnInit {

  @Input() data:any
  @Input() changer:any
  @Input() tipos:any
  @Input() date:any
  @Input() asesor:any
  @Input() zone:any
  @Input() title:boolean = false

  @Output() timer = new EventEmitter<any>()
  @Output() error = new EventEmitter<any>()
  @Output() changeP = new EventEmitter<any>()
  @Output() sortBy = new EventEmitter<any>()

  loading:Object = {}

  constructor() { }

  ngOnInit() {
  }

  sortByField( field ){
    this.sortBy.emit( field )
  }

  timeToMin( time ){
    return (time/60).toFixed(2)
  }

  setTimer( event ){
    this.timer.emit( event )
  }

  getError( event ){
    this.error.emit( event )
  }

  changePause( event ){
    this.changeP.emit( {asesor: event, date: this.date} )
  }

  alertClass( field, value ){

    let reference = {
      'pnp'   : 1080,
      'comida': 1860,
      'mesa'  : 2760
    }

    if( reference[field] ){
      if( value >= reference[field] ){
        return 'badge-danger'
      }
    }else{
      return 'badge-ligh'
    }

  }

}
