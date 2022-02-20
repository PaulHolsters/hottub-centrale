import { Component, OnInit } from '@angular/core';
import {DataService} from "../../services/data.service";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {QuotationGetModel} from "../../models/quotation/quotation.get.model";
import {DomSanitizer, SafeHtml, SafeUrl, SafeValue} from '@angular/platform-browser';

@Component({
  selector: 'app-quotation-overview',
  templateUrl: './quotation-overview.component.html',
  styleUrls: ['./quotation-overview.component.css']
})
export class QuotationOverviewComponent implements OnInit {
  quotations:QuotationGetModel[]
  activatedActionsMenu:string|undefined
  selectedFileBLOB:any|undefined

  items = [
    {label: 'Bekijken', icon: 'pi pi-fw pi-eye'
    },
    {label: 'Nieuwe versie', icon: 'pi pi-fw pi-pencil'},
    {label: 'Toon pdf', icon: 'pi pi-fw pi-download' },
    {label: 'Versturen', icon: 'pi pi-fw pi-trash'},
  ];
  constructor(private dataService:DataService,private router:Router,private messageService:MessageService,private sanitizer: DomSanitizer) {
    this.quotations = []
    this.dataService.getQuotations().subscribe(res=>{
      this.quotations = res
    })
  }

  ngOnInit(): void {
  }

  isMenu(id:string):boolean{
    return this.activatedActionsMenu === id;
  }

  isIcon(id:string):boolean{
    return this.activatedActionsMenu !== id;
  }

  showMenu(id:string){
    this.activatedActionsMenu = id

  }

  hideMenu(id:string){
    this.activatedActionsMenu = undefined
  }

  showPdf(blob:Blob){
    const url = window.URL.createObjectURL(blob)
    this.selectedFileBLOB = this.sanitizer.bypassSecurityTrustUrl(url);
    console.log(this.selectedFileBLOB.changingThisBreaksApplicationSecurity)
    window.open(this.selectedFileBLOB.changingThisBreaksApplicationSecurity);
  }

  totalPrice(id:string):number|undefined{
    const quot = this.quotations.find(quot=>{return quot._id===id})
    if(quot){
      const productPrice = quot.quotationValues.productPrice
      const optionsPrice = quot.quotationValues.optionValues.map(val=>{
        return val.price||0
      }).reduce((x,y)=>(x+y))
      const quotSpecsPrice = quot.quotationValues.quotationSpecificationValues.map(quotspec=>{
        return quotspec.price||0
      }).reduce((x,y)=>(x+y))
      const subTotal = productPrice+optionsPrice+quotSpecsPrice
      return subTotal-(quot.discount*subTotal/100)
    }
    return undefined
  }

  handleClick(event:any,id:string){
    switch (event.target.innerText){
      case 'Toon pdf':
        this.dataService.downloadQuotation(id).subscribe(res=>{
          this.showPdf(res)
        })
        break
      case 'Bekijken':
        this.router.navigate(['offertes/details/'+id])
        break
      case 'Versturen':
        this.dataService.sendQuotation(id).subscribe(res=>{

        })
        break
      case 'Nieuwe versie':
        this.router.navigate(['offertes','nieuwe-versie',id])
        break
    }

  }

}
