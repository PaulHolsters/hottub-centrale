import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {BreadcrumbStorageService} from "../services/breadcrumb.storage.service";
import {InvoiceModel} from "../models/invoice/invoice.model";
import {DataService} from "../services/data.service";
import {DomSanitizer} from "@angular/platform-browser";
import {MessageService} from "primeng/api";
import {InvoiceStorageService} from "../services/invoice.storage.service";

@Component({
  selector: 'app-invoice-overview',
  templateUrl: './invoice-overview.component.html',
  styleUrls: ['./invoice-overview.component.css']
})
export class InvoiceOverviewComponent implements OnInit,AfterViewChecked {
  invoices: InvoiceModel[]
  invoicesMenuHandler:{id:string|undefined,items:any}[]
  activatedActionsMenu:string|undefined
  invoicesAll:InvoiceModel[]
  numberOfRows = 5
  selectedFileBLOB:any|undefined
  blocked:boolean
  displayDialog:boolean
  idOfStatusChanged:string|undefined
  deposit: string|undefined
  met: string|undefined
  depositInitial: string|undefined
  metInitial: string|undefined
  constructor(private breadcrumbStorage:BreadcrumbStorageService,private cd: ChangeDetectorRef,
              private dataService:DataService,private messageService:MessageService,private storage:InvoiceStorageService,private sanitizer: DomSanitizer) {
    this.displayDialog = false
    this.blocked = false
    this.invoices = []
    this.invoicesMenuHandler = []
    this.invoicesAll = []
    this.dataService.getInvoices().subscribe(invoices=>{
      this.invoicesAll = invoices
      this.invoices = this.invoicesAll.slice(0,this.numberOfRows)
      this.rerenderActionMenus()

    })
  }

  ngOnInit(): void {
    this.breadcrumbStorage.routeChange.emit([{label:'Facturen'}])
  }

  getItems(id:string){
    return this.invoicesMenuHandler.find(handler=>{
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

  paginate(event:any){
    if(event.first+event.rows>=this.invoicesAll.length){
      this.invoices = this.invoicesAll.slice(event.first)
    } else{
      this.invoices = this.invoicesAll.slice(event.first,event.rows)
    }
    this.rerenderActionMenus()
  }

  showPdf(blob:Blob){
    const url = window.URL.createObjectURL(blob)
    this.selectedFileBLOB = this.sanitizer.bypassSecurityTrustUrl(url);
    window.open(this.selectedFileBLOB.changingThisBreaksApplicationSecurity);
  }

  rerenderActionMenus(){
    this.invoicesMenuHandler = this.invoices.map(invoice=>{
      return {id:invoice._id, items: [
          {label: 'Historiek', icon: 'pi pi-fw pi-eye',
            command:()=>{

              this.hideMenu()
            }
          },
          {label: 'Toon pdf', icon: 'pi pi-fw pi-download',
            command:()=>{
              this.dataService.downloadInvoice(invoice._id).subscribe(res=>{
                this.showPdf(res)
                this.hideMenu()
              })
            } },
          {label: 'Versturen', icon: 'pi pi-fw pi-send',
            command:()=>{
              this.blocked = true
              this.dataService.sendInvoice(invoice._id).subscribe(res=>{
                this.blocked = false
                this.storage.setMessage('Factuur verstuurd')
                // todo historiek wordt in de backend aangepast en de pagina moet dus gerefreshed worden
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
            }}
        ]}
    })
  }

  showDialog(id:string|undefined){
    const selectedInvoice = this.invoices.find(inv=>{
      return inv._id === id
    })
    // todo set initial + selected statusses
    this.idOfStatusChanged = id
    this.displayDialog = true
  }

  resetDialog(){
    this.idOfStatusChanged = undefined
    this.deposit = undefined
    this.met = undefined
    this.depositInitial = undefined
    this.metInitial = undefined
  }

  isDisabled(){
    // todo set disabled based on initial conditions
    return true
    //return !(this.selectedStatus)
  }

  cancel(){
    this.displayDialog = false
  }

  addNewStatus(){
    if(this.idOfStatusChanged){
      const newStatus = []
      if(this.deposit) newStatus.push(this.deposit)
      if(this.met) newStatus.push(this.met)
      this.dataService.editStatusInvoice(this.idOfStatusChanged,newStatus).subscribe(res=>{
        this.dataService.getInvoices().subscribe(res=>{
          this.invoices = res
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
