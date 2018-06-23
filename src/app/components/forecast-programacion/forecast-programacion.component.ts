import { Component, OnInit } from '@angular/core';
import { AsesoresService } from '../../services/service.index';
declare var jQuery:any;

@Component({
  selector: 'app-forecast-programacion',
  templateUrl: './forecast-programacion.component.html'
})
export class ForecastProgramacionComponent implements OnInit {

  hours = [];
  horarios = []

  asesores=[]

  readyFlag:boolean = false
  loadInfo:string = "Cargando Asesores"

  //RenderOptions
  render:boolean = true;





  constructor( private _asesores:AsesoresService ) {
    console.log(this.asesores)

    for(let i=0; i<=47; i++){
      this.hours.push(i)
    }

    this.downloadAsesoresData()

    this.createHorarios( 4 )
    this.createHorarios( 6 )
    this.createHorarios( 8 )
    this.createHorarios( 10 )
  }

  ngOnInit() {
  }

  downloadAsesoresData(){
    console.log("Getting Asesores Data...")
    this._asesores.progHorariosGetAsesores()
      .subscribe( res => {

          this.loadInfo="Construyendo Horarios..."

          for(let key in res){
            this.asesores.push({ name: res[key].name, id: res[key].id, comida: res[key].comida, jornada: res[key].jornada, ausentismo: res[key].ausentismo, horarios: [], comidas: [], extra1: [], extra2: [] })
          }

          this.readyFlag = true;
      })

  }

  createHorarios( jornada:number ){
    let horarios = [];

    for( let i=0; i < 48; i++ ){
      let inicio = i
      let fin = i + (jornada * 2);

      // Ajuste de jornadas legales para 8 horas
      if(jornada == 8){
        if(fin >= 48){
          fin = fin - 2
        }else if(fin >= 42){
          fin = fin - 1
        }
      }

      if(fin < fin - 1){
        fin = fin + 48
      }else{
        fin = fin
      }

      this.horarios.push({ value: `j${ jornada }_c${ 1 }_${ i }`, id: i, j: jornada, sc: 1, hi: inicio, hf: fin, name: `(${jornada}) ${ this.formatHorario( inicio, fin ) }` })
    }

    //Sin Comida
    if(jornada>=8){
      for( let i=0; i < 48; i++ ){
        let inicio = i
        let fin = i + (jornada * 2);

        // Ajuste de jornadas legales para 8 horas
        if(jornada == 8){
          if(fin >= 48){
            fin = fin - 2
          }else if(fin >= 42){
            fin = fin - 1
          }
        }

        if(fin < fin - 1){
          fin = fin + 48
        }else{
          fin = fin
        }

        fin = fin - 1

        this.horarios.push({ value: `j${ jornada }_c${ 0 }_${ i }`, id: i, j: jornada, sc: 0, hi: inicio, hf: fin, name: `(sc${jornada}) ${ this.formatHorario( inicio, fin ) }` })
      }
    }


  }

  formatHorario( inicio, fin ){
    let finale;

    if( fin >= 48 ){
      finale = fin - 48
    }else{
      finale = fin
    }

    let horaStart = inicio/2
    let horaFin = finale/2

    let horaStartText:string
    let horaFinText:string

    if( inicio % 2 != 0 ){
      if(horaStart<10){
        horaStartText = `0${ Math.floor(inicio/2) }:30`
      }else{
        horaStartText = `${ Math.floor(inicio/2) }:30`
      }
    }else{
      if(horaStart<10){
        horaStartText = `0${ Math.floor(inicio/2) }:00`
      }else{
        horaStartText = `${ Math.floor(inicio/2) }:00`
      }
    }

    if( finale % 2 != 0 ){
      if(horaFin<10){
        horaFinText = `0${ Math.floor(finale/2) }:30`
      }else{
        horaFinText = `${ Math.floor(finale/2) }:30`
      }
    }else{
      if(horaFin<10){
        horaFinText = `0${ Math.floor(finale/2) }:00`
      }else{
        horaFinText = `${ Math.floor(finale/2) }:00`
      }
    }

      return `${ horaStartText } - ${ horaFinText }`

  }

  test( asesor, h ){

    let j = this.asesores[ asesor ].jornada
    let c = this.asesores[ asesor ].comida

    jQuery(`.l${asesor}_j${ j }_c${ c }_${ h }`).prop('selected',true)

    this.horarioChange( this.asesores[ asesor ].horarios[jQuery(`.l${asesor}_j${ j }_c${ c }_${ h }`).attr("horarioIndex")], asesor )
    console.log(this.asesores[ asesor ].horarios[jQuery(`.l${asesor}_j${ j }_c${ c }_${ h }`).attr("horarioIndex")])
  }

