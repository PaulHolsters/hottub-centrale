import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MessageService} from "primeng/api";
import {Router} from "@angular/router";
import {DataService} from "../services/data.service";
import {QuotationStorageService} from "../services/quotation.storage.service";

@Component({
  selector: 'app-quotations',
  templateUrl: './quotations.component.html',
  styleUrls: ['./quotations.component.css']
})
export class QuotationsComponent implements OnInit,AfterViewChecked {

  constructor(private messageService:MessageService,
              private router: Router,private dataService:DataService,private storage:QuotationStorageService,
              private cd: ChangeDetectorRef) {

  }

  ngOnInit(): void {

  }

  quotations(){
    this.router.navigate(['/offertes/overzicht'])
  }

  newQuotation(){
    this.router.navigate(['/offertes/nieuw'])
  }

  ngAfterViewChecked(): void {
    if(this.storage.hasMessage()){
      this.messageService.add({key:'successMsg', severity:'success', summary: this.storage.getMessage()})
      this.storage.resetMessage()
      this.cd.detectChanges()
    }
  }
}
