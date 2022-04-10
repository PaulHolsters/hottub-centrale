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
  header:string|undefined
  constructor(private messageService: MessageService, storage: QuotationStorageService, private dataService: DataService,
              private confirmationService:ConfirmationService) {
    this.displayEditQuotationSpecificationDialog = false
    this.source = []
    this.target = []
  }

  ngOnInit(): void {
  }

  deleteQuotationSpecification(id:string){
    this.header = 'Verwijderen offerte specificatie'
    this.confirmationService.confirm({
      message: 'Het verwijderen is definitief. Doorgaan?',
      accept: ()=>{
        this.header = undefined
        this.dataService.deleteQuotationSpecification(id).subscribe(res=>{
          // inform parent to rerender this component
          this.source.splice(this.source.findIndex(opt=>{
            return opt._id===id
          }),1)
          this.listChanged.emit({source:this.source,target:this.target})
          this.messageService.add({severity:'success', summary: 'Offerte specificatie verwijderd', life:3000});
        })
      },
      reject: ()=>{
        this.header = undefined
      }
    })
  }

  onMoveToSource(quotationSpecsMoved:{items:QuotationSpecificationModel[]}){
    // neem wat er overgezet wordt
    // indien specificatie die niet lange r bestaat in db toon dialoogbox
    // in deze box vermeld dat deze specificatie niet langer bestaat in de db
    // en dus voor deze offerte na op ok te drukken niet meer kan worden toegevoegd
    // zorg dat bij annuleren de actie naar source niet meer wordt uitgveoerd
    this.dataService.getQuotationSpecifications().subscribe((quotspecs:QuotationSpecificationModel[])=>{
      const ids = quotspecs.map(sp=>{
        return sp._id
      })
      const deletedIds:string[] = []
      for (let specMoved of quotationSpecsMoved.items){
        if(!specMoved._id || !ids.includes(specMoved._id)){
          deletedIds.push(specMoved._id||'')
        }
      }
      if(deletedIds.length>0){
        this.header = 'Speciaal verwijderen'
        let msg = 'De specificatie die u uit de lijst verwijdert, bestaat niet langer in de database.' +
            ' Indien u op ja klikt wordt de specificatie ook definitief verwijderd uit huidige offerte wanneer u op het einde ' +
            'de aanpassing bewaart.'
        if(deletedIds.length>1) msg = 'In de selectie bevinden zich '+ deletedIds.length +' specificaties die niet langer in de database bestaan. Indien u op ja klikt' +
            ' worden deze ook definitief verwijderd uit huidige offerte wanneer u op het einde de offerte bewaart.'
        this.confirmationService.confirm({
          message: msg,
          accept: ()=>{
            this.header = undefined
            deletedIds.forEach(id=>{
              const index = this.source.findIndex(sp=>{
                return sp._id?.toString()===id.toString()
              })
              this.source.splice(index,1)
            })
            this.listChanged.emit({source:this.source,target:this.target})
          },
          reject: ()=>{
            this.header = undefined
            this.storeEvent.emit({source:this.source,target:this.target})
          }
        })
      } else{
        this.storeEvent.emit({source:this.source,target:this.target})
      }
    })
  }

  onMoveToTarget(event:any){
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
