import {Component, OnDestroy, OnInit} from '@angular/core';
import {MenuItem} from "primeng/api";
import {ProductStorageService} from "../../services/product.storage.service";
import {ActivatedRoute} from "@angular/router";
import {DataService} from "../../services/data.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-product-flow',
  templateUrl: './product-flow.component.html',
  styleUrls: ['./product-flow.component.css']
})
export class ProductFlowComponent implements OnInit,OnDestroy {
  step: string
  index: number
  items: MenuItem[]
  blocked:boolean
  id:string|undefined
  constructor(private dataService:DataService,
              private storage:ProductStorageService,
              private route:ActivatedRoute) {
    this.blocked = false
    this.step = this.storage.getStep()
    this.index = this.getIndex()
    this.items = [
      {label: 'Algemene informatie'},
      {label: 'Specificaties'},
      {label: 'Opties'},
      {label: 'Samenvatting'},
    ]
  }

  getIndex():number{
    switch (this.step){
      case 'specifications':
        return 1
      case 'options':
        return 2
      case 'summary':
        return 3
    }
    return 0
  }

  newItem(type:string){
    this.storage.setClickConsumed(false)
    this.storage.newItemClicked.emit(type)
  }

  ngOnInit() {
    this.storage.stepChange.subscribe(step=>{
      this.step = step
      this.index = this.getIndex()
    })
    this.id = this.route.snapshot.params['id']
    if(this.id){
      this.dataService.getProduct(this.id).subscribe(res=>{
        this.storage.productFetched.emit(res)
        if(this.storage.getStateAvailableSpecifications()){
          this.storage.getAvailableSpecifications().subscribe(avSpecs=>{
            res.specifications.forEach(spec=>{
              avSpecs.splice(avSpecs.findIndex(specAv=>{
                return specAv._id===spec._id
              }),1)
            })
            this.storage.setAvailableSpecifications(avSpecs)
          })
        }
        if(this.storage.getStateAvailableOptions()){
          this.storage.getAvailableOptions().subscribe(avOps=>{
            res.options.forEach(opt=>{
              avOps.splice(avOps.findIndex(optAv=>{
                return optAv._id===opt._id
              }),1)
            })
            this.storage.setAvailableOptions(avOps)
          })
        }
      })
    } else{
      if(this.storage.getStateAvailableSpecifications()){
        this.storage.getAvailableSpecifications().subscribe(avSpecs=>{
          this.storage.setAvailableSpecifications(avSpecs)
        })
      }
      if(this.storage.getStateAvailableOptions()){
        this.storage.getAvailableOptions().subscribe(avOps=>{
          this.storage.setAvailableOptions(avOps)
        })
      }
    }
  }

  ngOnDestroy(): void {
    this.storage.resetProduct()
    this.storage.resetInitialProduct()
    this.storage.resetAvailableSpecifications()
    this.storage.resetAvailableOptions()
    this.storage.resetStep()
  }

  next(){
    this.storage.setClickConsumed(false)
    this.storage.nextClicked.emit()
  }

  cancel(){
    this.storage.setClickConsumed(false)
    this.storage.cancelClicked.emit()
  }

  previous(){
    this.storage.setClickConsumed(false)
    this.storage.previousClicked.emit()
  }

  reset(){
    this.storage.setClickConsumed(false)
    this.storage.resetClicked.emit()
  }

  save(){
    this.storage.setClickConsumed(false)
    this.storage.saveClicked.emit()
  }

  isDisabled():boolean{
    const product = this.storage.getProduct()
    return !(product.specifications.length>0 &&
        product.name && product.price)
  }

}