  horarioChange( data, line ){
    console.log( data )
    console.log(data.val)
    //Init
    jQuery(`#selComida_${line}`).removeClass('comida')

    //Generate Comida & Extra Options
      let comidaFlag:boolean = true
      //Comidas
      //Validate if asesor has comida
      if(this.asesores[line]['comida'] != 1){ comidaFlag = false }
      if(this.asesores[line]['jornada'] < 8){ comidaFlag = false }
      if(data.j < 8){ comidaFlag = false }
      if(data.sc == 0){ comidaFlag = false }

      let comidas = [];
      if(comidaFlag){
        for( let i = data.hi + 6; i <= data.hi + 10; i++ ){
          comidas.push({ id: i, hi: i, hf: (i + 1), name: `${ this.formatHorario( i, i+1 ) }` })
        }
      }else{
        comidas.push({ id: "", hi: "", hf: "", name: `Sin Comida` })
        jQuery(`#selComida_${line}`).addClass('comida')
      }
      //Inject to array
      this.asesores[line]['comidas']=comidas

      //Extra
      let extra = [];
      for( let i = 4; i >= 1; i-- ){
        extra.push({ id: (data.hi-i), hi: (data.hi-i), hf: data.hi, name: `${ this.formatHorario( data.hi-i, data.hi ) }` })
      }
      for( let i = 1; i <= 4; i++ ){
        extra.push({ id: (data.hf), hi: (data.hf), hf: (data.hf+i), name: `${ this.formatHorario( data.hf, data.hf+i ) }` })
      }

      //Inject to array
      this.asesores[line]['extra1']=extra

      console.log(this.asesores)

    //Render Functions
    for( let i=0; i<=47; i++ ){
      let total = jQuery(`.total_${ i }`);
      let hourVal = jQuery(`.time_${i}_line_${line}`)
      let flag

      if(i >= data.hi && i < data.hf){
        flag=true;
      }else{
        flag=false
      }

      if(flag){
        if(hourVal.val() == 0){
          total.val(parseInt(total.val()) + 1)
          hourVal.val(1)
          hourVal.addClass('jornada')
          hourVal.removeClass('comida').removeClass('extra1').removeClass('extra2')
        }
      }else{
        hourVal.removeClass('jornada')
        hourVal.removeClass('comida').removeClass('extra1').removeClass('extra2')
        if(hourVal.val() == 1){
          total.val(parseInt(total.val()) - 1)
          hourVal.val(0)
        }
      }
    }
  }

  extraChange( data, line, xN ){
    console.log( data )
    for( let i=0; i<=47; i++ ){
      let total = jQuery(`.total_${ i }`);
      let hourVal = jQuery(`.time_${i}_line_${line}`)
      let flag

      if(i >= data.hi && i < data.hf){
        flag=true;
      }else{
        flag=false
      }

      if(flag){
        if(hourVal.val() == 0){
          total.val(parseInt(total.val()) + 1)
          hourVal.val(1)
          hourVal.addClass(`extra${ xN }`)
        }
      }else{
        hourVal.removeClass(`extra${ xN }`)
        if(!hourVal.hasClass('jornada')){
          if(hourVal.val() == 1){
            total.val(parseInt(total.val()) - 1)
            hourVal.val(0)
          }
        }
      }
    }
  }

  comidaChange( data, line ){
    console.log( data )
    for( let i=0; i<=47; i++ ){
      let total = jQuery(`.total_${ i }`);
      let hourVal = jQuery(`.time_${i}_line_${line}`)
      let flag

      if(i >= data.hi && i < data.hf){
        flag=true;
      }else{
        flag=false
      }

      if(flag){
        if(hourVal.val() == 1){
          hourVal.val(0)
          total.val(parseInt(total.val()) - 1)
        }
        hourVal.addClass('comida')
      }else{

        if((hourVal.hasClass('jornada'))
            || hourVal.hasClass('extra1')
            || hourVal.hasClass('extra2')){

          if(hourVal.val() == 0){
            total.val(parseInt(total.val()) + 1)
            hourVal.val(1)
          }

        }else{
          if(hourVal.val() == 1){
            hourVal.val(0)
            total.val(parseInt(total.val()) - 1)
          }
        }

        hourVal.removeClass('comida')

      }
    }
  }

}
