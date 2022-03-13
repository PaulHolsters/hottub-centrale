
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
  latestVersionQuotations:QuotationGetModel[]
  activatedActionsMenu:string|undefined
  selectedFileBLOB:any|undefined
  displayDialog:boolean
  idOfStatusChanged:string|undefined
  selectedStatus:string|undefined
  items = [
    {label: 'Bekijken', icon: 'pi pi-fw pi-eye'
    },
    {label: 'Nieuwe versie', icon: 'pi pi-fw pi-pencil'},
    {label: 'Toon pdf', icon: 'pi pi-fw pi-download' },
    {label: 'Versturen', icon: 'pi pi-fw pi-trash'},
    {label: 'Statuswijziging',icon: 'pi pi-info-circle'}
  ];
  constructor(private dataService:DataService,private router:Router,private messageService:MessageService,private sanitizer: DomSanitizer) {
    this.displayDialog = false
    this.quotations = []
    this.latestVersionQuotations = []
    this.dataService.getQuotations().subscribe(res=>{
      this.quotations = res
      this.latestVersionQuotations = this.quotations.filter(quotGet=>{
        const filteredQuotGets = this.quotations.filter(quotGetGroupId=>{
          return quotGetGroupId.groupId === quotGet.groupId

        })
        return filteredQuotGets.every(quot => quot.version <= quotGet.version)
      })
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

  hideMenu(){
    this.activatedActionsMenu = undefined
  }

  showPdf(blob:Blob){
    const url = window.URL.createObjectURL(blob)
    this.selectedFileBLOB = this.sanitizer.bypassSecurityTrustUrl(url);
    window.open(this.selectedFileBLOB.changingThisBreaksApplicationSecurity);
  }

  totalPrice(id:string):number|undefined{
    const quot = this.latestVersionQuotations.find(quot=>{return quot._id===id})
    if(quot){
      const productPrice = quot.quotationValues.productPrice
      const options = quot.quotationValues.optionValues.map(val=>{
        return val.price||0
      })
      let optionsPrice = 0
      let quotSpecsPrice = 0
      if(options.length>0){
        optionsPrice = options.reduce((x,y)=>(x+y))
      }
      const quotSpecs = quot.quotationValues.quotationSpecificationValues.map(quotspec=>{
        return quotspec.price||0
      })
      if(quotSpecs.length>0){
        quotSpecsPrice = quotSpecs.reduce((x,y)=>(x+y))
      }
      const subTotal = productPrice+optionsPrice+quotSpecsPrice
      return subTotal-(quot.discount*subTotal/100)
    }
    return undefined
  }

  showDialog(id:string|undefined){
    this.displayDialog = true
    this.idOfStatusChanged = id
    const selectedQuot = this.quotations.find(quot=>{
      return quot._id === id
    })
    switch (selectedQuot?.status) {
      case 'goedgekeurd':
        this.selectedStatus = 'approved'
        break
      case 'aan te passen':
        this.selectedStatus = 'to be altered'
        break
    }
  }

  resetDialog(){
    this.idOfStatusChanged = undefined
    this.selectedStatus = undefined
  }

  onStatusChanged(newStatus:string){
    if(this.idOfStatusChanged && newStatus){
      this.dataService.editStatusQuotation(this.idOfStatusChanged,newStatus).subscribe(res=>{
        this.dataService.getQuotations().subscribe(res=>{
          this.quotations = res
          this.latestVersionQuotations = this.quotations.filter(quotGet=>{
            const filteredQuotGets = this.quotations.filter(quotGetGroupId=>{
              return quotGetGroupId.groupId === quotGet.groupId

            })
            return filteredQuotGets.every(quot => quot.version <= quotGet.version)
          })
        })
      })
    }
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
      case 'Statuswijziging':
        this.showDialog(this.activatedActionsMenu)
        break
      case 'Nieuwe versie':
        this.router.navigate(['offertes','nieuwe-versie',id])
        break
    }
    this.hideMenu()
  }

}
