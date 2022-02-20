import { Component, OnInit } from '@angular/core';
import {ProductModel} from "../../models/product/product.model";
import {DataService} from "../../services/data.service";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-product-overview',
  templateUrl: './product-overview.component.html',
  styleUrls: ['./product-overview.component.css']
})
export class ProductOverviewComponent implements OnInit {
  products:ProductModel[]
  activatedActionsMenu:string|undefined
  // todo hou er rekening mee dat setRoute de links van elk menu zet
  items = [
    {label: 'Bekijken', icon: 'pi pi-fw pi-eye',routerLink:['']
    },
    {label: 'Aanpassen', icon: 'pi pi-fw pi-pencil', routerLink:['']},
    {label: 'Verwijderen', icon: 'pi pi-fw pi-trash'}
  ];
  constructor(private dataService:DataService,private router:Router,private messageService:MessageService,) {
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
    this.setRoute(id)
  }

  hideMenu(id:string){
    this.activatedActionsMenu = undefined
    this.unsetRoute(id)
  }

  setRoute(id:string){
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
  }


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

  editProduct(id:string){
    this.router.navigate(['producten','aanpassen',id])
  }

  deleteProduct(id:string){
    this.dataService.deleteProduct(id).subscribe(res=>{
      this.dataService.getProducts().subscribe(res=>{
        this.products = res
        this.messageService.add({severity:'success', summary: 'Product verwijderd'})
      })
    })
  }

}
