
import {AfterViewChecked, ChangeDetectorRef, Component,  OnInit} from '@angular/core';
import {DataService} from "../../services/data.service";
import {Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {QuotationGetModel} from "../../models/quotation/quotation.get.model";
import {DomSanitizer} from '@angular/platform-browser';
import {QuotationStorageService} from "../../services/quotation.storage.service";
import {BreadcrumbStorageService} from "../../services/breadcrumb.storage.service";

@Component({
  selector: 'app-quotation-overview',
  templateUrl: './quotation-overview.component.html',
  styleUrls: ['./quotation-overview.component.css']
})
export class QuotationOverviewComponent implements OnInit,AfterViewChecked {
  quotations:QuotationGetModel[]
  quotationsMenuHandler:{id:string,items:any}[]
  activatedActionsMenu:string|undefined
  selectedFileBLOB:any|undefined
  displayDialog:boolean
  idOfStatusChanged:string|undefined
  selectedStatus:string|undefined
  initialStatus:string|undefined
  blocked:boolean

  constructor(private dataService:DataService,private storage:QuotationStorageService,
              private cd: ChangeDetectorRef, private router:Router,private messageService:MessageService,private sanitizer: DomSanitizer,
              private breadcrumbStorage:BreadcrumbStorageService,
              private confirmationService: ConfirmationService) {
    this.displayDialog = false
    this.quotations = []
    this.quotationsMenuHandler = []
    this.blocked = false
    this.dataService.getQuotations().subscribe(res=>{
      this.quotations = res
      this.quotationsMenuHandler = this.quotations.map(quot=>{
        if(quot.status!=='goedgekeurd'){
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
              {label: 'Verwijderen',icon: 'pi pi-fw pi-trash',
                command:()=>{
                  this.confirmationService.confirm({
                    message: 'Ben je zeker dat je deze offerte wenst te verwijderen',
                    accept: () => {
                      // todo remove quotation
                    }
                  })
                  this.hideMenu()
                }}
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
              {label: 'Verwijderen',icon: 'pi pi-fw pi-trash',disabled:true,iconStyle:{'cursor':'not-allowed'}, style:{'cursor':'not-allowed'}}
            ]}
        }
      })
    })
  }

  ngOnInit(): void {
    this.breadcrumbStorage.routeChange.emit([
      {label:'Home', routerLink:'/'},
      {label:'Offertes',routerLink:'offertes'},
      {label:'Overzicht'}
    ])
  }

  getItems(id:string){
    console.log('getting items')
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
  }

  onStatusChanged(newStatus:string){
    if(this.idOfStatusChanged && newStatus){
      this.selectedStatus = newStatus
    }
  }

  cancel(){
    this.displayDialog = false
  }

  isDisabled(){
    return !(this.selectedStatus && this.initialStatus!==this.selectedStatus)
  }

  save(){
    if(this.idOfStatusChanged && this.selectedStatus && this.initialStatus!==this.selectedStatus){
      this.dataService.editStatusQuotation(this.idOfStatusChanged,this.selectedStatus).subscribe(res=>{
        this.dataService.getQuotations().subscribe(res=>{
          this.quotations = res
          this.quotationsMenuHandler = this.quotations.map(quot=>{
            if(quot.status!=='goedgekeurd'){
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
                  {label: 'Verwijderen',icon: 'pi pi-fw pi-trash',
                    command:()=>{
                      this.confirmationService.confirm({
                        message: 'Ben je zeker dat je deze offerte wenst te verwijderen',
                        accept: () => {
                          // todo remove quotation
                        }
                      })
                      this.hideMenu()
                    }}
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
                  {label: 'Verwijderen',icon: 'pi pi-fw pi-trash',disabled:true,iconStyle:{'cursor':'not-allowed'}, style:{'cursor':'not-allowed'}}
                ]}
            }
          })
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
