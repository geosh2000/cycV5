import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CompleterService, CompleterData } from 'ng2-completer';

import * as Globals from '../../globals';

@Component({
  selector: 'app-autocomplete-affiliate',
  templateUrl: './autocomplete-affiliate.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AutocompleteAffiliateComponent implements OnChanges {

  @Input() currentUser:any
  @Input() field:string = 'displayName'
  @Input() placeholder:string = 'Buscar Afiliado...'
  @Input() iconPosition:string = 'right'

  @Output() result = new EventEmitter<any>()

  // Filters
  @Input() active:number  = 2

  searchStrName:string;
  resultID:string;
  dataServiceName:CompleterData;

  constructor(private completerService:CompleterService) {
    this.build()
  }


   ngOnChanges(changes: SimpleChanges){
     this.build()
   }

  build(){
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    let remote = `${ Globals.APISERV }/api/${ Globals.APIFOLDER }/index.php/Completer/searchAffiliate/${this.field}/${this.active}/`

    this.dataServiceName = this.completerService
                    .remote(remote, null, 'description')
                    .descriptionField( 'shortName' )

  }

  onSelected(event){
    if(event){
      this.result.emit(event.originalObject)
    }
  }

}
