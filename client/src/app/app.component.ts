import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';

import {MenuItem} from "primeng/api";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {BreadcrumbStorageService} from "./services/breadcrumb.storage.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit,AfterViewChecked{
  url:string|undefined
  breadcrumbs:MenuItem[]
  breadCrumbSub:Subscription|undefined
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

  constructor(private router:Router, private route: ActivatedRoute,
              private breadcrumbStorage:BreadcrumbStorageService,
              private cd: ChangeDetectorRef) {
    this.breadcrumbs = []
    this.breadcrumbStorage.routeChange.subscribe((breadcrumb)=>{
         this.breadcrumbs = breadcrumb
    })
  }

  ngOnInit(): void {
    this.breadcrumbs = [
      { label:'home',routerLink: '/'}
    ]

  }

  changeBreadcrumb(event:any){
    this.breadcrumbs = [{...event.item}]
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges()
  }

  homepage(){
    this.router.navigate([''])
  }
}
