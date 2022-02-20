import {Component, OnInit} from '@angular/core';

import {MenuItem} from "primeng/api";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit{
  display = true
  items:MenuItem[] = [
    {
      label: 'Producten',routerLink: 'producten'
    }
    ,
    {
      label: 'Offertes',routerLink: 'offertes'
    },
    {
      label: 'Facturen',routerLink: 'facturen'
    },
    {
      label: 'Aankopen',routerLink: 'aankopen'
    },
    {
      label: 'Leveringen',routerLink: 'leveringen'
    },
    {
      label: 'Financieel overzicht',routerLink: 'financieel'
    }
  ];

  constructor(private router:Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {

  }

  homepage(){
    this.router.navigate([''])
  }
}
