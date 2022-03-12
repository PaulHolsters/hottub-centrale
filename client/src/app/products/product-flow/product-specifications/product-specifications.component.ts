import {Component,  OnInit, ViewChild} from '@angular/core';
import {ProductStorageService} from "../../../services/product.storage.service";
import {ProductModel} from "../../../models/product/product.model";
import {Router} from "@angular/router";
import {SpecificationModel} from "../../../models/product/specification.model";
import {DataService} from "../../../services/data.service";
import {PickList} from "primeng/picklist";

@Component({
  selector: 'app-product-specifications',
  templateUrl: './product-specifications.component.html',
  styleUrls: ['./product-specifications.component.css']
})
export class ProductSpecificationsComponent implements OnInit {
  @ViewChild('pickList') pickList: PickList | undefined
  newSpecification: string|undefined
  nextClicked: boolean
  previousClicked: boolean
  product: ProductModel
  availableSpecifications: SpecificationModel[]
  loading: boolean

  constructor(private router: Router, private storage: ProductStorageService, private dataService: DataService) {
    this.storage.nextClicked.subscribe(()=>{
      this.next()
    })
    this.storage.cancelClicked.subscribe(()=>{
      this.cancel()
    })
    this.storage.resetClicked.subscribe(()=>{
      this.reset()
    })
    this.storage.previousClicked.subscribe(()=>{
      this.previous()
    })
    this.newSpecification = this.storage.getSpecificationInput()
    this.nextClicked = false
    this.previousClicked = false
    this.product = this.storage.getProduct()
    this.availableSpecifications = []
    this.loading = true
    this.storage.getAvailableSpecifications().subscribe(specList => {
      this.availableSpecifications = specList
      this.loading = false
    })
  }

  ngOnInit() {

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
    this.product = this.storage.getProduct()
    this.loading = true
    this.storage.getAvailableSpecifications().subscribe(specList => {
      // op dit moment worden de available specs geladen maw de lengte zal 0 zijn
      this.availableSpecifications = specList
      this.loading = false
    })
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
    this.nextClicked = true
    this.storage.setStep('options')
    this.store(null)
  }

  previous() {
    this.previousClicked = true
    this.storage.setStep('info')
    this.store(null)
  }

  reset() {
    if (this.product && this.product.specifications) {
      this.product.specifications = []
      this.storage.resetAvailableSpecifications()
      this.storage.getAvailableSpecifications().subscribe(specList => {
        this.availableSpecifications = specList
        this.newSpecification = undefined
      })
    }
  }

  cancel() {
    this.router.navigate(['/producten'])
  }

}
