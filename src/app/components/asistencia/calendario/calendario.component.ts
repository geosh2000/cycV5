import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';

import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styles: []
})
export class CalendarioComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'default'

  calendarOptions: Options;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  dataOK:any = []
  dataCal:any
  deps:any
  depSelected:any = 35

  dateStart:any
  dateEnd:any

  constructor(public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastsManager, vcr: ViewContainerRef ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.toastr.setRootViewContainerRef(vcr);

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res.status ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery("#loginModal").modal('show');
          }
        })

    this.depList()

  }

  ngOnInit() {
     this.calendarOptions = {
        editable: false,
        eventLimit: false,
        firstDay: 1,
        fixedWeekCount: false,
        locale: 'es-MX',
        buttonText: {
          today   : 'hoy',
          month   : 'mes',
          list    : 'listado'
        },
        header: {
          left: 'prev,next',
          center: 'title',
          right: 'today month,listMonth'
        },
        eventSources: [this.dataOK],
        eventOrder: 'title'
      };
  }

  viewCal( event, run = false ){

    let dates

    if( !run ){
      dates = {
        inicio: event.view.intervalStart.subtract(7,'days').format('YYYY-MM-DD'),
        fin: event.view.intervalEnd.add(6,'days').format('YYYY-MM-DD')
      }

      this.dateStart = dates['inicio']
      this.dateEnd = dates['fin']
    }else{
      dates = {
        inicio: this.dateStart,
        fin: this.dateEnd
      }
    }

    this.dataOK = []

    this.ucCalendar.fullCalendar( 'refetchEvents' );

    this._api.restfulGet( `${dates.inicio}/${dates.fin}/${this.depSelected}`, 'Asistencia/calendario' )
              .subscribe( res => {

                console.log( res )

                for( let item of res.data['aus'] ){

                  this.ucCalendar.fullCalendar( 'renderEvent', this.eventFormat( item ) );
                  // this.dataOK.push(this.eventFormat( item ))
                }

                let calendarSpace = {}
                let iterateDate = moment(dates.inicio)

                for( let i = moment(dates.inicio); i <= moment(dates.fin); i.add(1,'days') ){
                  calendarSpace[i.format('YYYY-MM-DD')] = {
                    Fecha       : i.format('YYYY-MM-DD'),
                    abierto     : 0,
                    asignados   : 0,
                    disponibles : 0
                  }
                }

                for( let item of res.data['q'] ){
                  calendarSpace[item.Fecha] = item
                }

                for( let dateFlag in calendarSpace ){
                  if( parseInt( calendarSpace[dateFlag]['disponibles'] ) > 0 ){
                    for (let i = 0; i < parseInt(calendarSpace[dateFlag]['disponibles']); i++) {
                        this.ucCalendar.fullCalendar( 'renderEvent', this.eventAvail( calendarSpace[dateFlag] ) );
                        // this.dataOK.push(this.eventFormat( calendarSpace[dateFlag] ))
                    }
                  }else{
                    if( parseInt( calendarSpace[dateFlag]['espacios'] ) == 0 || calendarSpace[dateFlag]['espacios'] == null ){
                      this.ucCalendar.fullCalendar( 'renderEvent', this.eventAvail( calendarSpace[dateFlag], 'closed' ) );
                    }
                  }

                }

                this.ucCalendar.fullCalendar( 'rerenderEvents' );

                // console.log(this.ucCalendar)

              }, err => {
                console.log("ERROR", err)

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })

    console.log( dates )


  }

  eventFormat( data ){

    let className, textColor

    switch( data['Code'] ){
      case 'VAC':
        className = 'bg-info'
        textColor = 'white'
        break
      case 'PC':
        className = 'bg-warning'
        textColor = 'black'
        break
      case 'PS':
        className = 'bg-primary'
        textColor = 'white'
        break
      case 'INC':
      case 'INC_EN':
      case 'INC_MT':
      case 'INC_AC':
      case 'INC_RT':
        className = 'bg-danger'
        textColor = 'white'
        break
      default:
        className = 'bg-secondary'
        textColor = 'white'
        break
    }

    let event = {
      id        : data['id'],
      title     : `${data['Code']} - ${data['nombre']}`,
      allDay    : true,
      start     : moment(data['Fecha']),
      className : className,
      textColor : textColor
    }

    return event
  }

  eventAvail( data, type = 'avail' ){

    let className, textColor, title

    switch(type){
      case 'avail':
        className = 'bg-success'
        textColor = 'white'
        title     = 'Disponible'
        break
      case 'closed':
        className = 'bg-dark'
        textColor = 'white'
        title     = 'Cerrado'
        break
    }

    let event = {
      id        : `avail_${data['Fecha']}`,
      title     : title,
      allDay    : true,
      start     : moment(data['Fecha']),
      end       : moment(`${data['Fecha']} 00:00:00`).add(1, 'days'),
      className : className,
      textColor : textColor
    }

    return event
  }

  depList(){
    this._api.restfulGet( '','Headcount/departamentos' )
              .subscribe( res => {

                this.deps = res.data

                console.log( res )

              }, err => {
                console.log("ERROR", err)

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

}
