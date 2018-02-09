import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CompleterService, CompleterData } from 'ng2-completer';

import * as Globals from '../../globals';

@Component({
  selector: 'app-search-asesor',
  templateUrl: './search-asesor.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchAsesorComponent implements OnInit {

  @Input() currentUser:any
  @Input() field:string = 'Nombre'
  @Input() placeholder:string = 'Buscar Asesor...'
  @Input() iconPosition:string = 'right'


  @Output() result = new EventEmitter<any>()

  // Filters
  @Input() active:number  = 2
  @Input() udn:any
  @Input() area:any
  @Input() dep:any
  @Input() puesto:any

  credentials:Object = {
    viewAll:  0,
    udn:      0,
    area:     0,
    dep:      0,
    puesto:   0
  }

  protected searchStrName:string;
  protected resultID:string;
  protected dataServiceName:CompleterData;

  constructor(private completerService:CompleterService) {
    this.build()
  }


  ngOnInit() {
  }

   ngOnChanges(changes: SimpleChanges){
     this.build()
   }

  filterBuild( cur, cred, input ){
    if( input && !Array.isArray(input) ){
      if( input == 'self' ){
        if( cur['credentials']['view_all_agents'] == 10 ){
          this.credentials[ cred ] = 0
        }else{
          this.credentials[ cred ] = cur['hcInfo'][`hc_${ cred }`]
        }
      }else{
        this.credentials[ cred ] = 0
      }
    }else{
      if( input ){
        if( Array.isArray(input) ){
          this.credentials[ cred ] = input.join().replace(",","-")
        }else{
          this.credentials[ cred ] = input
        }
      }else{
        this.credentials[ cred ] = 0
      }
    }


  }

  build(){
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if( this.currentUser != null ){

      this.filterBuild( this.currentUser, 'udn'    , this.udn    )
      this.filterBuild( this.currentUser, 'area'   , this.area   )
      this.filterBuild( this.currentUser, 'dep'    , this.dep    )
      this.filterBuild( this.currentUser, 'puesto' , this.puesto )

    }


    this.dataServiceName = this.completerService
                    .remote(`${ Globals.APISERV }/api/${ Globals.APIFOLDER }/index.php/Completer/searchData/${this.credentials['viewAll']}/${this.credentials['udn']}/${this.credentials['area']}/${this.credentials['dep']}/${this.credentials['puesto']}/${this.field}/${this.active}/`, null, 'Nombre')
                    .descriptionField( 'dep' )

  }

  onSelected(event){
    this.result.emit(event.originalObject)
  }

}
