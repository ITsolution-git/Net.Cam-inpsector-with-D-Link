import { Component } from '@angular/core';
import { Router } from '@angular/router'


@Component({
  selector: 'header-component',
  inputs: [],
  styleUrls: [ './header.component.css' ],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  constructor(public parentRouter : Router) {}
}
