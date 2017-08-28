import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  viewToken(){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log(currentUser);
  }

}
