import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-pya-cards',
  templateUrl: './pya-cards.component.html',
  styles: [`.bg-morado { background: indigo }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PyaCardsComponent implements OnInit {

  @Output() pop = new EventEmitter<any>()
  @Output() exception = new EventEmitter<any>()

  @Input() lu:any
  @Input() item:any
  @Input() alerta:any
  @Input() date:any
  @Input() dataLogs:any
  @Input() asesorLogs:any
  @Input() dataExceptions:any
  @Input() dataPerHour:any
  @Input() popOvers:any
  @Input() rets:any

  constructor() { }

  ngOnInit() {
  }

  printTime( time, format ){

    if(time == null){
      return ''
    }

    let cunTime = moment.tz(time, 'America/Mexico_city').tz('America/Bogota')

    return cunTime.format( format )

  }

  setExcept( asesor, type = 'exception'){

    let result = {
      exp   : null,
      class : null
    }

    let flagAus = false

    // if( !this.dataLogs  ){
    //   result['exp'] = "...a"
    //   result['class'] = ""
    //
    //   if( type == 'exception' ){
    //     return result['exp']
    //   }else{
    //     return result['class']
    //   }
    // }

    let now = moment()
    let sch   = this.dataPerHour

    let info = {
      in    : null,
      out   : null,
      js    : moment.tz(sch[`js`], 'America/Mexico_city').tz("America/Bogota"),
      je    : moment.tz(sch[`je`], 'America/Mexico_city').tz("America/Bogota"),
    }

    if( sch.Ausentismo != null || sch.js == sch.je ){
      flagAus = true
    }

    if( !this.dataLogs ){

      if( !flagAus ){

        if( now > info['js'].clone().add(1, 'minutes') ){
          if( now >= info['js'].clone().add(13, 'minutes') ){
            if( now > info['js'].clone().add(60, 'minutes') ){
              result['exp'] = "FA"
              result['class'] = "bg-danger"

              this.listRts( type, asesor, 'fa' )
            }else{
              result['exp'] = "RT-B"
              result['class'] = "bg-warning"
            }
          }else{
            result['exp'] = "RT-A"
            result['class'] = "bg-warning"
          }
        }else{
          result['exp'] = "..."
          result['class'] = ""
        }

      }else{
        result['exp'] = "..."
        result['class'] = "bg-secondary"
      }

    }else{
      let logs  = this.dataLogs

      info['in'] = moment.tz(logs['j'].in, 'America/Mexico_city').tz("America/Bogota")
      info['out'] = moment.tz(logs['j'].out, 'America/Mexico_city').tz("America/Bogota")

      if( logs['j'].in == null || logs['j'].out == null ){

        if( logs['x1'].in != null || logs['x2'].in != null ){
          result['exp'] = "HX"
          result['class'] = "bg-info"
        }else{

          if( !flagAus ){

            if( now > info['js'].clone().add(1, 'minutes') ){
              if( now >= info['js'].clone().add(13, 'minutes') ){
                if( now > info['js'].clone().add(60, 'minutes') ){
                  result['exp'] = "FA"
                  result['class'] = "bg-danger"

                  this.listRts( type, asesor, 'fa' )
                }else{
                  result['exp'] = "RT-B"
                  result['class'] = "bg-warning"
                }
              }else{
                result['exp'] = "RT-A"
                result['class'] = "bg-warning"
              }
            }else{
              result['exp'] = "..."
              result['class'] = ""
            }

          }else{
            result['exp'] = "..."
            result['class'] = "bg-secondary"
          }

        }

        if( logs['j'].in == null && logs['x1'].in == null && logs['x2'].in == null && this.asesorLogs != null ){
          for( let log of this.asesorLogs ){
            if( moment.tz(log['login'], 'America_Mexico_city').tz('America/Bogota') > moment( `${moment().format('YYYY-MM-DD 06:00:00')}` ) ){
              result['exp'] = "FDH"
              result['class'] = "bg-danger animated flash infinite"
              this.listRts( type, asesor, 'fdh' )
            }
          }
        }

      }else{

        if( !flagAus ){

          if( info.in > info['js'].clone().add(1, 'minutes') ){
            if( info.in >= info['js'].clone().add(13, 'minutes') ){
              result['exp'] = "RT-B"
              result['class'] = "bg-warning animated flash infinite"

              this.listRts( type, asesor, 'b' )

              if( this.checkSA( now, info.je, info.out, type, asesor ) ){
                result['exp'] = "RT-B / SA"
                result['class'] = "bg-danger"
              }
            }else{
              result['exp'] = "RT-A"
              result['class'] = "bg-warning"

              this.listRts( type, asesor, 'a' )

              if( this.checkSA( now, info.je, info.out, type, asesor ) ){
                result['exp'] = "RT-A / SA"
                result['class'] = "bg-danger"
              }
            }
          }else{
            result['exp'] = "OK"
            result['class'] = "bg-success"

            if( this.checkSA( now, info.je, info.out, type, asesor ) ){
              result['exp'] = "OK / SA"
              result['class'] = "bg-danger"
            }
          }



        }else{
          result['exp'] = "L-In"
          result['class'] = "bg-success"
        }

      }
    }

    if( type == 'exception' ){
      return result['exp']
    }else{
      if( this.dataExceptions == null ){
        return result['class']
      }
      switch(this.dataExceptions['Codigo']){
        case 'F':
        case 'FA':
        case 'FJ':
          this.listRts( 'exception', asesor, 'fa' )
          // if( this.containsObject( asesor, 'id', this.rets['sa'] ) ){
          //     delete this.rets['sa'][this.containsObject( asesor, 'id', this.rets['sa'])]
          // }
          break
      }
      return 'bg-morado text-white'
    }

  }

  listRts( type, asesor, rt ){
    if( type == 'exception' ){
      let obj = { id: asesor, name: this.dataPerHour.nombre }
      if( !this.containsObject( asesor, 'id', this.rets[rt] ) ){
          this.rets[rt].push(obj)
      }
    }
  }

  containsObject(val, compare, list) {
    let i;
    for (i = 0; i < list.length; i++) {
        if (list[i][compare] == val) {
            return i;
        }
    }

    return false;
  }

  checkSA( now, je, out, type, asesor ){
    if( now > je && moment.tz(this.lu, 'America/Mexico_city').tz("America/Bogota") > je ){
      if( out < je ){

        if( !(this.dataExceptions && (this.dataExceptions.Codigo == 'F' || this.dataExceptions.Codigo == 'FA' || this.dataExceptions.Codigo == 'FJ' || this.dataExceptions.Codigo == 'SUS')) ){
          this.listRts( type, asesor, 'sa' )
          return true
        }else{
          return false
        }

      }
    }

    return false
  }

  popOv( asesor, open ){

    this.pop.emit({ asesor: asesor, status: open })

  }

  compareDates( a, type, b ){

    let x = moment(a), y = moment(b)

    switch(type){
      case "==":
        if( x == y ){
          return true
        }
        break
      case "!=":
        if( x != y ){
          return true
        }
        break
      case ">":
        if( x > y ){
          return true
        }
        break
      case ">=":
        if( x >= y ){
          return true
        }
        break
      case "<":
        if( x < y ){
          return true
        }
        break
      case "<=":
        if( x <= y ){
          return true
        }
        break
    }

    return false

  }

  pBarVal( asesor, type ){

    if( !this.dataLogs ){
      return 0
    }

    let logs  = this.dataLogs
    let sch   = this.dataPerHour

    if( logs[type].in == null || logs[type].out == null ){
      return 0
    }

    let info = {
      in    : moment(logs[type].in),
      out   : moment(logs[type].out),
      js    : moment(sch[`${type}s`]),
      je    : moment(sch[`${type}e`]),
    }


    return parseInt( info['out'].format( 'x' ) ) - parseInt( info['in'].format( 'x' ) )
  }

  timeProcess( start, end ){

    if( start == null || end == null ){
      return null
    }

    let first = parseInt(moment(start).format('x'))
    let last = parseInt(moment(end).format('x'))

    return last - first

  }

  bgCards( item ){

    if( item.Ausentismo != null && item.showPya != 1 ){
      return 'd-flex justify-content-center align-items-center bg-info text-white'
    }

    if( item.js == null ){
      return 'd-flex justify-content-center align-items-center bg-secondary'
    }

    if( item.js == item.je ){
      return 'd-flex justify-content-center align-items-center bg-info text-white'
    }

  }

  newExcept(){
    this.exception.emit({
      asesor  : this.item.asesor,
      nombre  : this.item.nombre,
      date    : this.date,
      showAll : false
    })
  }

}
