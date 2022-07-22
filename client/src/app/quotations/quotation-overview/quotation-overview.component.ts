
import {AfterViewChecked, ChangeDetectorRef, Component,  OnInit} from '@angular/core';
import {DataService} from "../../services/data.service";
import {Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {QuotationGetModel} from "../../models/quotation/quotation.get.model";
import {DomSanitizer} from '@angular/platform-browser';
import {QuotationStorageService} from "../../services/quotation.storage.service";
import {BreadcrumbStorageService} from "../../services/breadcrumb.storage.service";
import {InvoiceModel} from "../../models/invoice/invoice.model";

@Component({
  selector: 'app-quotation-overview',
  templateUrl: './quotation-overview.component.html',
  styleUrls: ['./quotation-overview.component.css']
})
export class QuotationOverviewComponent implements OnInit,AfterViewChecked {
  quotationsAll: QuotationGetModel[]
  quotations:QuotationGetModel[]
  quotationsMenuHandler:{id:string,items:any}[]
  activatedActionsMenu:string|undefined
  selectedFileBLOB:any|undefined
  displayDialog:boolean
  displayDialog2:boolean
  displayDialog3:boolean
  sendInvoice: boolean
  quotation: QuotationGetModel | undefined
  idOfStatusChanged:string|undefined
  selectedStatus:string|undefined
  initialStatus:string|undefined
  blocked:boolean
  previousVersions:{id:string,versionString:string}[]|undefined
  selectedVersion:{id:string,versionString:string} | undefined
  numberOfRows = 5
  constructor(private dataService:DataService,private storage:QuotationStorageService,
              private cd: ChangeDetectorRef, private router:Router,private messageService:MessageService,private sanitizer: DomSanitizer,
              private breadcrumbStorage:BreadcrumbStorageService,
              private confirmationService: ConfirmationService) {
    this.displayDialog = false
    this.displayDialog2 = false
    this.displayDialog3 = false
    this.sendInvoice = false
    this.quotations = []
    this.quotationsAll = []
    this.quotationsMenuHandler = []
    this.blocked = false
    this.dataService.getQuotations().subscribe(res=>{
      this.quotationsAll = res
      this.quotations = this.quotationsAll.slice(0,this.numberOfRows)
      this.rerenderActionMenus()
    })
  }

  reloadPage(message:string){
    this.dataService.getQuotations().subscribe(results=>{
      this.quotationsAll = results
      this.quotations = this.quotationsAll.slice(0,this.numberOfRows)
      this.rerenderActionMenus()
      this.messageService.add({severity:'success', summary: message, life:3000})
    })
  }

  paginate(event:any){
    if(event.first+event.rows>=this.quotationsAll.length){
      this.quotations = this.quotationsAll.slice(event.first)
    } else{
      this.quotations = this.quotationsAll.slice(event.first,event.rows)
    }
    this.rerenderActionMenus()
  }

  rerenderActionMenus(){
    this.quotationsMenuHandler = this.quotations.map(quot=>{
      if(quot.status!=='goedgekeurd' && quot.previousVersions.length>0){
        return  {id:quot._id, items: [
            {label: 'Bekijken', icon: 'pi pi-fw pi-eye',
              command:()=>{
                this.router.navigate(['offertes/details/'+quot._id])
                this.hideMenu()
              }
            },
            {label: 'Nieuwe versie', icon: 'pi pi-fw pi-pencil',
              command:()=>{
                this.router.navigate(['offertes','nieuwe-versie',quot._id])
                this.hideMenu()
              }},
            {label: 'Vorige versies', icon: 'pi pi-fw pi-pencil',
              command:()=>{
                this.displayDialog2 = true
                this.previousVersions = quot.previousVersions
                this.hideMenu()
              }},
            {label: 'Toon pdf', icon: 'pi pi-fw pi-download' ,
              command:()=>{
                this.dataService.downloadQuotation(quot._id).subscribe(res=>{
                  this.showPdf(res)
                  this.hideMenu()
                })
              }},
            {label: 'Versturen', icon: 'pi pi-fw pi-send',
              command:()=>{
                this.blocked = true
                this.dataService.sendQuotation(quot._id).subscribe(res=>{
                  this.blocked = false
                  this.storage.setMessage('Offerte verstuurd')
                  location.reload()
                },err=>{
                  this.blocked = false
                  this.messageService.add({severity:'error', summary: err.error.error, life:3000});
                })
                this.hideMenu()
              }},
            {label: 'Statuswijziging',icon: 'pi pi-info-circle',
              command:()=>{
                this.showDialog(this.activatedActionsMenu)
                this.hideMenu()
              }},
            {label: 'Factureren',icon: 'pi pi-money-bill',
              command:()=>{
                this.displayDialog3 = true
                this.quotation = quot
                this.hideMenu()
              }},
            {label: 'Verwijderen',icon: 'pi pi-fw pi-trash',
              command:()=>{
                this.confirmationService.confirm({
                  message: 'Ben je zeker dat je deze offerte wenst te verwijderen',
                  accept: () => {
                    this.dataService.deleteQuotation(quot._id).subscribe(res=>{
                      this.reloadPage('Offerte verwijderd')
                    },err=>{
                      this.messageService.add({severity:'error', summary: err.error.error, life:3000})
                    })
                  }
                })
                this.hideMenu()
              }}
          ]}
      } else if(quot.status!=='goedgekeurd'){
        return  {id:quot._id, items: [
            {label: 'Bekijken', icon: 'pi pi-fw pi-eye',
              command:()=>{
                this.router.navigate(['offertes/details/'+quot._id])
                this.hideMenu()
              }
            },
            {label: 'Nieuwe versie', icon: 'pi pi-fw pi-pencil',
              command:()=>{
                this.router.navigate(['offertes','nieuwe-versie',quot._id])
                this.hideMenu()
              }},
            {label: 'Vorige versies', icon: 'pi pi-fw pi-pencil',disabled:true,iconStyle:{'cursor':'not-allowed'}, style:{'cursor':'not-allowed'}},
            {label: 'Toon pdf', icon: 'pi pi-fw pi-download' ,
              command:()=>{
                this.dataService.downloadQuotation(quot._id).subscribe(res=>{
                  this.showPdf(res)
                  this.hideMenu()
                })
              }},
            {label: 'Versturen', icon: 'pi pi-fw pi-send',
              command:()=>{
                this.blocked = true
                this.dataService.sendQuotation(quot._id).subscribe(res=>{
                  this.blocked = false
                  this.storage.setMessage('Offerte verstuurd')
                  location.reload()
                },err=>{
                  this.blocked = false
                  this.messageService.add({severity:'error', summary: err.error.error, life:3000});
                })
                this.hideMenu()
              }},
            {label: 'Statuswijziging',icon: 'pi pi-info-circle',
              command:()=>{
                this.showDialog(this.activatedActionsMenu)
                this.hideMenu()
              }},
            {label: 'Factureren',icon: 'pi pi-money-bill',
              command:()=>{
                this.displayDialog3 = true
                this.quotation = quot
                this.hideMenu()
              }},
            {label: 'Verwijderen',icon: 'pi pi-fw pi-trash',
              command:()=>{
                this.confirmationService.confirm({
                  message: 'Ben je zeker dat je deze offerte wenst te verwijderen',
                  accept: () => {
                    this.dataService.deleteQuotation(quot._id).subscribe(res=>{
                      this.reloadPage('Offerte verwijderd')
                    },err=>{
                      this.messageService.add({severity:'error', summary: err.error.error, life:3000})
                    })
                  }
                })
                this.hideMenu()
              }}
          ]}
      }  else if (quot.previousVersions.length===0){
        return {id:quot._id, items: [
            {label: 'Bekijken', icon: 'pi pi-fw pi-eye',
              command:()=>{
                this.router.navigate(['offertes/details/'+quot._id])
                this.hideMenu()
              }
            },
            {label: 'Nieuwe versie', icon: 'pi pi-fw pi-pencil',
              command:()=>{
                this.router.navigate(['offertes','nieuwe-versie',quot._id])
                this.hideMenu()
              }},
            {label: 'Vorige versies', icon: 'pi pi-fw pi-pencil',disabled:true,iconStyle:{'cursor':'not-allowed'}, style:{'cursor':'not-allowed'}},
            {label: 'Toon pdf', icon: 'pi pi-fw pi-download',
              command:()=>{
                this.dataService.downloadQuotation(quot._id).subscribe(res=>{
                  this.showPdf(res)
                  this.hideMenu()
                })
              } },
            {label: 'Versturen', icon: 'pi pi-fw pi-send',
              command:()=>{
                this.blocked = true
                this.dataService.sendQuotation(quot._id).subscribe(res=>{
                  this.blocked = false
                  this.storage.setMessage('Offerte verstuurd')
                  location.reload()
                },err=>{
                  this.blocked = false
                  this.messageService.add({severity:'error', summary: err.error.error, life:3000});
                })
                this.hideMenu()
              }},
            {label: 'Statuswijziging',icon: 'pi pi-info-circle',
              command:()=>{
                this.showDialog(this.activatedActionsMenu)
                this.hideMenu()
              }},
            {label: 'Factureren',icon: 'pi pi-money-bill',
              command:()=>{
                this.displayDialog3 = true
                this.quotation = quot
                this.hideMenu()
              }},
            {label: 'Verwijderen',icon: 'pi pi-fw pi-trash',disabled:true,iconStyle:{'cursor':'not-allowed'}, style:{'cursor':'not-allowed'}}
          ]}
      } else{
        return {id:quot._id, items: [
            {label: 'Bekijken', icon: 'pi pi-fw pi-eye',
              command:()=>{
                this.router.navigate(['offertes/details/'+quot._id])
                this.hideMenu()
              }
            },
            {label: 'Nieuwe versie', icon: 'pi pi-fw pi-pencil',
              command:()=>{
                this.router.navigate(['offertes','nieuwe-versie',quot._id])
                this.hideMenu()
              }},
            {label: 'Vorige versies', icon: 'pi pi-fw pi-pencil',
              command:()=>{
                this.displayDialog2 = true
                this.previousVersions = quot.previousVersions
                this.hideMenu()
              }},
            {label: 'Toon pdf', icon: 'pi pi-fw pi-download',
              command:()=>{
                this.dataService.downloadQuotation(quot._id).subscribe(res=>{
                  this.showPdf(res)
                  this.hideMenu()
                })
              } },
            {label: 'Versturen', icon: 'pi pi-fw pi-send',
              command:()=>{
                this.blocked = true
                this.dataService.sendQuotation(quot._id).subscribe(res=>{
                  this.blocked = false
                  this.storage.setMessage('Offerte verstuurd')
                  location.reload()
                },err=>{
                  this.blocked = false
                  this.messageService.add({severity:'error', summary: err.error.error, life:3000});
                })
                this.hideMenu()
              }},
            {label: 'Statuswijziging',icon: 'pi pi-info-circle',
              command:()=>{
                this.showDialog(this.activatedActionsMenu)
                this.hideMenu()
              }},
            {label: 'Factureren',icon: 'pi pi-money-bill',
              command:()=>{
                this.displayDialog3 = true
                this.quotation = quot
                this.hideMenu()
              }},
            {label: 'Verwijderen',icon: 'pi pi-fw pi-trash',disabled:true,iconStyle:{'cursor':'not-allowed'}, style:{'cursor':'not-allowed'}}
          ]}
      }
    })
  }

  convert(){
    this.displayDialog2 = false
    if(this.selectedVersion){
      this.dataService.getQuotation(this.selectedVersion.id).subscribe(quotation=>{
        if(!quotation.previousVersionId) quotation.previousVersionId = quotation._id
        this.dataService.editQuotation(quotation).subscribe(res=>{
          this.reloadPage('Oude versie toegepast')
        },err=>{
          this.messageService.add({severity:'error', summary: err.error.error, life:3000})
        })
      })
    }
  }

  invoice(){
    if(this.sendInvoice && this.quotation){

    } else if(this.quotation) {
      const invoice = new InvoiceModel(this.quotation)
      this.dataService.createInvoice(invoice).subscribe(res=>{
        this.quotation = undefined
        this.displayDialog3 = false
        this.messageService.add({severity:'success', summary: 'Factuur aangemaakt', life:3000})
      })
    }
  }

  read(){
    this.displayDialog2 = false
    this.router.navigate(['offertes/details/'+this.selectedVersion?.id])
    this.hideMenu()
  }

  ngOnInit(): void {
    this.breadcrumbStorage.routeChange.emit([
      {label:'Offertes',routerLink:'offertes'},
      {label:'Overzicht'}
    ])
  }

  getItems(id:string){
    return this.quotationsMenuHandler.find(handler=>{
      return handler.id === id
    })?.items || []
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

  showDialog(id:string|undefined){
    const selectedQuot = this.quotations.find(quot=>{
      return quot._id === id
    })
    switch (selectedQuot?.status) {
      case 'goedgekeurd':
        this.initialStatus = 'approved'
          this.selectedStatus = 'approved'
        break
      case 'aan te passen':
        this.initialStatus = 'to be altered'
          this.selectedStatus = 'to be altered'
        break
      case 'geannuleerd':
        this.initialStatus = 'cancelled'
        this.selectedStatus = 'cancelled'
        break
    }
    this.idOfStatusChanged = id
    this.displayDialog = true
  }

  resetDialog(){
    this.idOfStatusChanged = undefined
    this.selectedStatus = undefined
    this.initialStatus = undefined
    this.selectedVersion = undefined
    this.sendInvoice = false
  }

  onStatusChanged(newStatus:string){
    if(this.idOfStatusChanged && newStatus){
      this.selectedStatus = newStatus
    }
  }

  cancel(){
    this.displayDialog = false
    this.displayDialog2 = false
  }

  isDisabled(){
    return !(this.selectedStatus && this.initialStatus!==this.selectedStatus)
  }

  isDisabledPrevVers(){
    return !(this.selectedVersion)
  }

  save(){
    if(this.idOfStatusChanged && this.selectedStatus && this.initialStatus!==this.selectedStatus){
      this.dataService.editStatusQuotation(this.idOfStatusChanged,this.selectedStatus).subscribe(res=>{
        this.dataService.getQuotations().subscribe(res=>{
          this.quotations = res
          this.rerenderActionMenus()
        })
        this.displayDialog = false
        this.messageService.add({severity:'success', summary: 'Statuswijziging doorgevoerd', life:3000});
      },err=>{
        this.messageService.add({severity:'error', summary: err.error.error, life:3000});
      })
    }
  }

  ngAfterViewChecked(): void {
    if(this.storage.hasMessage()){
      this.messageService.add({severity:'success', summary: this.storage.getMessage()})
      this.storage.resetMessage()
      this.cd.detectChanges()
    }
  }

}
