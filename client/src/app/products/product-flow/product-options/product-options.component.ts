import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProductStorageService} from "../../../services/product.storage.service";
import {PickList} from "primeng/picklist";
import {ProductModel} from "../../../models/product/product.model";
import {Router} from "@angular/router";
import {DataService} from "../../../services/data.service";
import {OptionModel} from "../../../models/product/option.model";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-product-options',
  templateUrl: './product-options.component.html',
  styleUrls: ['./product-options.component.css']
})
export class ProductOptionsComponent implements OnInit,OnDestroy {
  @ViewChild('pickList') pickList: PickList | undefined
  newOptionName: string|undefined
  newOptionPrice: number|undefined
  product: ProductModel
  availableOptions: OptionModel[]
  loading: boolean
  nextSub:Subscription
  previousSub:Subscription
  cancelSub:Subscription
  resetSub:Subscription
  constructor(private router: Router, private storage: ProductStorageService, private dataService: DataService) {
    this.nextSub = this.storage.nextClicked.subscribe(()=>{
      if(this.storage.getStep()==='options' && !this.storage.getClickConsumed()){
        this.next()
      }
    })
    this.cancelSub = this.storage.cancelClicked.subscribe(()=>{
      if(this.storage.getStep()==='options' && !this.storage.getClickConsumed()){
        this.cancel()
      }
    })
    this.resetSub = this.storage.resetClicked.subscribe(()=>{
      if(this.storage.getStep()==='options' && !this.storage.getClickConsumed()){
        this.reset()
      }
    })
    this.previousSub = this.storage.previousClicked.subscribe(()=>{
      if(this.storage.getStep()==='options' && !this.storage.getClickConsumed()){
        this.previous()
      }
    })
    this.newOptionName = this.storage.getOptionNameInput()
    this.newOptionPrice = this.storage.getOptionPriceInput()
    console.log('getting product from options 1')
    this.product = this.storage.getProduct()
    this.availableOptions = this.storage.getAvailableOptionsNoSub()||[]
    this.loading = false
  }


  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.nextSub.unsubscribe()
    this.previousSub.unsubscribe()
    this.cancelSub.unsubscribe()
    this.resetSub.unsubscribe()
  }

  store(lists: { source: OptionModel[], target: OptionModel[] } | null) {
    if (lists) {
      this.product.options = lists.target
      this.availableOptions = lists.source
    }
    this.storage.setProduct(this.product)
    this.storage.setAvailableOptions(this.availableOptions)
    this.storage.setOptionNameInput(this.newOptionName)
    this.storage.setOptionPriceInput(this.newOptionPrice)
  }

  reload(lists:{source:OptionModel[],target:OptionModel[]}) {
    this.store(lists)
    console.log('getting product from options 2')
    this.product = this.storage.getProduct()
    this.availableOptions = this.storage.getAvailableOptionsNoSub()||[]
  }

  addOption() {
    if(this.newOptionName && (this.newOptionPrice || this.newOptionPrice===0)){
      const newOption = new OptionModel(this.newOptionName.trim(),this.newOptionPrice)
      this.loading = true
      this.dataService.createOption(newOption).subscribe(opt => {
        this.product.options.push(opt)
        this.newOptionName = undefined
        this.newOptionPrice = undefined
        this.store(null)
        this.loading = false
      })
    }
  }

  next(){
    this.store(null)
    this.storage.setStep('summary')
    this.storage.setClickConsumed(true)
  }

  previous() {
    this.storage.setStep('specifications')
    this.store(null)
    this.storage.setClickConsumed(true)
  }

  reset() {
    if (this.product && this.product.options) {
      this.product.options = []
      this.availableOptions = []
      this.storage.resetAvailableOptions()
      this.newOptionName = undefined
      this.newOptionPrice = undefined
      this.availableOptions = this.storage.getAvailableOptionsNoSub()||[]
      this.storage.setClickConsumed(true)
    }
  }

  cancel() {
    this.router.navigate(['/producten'])
    this.storage.setClickConsumed(true)
  }

}
