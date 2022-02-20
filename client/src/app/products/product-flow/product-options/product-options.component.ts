import {Component, OnInit, ViewChild} from '@angular/core';
import {ProductStorageService} from "../../../services/product.storage.service";
import {PickList} from "primeng/picklist";
import {ProductModel} from "../../../models/product/product.model";
import {Router} from "@angular/router";
import {DataService} from "../../../services/data.service";
import {OptionModel} from "../../../models/product/option.model";

@Component({
  selector: 'app-product-options',
  templateUrl: './product-options.component.html',
  styleUrls: ['./product-options.component.css']
})
export class ProductOptionsComponent implements OnInit {
  @ViewChild('pickList') pickList: PickList | undefined
  newOptionName: string|undefined
  newOptionPrice: number|undefined
  nextClicked: boolean
  previousClicked: boolean
  product: ProductModel
  availableOptions: OptionModel[]
  loading: boolean
  constructor(private router: Router, private storage: ProductStorageService, private dataService: DataService) {
    this.newOptionName = this.storage.getOptionNameInput()
    this.newOptionPrice = this.storage.getOptionPriceInput()
    this.nextClicked = false
    this.previousClicked = false
    this.product = this.storage.getProduct()
    this.availableOptions= []
    this.loading = true
    this.storage.getAvailableOptions().subscribe(optList => {
      this.availableOptions = optList
      this.loading = false
    })
  }


  ngOnInit(): void {

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
    this.product = this.storage.getProduct()
    this.loading = true
    this.storage.getAvailableOptions().subscribe(optList => {
      this.availableOptions = optList
      this.loading = false
    })
  }

  addOption() {
    if(this.newOptionName && this.newOptionPrice){
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
    this.nextClicked = true
    this.store(null)
    this.storage.setStep('summary')
  }

  previous() {
    this.previousClicked = true
    this.storage.setStep('specifications')
    this.store(null)
  }

  reset() {
    if (this.product && this.product.options) {
      this.product.options = []
      this.availableOptions = []
      this.storage.resetAvailableOptions()
      this.storage.getAvailableOptions().subscribe(optList => {
        this.availableOptions = optList
        this.newOptionName = undefined
        this.newOptionPrice = undefined
      })
    }
  }

  cancel() {
    this.router.navigate(['/producten'])
  }

}
