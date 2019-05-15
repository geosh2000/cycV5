import { Component, OnInit, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService } from '../../services/service.index';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-calculadora',
  templateUrl: './calculadora.component.html',
  styles: [`
    .msiCard{
      width: 300px;
    }

    .imgHeadAmex {
      background-image: url('/assets/Bancos/Amex.png');
      background-repeat: no-repeat;
      background-size: contain;
    }

    .imgHeadBanamex {
      background-image: url('/assets/Bancos/Banamex.jpg');
      background-repeat: no-repeat;
      background-size: contain;
    }

    .imgHeadBBVA {
      background-image: url('/assets/Bancos/Bancomer.png');
      background-repeat: no-repeat;
      background-size: contain;
    }

    .imgHeadBanorte {
      background-image: url('/assets/Bancos/Banorte.png');
      background-repeat: no-repeat;
      background-size: contain;
    }

    .imgHeadHSBC {
      background-image: url('/assets/Bancos/HSBC.png');
      background-repeat: no-repeat;
      background-size: contain;
    }

    .imgHeadSantander {
      background-image: url('/assets/Bancos/Santander.png');
      background-repeat: no-repeat;
      background-size: contain;
    }

    .imgHeadScotiabank {
      background-image: url('/assets/Bancos/Scotiabank.jpg');
      background-repeat: no-repeat;
      background-size: contain;
    }
  `]
})
export class CalculadoraComponent implements OnInit {

  monto:any = 0
  tipo:any

  dataConsult:Object = {
    monto: 0,
    tipo: 0,
  }

  tipoProd:any = [
    'N/A',
    'Hotel',
    'Paquete',
    'Vuelo',
    'Crucero',
    'Otros'
  ]

  bbvBon:any=[
    {min: 15000, max: 24999.99, b:1000},
    {min: 25000, max: 34999.99, b:2000},
    {min: 35000, max: 44999.99, b:3500},
    {min: 45000, max: 59999.99, b:4500},
    {min: 60000, max: 10000000000.99, b:7200},
  ]

  loading:boolean = false

  result:any = []

  rules:any = []

  constructor(private titleService: Title, private _api:ApiService,public toastr: ToastrService) {

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Calculadora Outlet');
  }

  getPromos(){
    this.loading = true
    this.rules=[]

    this._api.restfulGet( '', `Lists/ovvPromos` )
            .subscribe( res => {

              this.rules = res['data']
              this.loading = false
              this.runCalc()

            }, err => {
              console.log('ERROR', err)
              this.loading = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  runCalc(){
    let m:number = parseFloat(this.monto), t:number = parseInt(this.tipo)
    let r:Object = {}

    this.dataConsult['monto'] = m
    this.dataConsult['tipo'] = t

    for( let p of this.rules ){
      let rw
      if( m >= p['min'] ){
        for( let pr of p['promo'] ){
          rw = pr
          rw['monto'] = m
          rw['tipo'] = t

          if( r[rw['banco']] ){
            r[rw['banco']].push(rw)
          }else{
            r[rw['banco']] = [rw]
          }
        }
      }
    }

    this.result = r
  }

  calc(){
    this.getPromos()
  }

  getBbvaBon( m ){
    let r = 0
    for( let b of this.bbvBon ){
      if( m > b['min'] ){
        r = b['b']
      }
    }
    return r
  }

  inProd( p, t ){
    if( p.indexOf(t) > -1 ){
      return true
    }

    return false
  }



}

