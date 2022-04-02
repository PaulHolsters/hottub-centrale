import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {DataService} from "../../../../services/data.service";
import {QuotationSpecificationModel} from "../../../../models/quotation/quotation-specification.model";
import {QuotationStorageService} from "../../../../services/quotation.storage.service";
import {ConfirmationService, MessageService} from "primeng/api";

@Component({
  selector: 'app-quotation-specification-picklist',
  templateUrl: './quotation-specification-picklist.component.html',
  styleUrls: ['./quotation-specification-picklist.component.css']
})
export class QuotationSpecificationPicklistComponent implements OnInit {
  @Input() source: QuotationSpecificationModel[]
  @Input() target: QuotationSpecificationModel[]
  @Output() listChanged = new EventEmitter<{source:QuotationSpecificationModel[],target:QuotationSpecificationModel[]}>()
  @Output('store') storeEvent = new EventEmitter<{source:QuotationSpecificationModel[],target:QuotationSpecificationModel[]}>()
  editedQuotationSpecification:QuotationSpecificationModel|undefined
  loadedQuotationSpecification:QuotationSpecificationModel|undefined
  displayEditQuotationSpecificationDialog:boolean
  constructor(private messageService: MessageService, storage: QuotationStorageService, private dataService: DataService,
              private confirmationService:ConfirmationService) {
    this.displayEditQuotationSpecificationDialog = false
    this.source = []
    this.target = []
  }

  ngOnInit(): void {
  }

  deleteQuotationSpecification(id:string){
    this.confirmationService.confirm({
      message: 'Het verwijderen is definitief. Doorgaan?',
      accept: ()=>{
        this.dataService.deleteQuotationSpecification(id).subscribe(res=>{
          // inform parent to rerender this component
          this.source.splice(this.source.findIndex(opt=>{
            return opt._id===id
          }),1)
          this.listChanged.emit({source:this.source,target:this.target})
          this.messageService.add({severity:'success', summary: 'Offerte specificatie verwijderd', life:3000});
        })
      }
    })
  }

  store(){
    // call the store function of the parent without rerendering this component
    // while passing the source and the target
    // the the parent should update its lists via the store ?
    this.storeEvent.emit({source:this.source,target:this.target})
  }

  editQuotationSpecification(id:string){
    // open a dialog where the user can edit this specification
    this.editedQuotationSpecification = this.source.find(opt=>{
      return opt._id===id
    })
    if(this.editedQuotationSpecification){
      this.editedQuotationSpecification = {...this.editedQuotationSpecification}
      this.loadedQuotationSpecification = {...this.editedQuotationSpecification}
      this.displayEditQuotationSpecificationDialog = true
    }
  }

  cancel(){
    this.editedQuotationSpecification = undefined
    this.loadedQuotationSpecification = undefined
    this.displayEditQuotationSpecificationDialog = false
  }

  save(){
    // inform the parent to rerender this component
    if(this.editedQuotationSpecification)
      this.dataService.editQuotationSpecification(this.editedQuotationSpecification).subscribe(res=>{
        const index = this.source.findIndex(opt=>{
          return opt._id===this.editedQuotationSpecification?._id
        })
        if(index>=0 && this.editedQuotationSpecification?.name && this.editedQuotationSpecification?.price !== null
            && this.editedQuotationSpecification?.price !== undefined){
          this.source[index].name = this.editedQuotationSpecification?.name
          this.source[index].price = this.editedQuotationSpecification?.price
        }
        this.listChanged.emit({source:this.source,target:this.target})
        this.editedQuotationSpecification = undefined
        this.loadedQuotationSpecification= undefined
        this.displayEditQuotationSpecificationDialog = false
        this.messageService.add({severity:'success', summary: 'Offerte specificatie aangepast', life:3000});
      },      err=>{
        this.messageService.add({severity:'error', summary: err.error.error, life:3000});
      })
  }

  isDisabled():boolean{
    return (this.editedQuotationSpecification?.name.trim() === this.loadedQuotationSpecification?.name.trim()
        &&this.editedQuotationSpecification?.price === this.loadedQuotationSpecification?.price)||this.editedQuotationSpecification?.name.trim().length===0;

  }

}
