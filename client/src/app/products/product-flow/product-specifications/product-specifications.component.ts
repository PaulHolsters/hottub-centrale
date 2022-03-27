import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProductStorageService} from "../../../services/product.storage.service";
import {ProductModel} from "../../../models/product/product.model";
import {ActivatedRoute, Router} from "@angular/router";
import {SpecificationModel} from "../../../models/product/specification.model";
import {DataService} from "../../../services/data.service";
import {PickList} from "primeng/picklist";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-product-specifications',
  templateUrl: './product-specifications.component.html',
  styleUrls: ['./product-specifications.component.css']
})
export class ProductSpecificationsComponent implements OnInit,OnDestroy {
  @ViewChild('pickList') pickList: PickList | undefined
  newSpecification: string|undefined
  product: ProductModel
  initialProduct:ProductModel
  availableSpecifications: SpecificationModel[]
  loading:boolean
  nextSub:Subscription
  previousSub:Subscription
  cancelSub:Subscription
  resetSub:Subscription

  constructor(private router: Router, private storage: ProductStorageService, private dataService: DataService,private route: ActivatedRoute) {
    this.nextSub = this.storage.nextClicked.subscribe(()=>{
      if(this.storage.getStep()==='specifications' && !this.storage.getClickConsumed()){
        this.next()
      }
    })
    this.cancelSub = this.storage.cancelClicked.subscribe(()=>{
      if(this.storage.getStep()==='specifications' && !this.storage.getClickConsumed()){
        this.cancel()
      }
    })
    this.resetSub = this.storage.resetClicked.subscribe(()=>{
      if(this.storage.getStep()==='specifications' && !this.storage.getClickConsumed()){
        this.reset()
      }
    })
     this.previousSub = this.storage.previousClicked.subscribe(()=>{
      if(this.storage.getStep()==='specifications' && !this.storage.getClickConsumed()){
        this.previous()
      }
    })
    this.newSpecification = this.storage.getSpecificationInput()
    this.product = this.storage.getProduct()
    this.initialProduct = this.storage.getInitialProduct()
    this.availableSpecifications = this.storage.getAvailableSpecificationsNoSub()||[]
    this.loading = false
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.nextSub.unsubscribe()
    this.previousSub.unsubscribe()
    this.cancelSub.unsubscribe()
    this.resetSub.unsubscribe()
  }

  store(lists: { source: SpecificationModel[], target: SpecificationModel[] } | null) {
    if (lists) {
      this.product.specifications = lists.target
      this.availableSpecifications = lists.source
    }
    this.storage.setProduct(this.product)
    this.storage.setAvailableSpecifications(this.availableSpecifications)
    this.storage.setSpecificationInput(this.newSpecification)
  }

  reload(lists:{source:SpecificationModel[],target:SpecificationModel[]}) {
    this.store(lists)
    console.log('getting product from specs 2')
    this.product = this.storage.getProduct()
    this.availableSpecifications = this.storage.getAvailableSpecificationsNoSub()||[]
  }

  addSpecification() {
    if(this.newSpecification){
      const newSpecification = new SpecificationModel(this.newSpecification.trim())
      this.loading = true
      this.dataService.createSpecification(newSpecification).subscribe(spec => {
        this.product.specifications.push(spec)
        this.newSpecification = ''
        this.store(null)
        this.loading = false
      })
    }
  }

  next() {
    this.storage.setStep('options')
    this.store(null)
    this.storage.setClickConsumed(true)
  }

  previous() {
    this.storage.setStep('info')
    this.store(null)
    this.storage.setClickConsumed(true)
  }

  reset() {
    if (this.product && this.product.specifications) {
      if(this.route.snapshot.params['id']){
        this.storage.getAvailableSpecifications().subscribe(specs=>{
          console.log(specs)
          this.product.specifications = [...this.initialProduct.specifications]
          if(this.product.specifications.length>0){
            this.availableSpecifications = specs.filter(spec=>{
              return !this.product.specifications.map(spec2=>{
                return spec2._id
              }).includes(spec._id)
            })
          } else{
            this.availableSpecifications = specs
          }
          this.storage.setAvailableSpecifications([...this.availableSpecifications])
        })
        this.newSpecification = undefined
        this.storage.setClickConsumed(true)
      } else{
        this.product.specifications = []
        this.storage.resetAvailableSpecifications()
        this.newSpecification = undefined
        this.availableSpecifications = this.storage.getAvailableSpecificationsNoSub()||[]
        this.storage.setClickConsumed(true)
      }
    }
  }

  cancel() {
    this.router.navigate(['/producten'])
    this.storage.setClickConsumed(true)
  }

}
