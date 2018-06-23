import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

declare var jQuery:any;

import { ApiService } from '../../services/service.index';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styles: []
})
export class UploadFilesComponent implements OnInit {

  @Output() loadResult = new EventEmitter<any>()

  title:string
  invalidForm:boolean = true
  loading:boolean = false

  previewSrc:boolean = false
  name:any

  imageForm: FormGroup
  imageFileUp: File
  @ViewChild('imageFile') image_File

  constructor(
                private fb:FormBuilder,
                private _api:ApiService) {

    this.imageForm = new FormGroup({
      fname:              new FormControl('', [ Validators.required,  ] ),
      dir:                new FormControl('', [ Validators.required,  ] ),
      imageFile:          new FormControl('', [ Validators.required,  ] ),
      ftype:              new FormControl('.csv', [ Validators.required,  ] )
    })



  }

  ngOnInit() {
  }

  build( title, dir, name ){

    this.name = name
    
    jQuery("#formUploadImageComponent").modal('show')
    this.title = title
    this.imageForm.controls['fname'].setValue(name)
    this.imageForm.controls['dir'].setValue(dir)
    jQuery("#formUploadImage").val('')
    jQuery("#formUploadImagePreview").attr('src','')
    this.previewSrc = false
  }

  submit(){
    this.loading = true
    let Image = this.image_File.nativeElement

    if( Image.files && Image.files[0] ){
      this.imageFileUp = Image.files[0]
    }

    let ImageFile: File = this.imageFileUp

    let formData: FormData = new FormData()
    formData.append( 'fname', this.imageForm.controls['fname'].value)
    formData.append( 'dir',   this.imageForm.controls['dir'].value)
    formData.append( 'ftype', this.imageForm.controls['ftype'].value)
    formData.append( 'image', ImageFile, ImageFile.name)

    this._api.restfulImgPost( formData, 'UploadImage/uploadImage' )
            .subscribe( res => {

                jQuery("#formUploadImageComponent").modal('hide')

                this.loading = false
                this.loadResult.emit( {status: true, name: this.name, fname: ImageFile.name} )
            }, err => {
                console.log("ERROR", err)
                this.loading = false
                this.loadResult.emit( {status: false, name: this.name, msg: err} )
              })

  }

  setImagePath( event ){
    if( event.target.value != null ){
      this.invalidForm = false
    }

    this.readImg( this.image_File.nativeElement )
  }

  readImg( file ){

    if(file.files && file.files[0]){
      console.log("Imagen cargada")

      let reader = new FileReader();
      reader.onload = function(e){
        jQuery("#formUploadImagePreview").attr('src', e.target['result'])
      }
      this.previewSrc = true
      reader.readAsDataURL(file.files[0])
    }else{
      this.previewSrc = false
      console.error("No existe ninguna imagen cargada")
    }
  }

  imageExists( dir, fname, ext ){
    this._api.restfulGet( `${ dir }/${ fname }/jpg`, 'UploadImage/fileExists')
            .subscribe( res => {
              return res
            })
  }

  deleteFile( dir, fname, ext ){
    this._api.restfulDelete( `${ dir }/${ fname }/jpg`, 'UploadImage/imageDel')
            .subscribe( res => {
              return res
            })
  }

}
