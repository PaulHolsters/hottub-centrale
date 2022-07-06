import {AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';

import {MenuItem} from "primeng/api";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {BreadcrumbStorageService} from "./services/breadcrumb.storage.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit, AfterViewChecked, OnDestroy {
    url: string | undefined
    breadcrumbs: MenuItem[]
    breadCrumbSub: Subscription | undefined
    home: MenuItem
    items: MenuItem[] = [
        {
            label: 'Producten', routerLink: 'producten'
        }
        ,
        {
            label: 'Offertes', routerLink: 'offertes'
        },
        {
            label: 'Facturen', routerLink: 'facturen'
        },
        {
            label: 'Aankopen', routerLink: 'aankopen'
        },
        {
            label: 'Leveringen', routerLink: 'leveringen'
        },
        {
            label: 'Financieel overzicht', routerLink: 'financieel'
        }
    ];

    constructor(private router: Router, private route: ActivatedRoute,
                private breadcrumbStorage: BreadcrumbStorageService,
                private cd: ChangeDetectorRef) {

        this.breadcrumbStorage.routeChange.subscribe((breadcrumb) => {
            this.breadcrumbs = breadcrumb
        })
        this.home = {icon: 'pi pi-home', routerLink: '/'};
        this.breadcrumbs = [this.home]
    }

    ngOnInit(): void {
        this.breadcrumbs = [
        ]
    }

    ngOnDestroy() {
        this.breadCrumbSub?.unsubscribe()
    }

    changeBreadcrumb(event: any) {
        switch (event.item.icon) {
            case 'pi pi-home':
                this.breadcrumbs = [

                ]
                break
            default:
        }
    }

    ngAfterViewChecked(): void {
        this.cd.detectChanges()
    }

    homepage() {
        this.router.navigate([''])
    }
}
