import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-kpis-detail',
  templateUrl: './kpis-detail.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpisDetailComponent implements OnInit {

  @Input() item   :number   = 0

  @Input() mFlag  :boolean  = true
  @Input() naFlag :boolean  = false
  @Input() iLoad  :boolean  = false

  @Input() monto  :number   = 0
  @Input() mLy    :number   = 0
  @Input() mYd    :number   = 0

  @Input() int    :number   = 0
  @Input() iLy    :number   = 0
  @Input() iYd    :number   = 0

  @Input() iUnit  :string   = ''

  constructor() { }

  ngOnInit() {
  }

  compare( a, b, tipo ){

    if( a == 0 ){
      switch(tipo){
        case '%':
          return 0
        case 'class':
          return 'badge-info'
      }
    }

    if( b == 0 ){
      switch(tipo){
        case '%':
          return 100
        case 'class':
          return 'badge-info'
      }
    }

    let result = (a / b * 100) - 100

    switch(tipo){
      case '%':
        return result
      case 'class':
        if( result < -5 ){
          return 'badge-danger'
        }else{
          if( result < 5 ){
            return 'badge-info'
          }else{
            return 'badge-success'
          }
        }
    }

  }

}
