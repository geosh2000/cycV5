import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hc-pdv',
  templateUrl: './hc-pdv.component.html',
  styles: []
})
export class HcPdvComponent implements OnInit {

  items = {
    a: [
        {id: 1, name: 'Apple',    type: 'fruit'},
        {id: 2, name: 'Carrot',   type: 'vegetable'},
        {id: 3, name: 'Orange',   type: 'fruit'}
      ],
    b: [],
    c: []
  };

  itemsIndex: Object = {}
  allItems:any= []
  filterText:any = ''


    constructor() { }

    ngOnInit() {
      this.indexItems()
    }

    indexItems(){
      let allItems = []
      // tslint:disable-next-line:forin
      for( let ind in this.items ){
        for( let item of this.items[ind] ){
          this.itemsIndex[item['id']] = ind
          allItems.push(item)
        }
      }

      this.allItems=allItems
    }

    onItemDrop(e: any, target) {

      let origin = this.itemsIndex[e.dragData['id']]

      if( this.items[target].indexOf(e.dragData) == -1 ){
        let index = this.items[origin].indexOf( e.dragData )
        this.items[origin].splice(index,1)

        // add to target
        this.items[target].push(e.dragData);
        this.itemsIndex[e.dragData['id']] = target
      }

    }

    isFilter( name ){
      let text = this.cleanSt(name)

      if(this.filterText.trim() == ''){
        return true
      }else{
        let words = this.filterText.split()
        for( let word of words ){
          if( name.toLowerCase().indexOf( this.cleanSt(word) ) >= 0 ){
            return true
          }
        }
      }

      return false
    }

    cleanSt(cadena){
      // Definimos los caracteres que queremos eliminar
      let specialChars = '!@#$^&%*()+=-[]\/{}|:<>?,.';

      // Los eliminamos todos
      for (let i = 0; i < specialChars.length; i++) {
          cadena= cadena.replace(new RegExp('\\' + specialChars[i], 'gi'), '');
      }

      // Lo queremos devolver limpio en minusculas
      cadena = cadena.toLowerCase();

      // Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
      cadena = cadena.replace(/á/gi,'a');
      cadena = cadena.replace(/é/gi,'e');
      cadena = cadena.replace(/í/gi,'i');
      cadena = cadena.replace(/ó/gi,'o');
      cadena = cadena.replace(/ú/gi,'u');
      cadena = cadena.replace(/ñ/gi,'n');
      return cadena;
   }
}
