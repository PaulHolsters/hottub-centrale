import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ProductModel} from "../../models/product/product.model";
import {DataService} from "../../services/data.service";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {ProductStorageService} from "../../services/product.storage.service";

@Component({
  selector: 'app-product-overview',
  templateUrl: './product-overview.component.html',
  styleUrls: ['./product-overview.component.css']
})
export class ProductOverviewComponent implements OnInit,AfterViewChecked {
  products:ProductModel[]
  activatedActionsMenu:string|undefined
  // todo hou er rekening mee dat setRoute de links van elk menu zet
  items = [
    {label: 'Bekijken', icon: 'pi pi-fw pi-eye'
    },
    {label: 'Aanpassen', icon: 'pi pi-fw pi-pencil'},
    {label: 'Verwijderen', icon: 'pi pi-fw pi-trash'}
  ];
  constructor(private dataService:DataService,
              private router:Router,
              private messageService:MessageService,
              private storage:ProductStorageService,
              private cd: ChangeDetectorRef) {
    this.products = []
    this.dataService.getProducts().subscribe(res=>{
      this.products = res
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

  handleClick(event:any,id:string){
    switch (event.target.innerText){
      case 'Bekijken':
        this.router.navigate(['offertes/details/'+id])
        break
      case 'Verwijderen':
        this.deleteProduct(id)
        break
      case 'Aanpassen':
        this.router.navigate(['producten','aanpassen',id])
        break
    }
    this.hideMenu()
  }

/*  setRoute(id:string){
    if(this.items){
      this.items[0].routerLink = ['/producten','details',id]
      this.items[1].routerLink = ['/producten','aanpassen',id]
    }
  }

  unsetRoute(id:string){
    if(this.items){
      this.items[0].routerLink = ['']
      this.items[1].routerLink = ['']
    }
  }*/

  priceWithOptions(id:string):number|undefined{
    const product = this.products.find(prod=>{
      return prod._id===id
    })
    const arrPrices = product?.options.map(opt=>{
      return opt?.price || 0
    })
    return (arrPrices?.reduce((x,y)=>x+y,0)||0) + (product?.price||0) || product?.price
  }

  productDetails(id:string){
    this.router.navigate(['producten','details',id])
  }

  deleteProduct(id:string){
    this.dataService.deleteProduct(id).subscribe(res=>{
      this.dataService.getProducts().subscribe(res=>{
        this.products = res
        this.messageService.add({severity:'success', summary: 'Product verwijderd'})
      })
    })
  }

  ngAfterViewChecked(): void {
    if(this.storage.hasMessage()){
      this.messageService.add({key:'successMsg', severity:'success', summary: this.storage.getMessage()})
      this.storage.resetMessage()
      this.cd.detectChanges()
    }
  }
}
