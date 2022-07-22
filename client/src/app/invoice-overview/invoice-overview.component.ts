import { Component, OnInit } from '@angular/core';
import {BreadcrumbStorageService} from "../services/breadcrumb.storage.service";

@Component({
  selector: 'app-invoice-overview',
  templateUrl: './invoice-overview.component.html',
  styleUrls: ['./invoice-overview.component.css']
})
export class InvoiceOverviewComponent implements OnInit {

  constructor(private breadcrumbStorage:BreadcrumbStorageService) { }

  ngOnInit(): void {
    this.breadcrumbStorage.routeChange.emit([{label:'Facturen'}])
  }

}
