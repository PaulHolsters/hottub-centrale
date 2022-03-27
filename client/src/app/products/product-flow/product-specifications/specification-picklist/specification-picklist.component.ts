import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {SpecificationModel} from "../../../../models/product/specification.model";
import {ProductStorageService} from "../../../../services/product.storage.service";
import {DataService} from "../../../../services/data.service";
import {ConfirmationService, MessageService} from "primeng/api";

@Component({
  selector: 'app-specification-picklist',
  templateUrl: './specification-picklist.component.html',
  styleUrls: ['./specification-picklist.component.css']
})
export class SpecificationPicklistComponent implements OnInit,OnDestroy {
  @Input() source: SpecificationModel[]
  @Input() target: SpecificationModel[]
  @Output() listChanged = new EventEmitter<{source:SpecificationModel[],target:SpecificationModel[]}>()
  @Output('store') storeEvent = new EventEmitter<{source:SpecificationModel[],target:SpecificationModel[]}>()

  displayEditSpecificationDialog: boolean
  editedSpecification:SpecificationModel|undefined
  loadedSpecification:SpecificationModel|undefined
  constructor(private storage: ProductStorageService, private dataService: DataService,
              private confirmationService: ConfirmationService,private messageService:MessageService) {
    this.source = []
    this.target = []
    this.displayEditSpecificationDialog = false
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }

  deleteSpecification(id:string){
    this.confirmationService.confirm({
      message: 'Als je deze specificatie verwijdert, dan wordt deze verwijderd uit alle producten die mogelijks momenteel ' +
          'van deze specificatie gebruik maken. Doorgaan?',
      accept: ()=>{
        this.dataService.deleteSpecification(id).subscribe(res=>{
          // inform parent to rerender this component
          this.source.splice(this.source.findIndex(spec=>{
            return spec._id===id
          }),1)
          this.listChanged.emit({source:this.source,target:this.target})
          this.messageService.add({severity:'success', summary: 'Specificatie verwijderd', life:3000});
        },err=>{
          this.messageService.add({severity:'error', summary: err.error.error, life:3000});
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

  editSpecification(id:string){
    // open a dialog where the user can edit this specification
    this.editedSpecification = this.source.find(spec=>{
      return spec._id===id
    })
    if(this.editedSpecification){
      this.editedSpecification = {...this.editedSpecification}
      this.loadedSpecification = {...this.editedSpecification}
      this.displayEditSpecificationDialog = true
    }
  }

  cancel(){
    this.editedSpecification = undefined
    this.loadedSpecification = undefined
    this.displayEditSpecificationDialog = false
  }

  save(){
    // inform the parent to rerender this component
    if(this.editedSpecification)
    this.dataService.editSpecification(this.editedSpecification).subscribe(res=>{
      const index = this.source.findIndex(spec=>{
        return spec._id===this.editedSpecification?._id
      })
      if(index>=0 && this.editedSpecification?.name){
        this.source[index].name = this.editedSpecification?.name
      }
      this.listChanged.emit({source:this.source,target:this.target})
      this.editedSpecification = undefined
      this.loadedSpecification = undefined
      this.displayEditSpecificationDialog = false
      this.messageService.add({severity:'success', summary: 'Specificatie aangepast', life:3000});
    },err=>{
      this.messageService.add({severity:'error', summary: err.error.error, life:3000});
    })
  }

  isDisabled():boolean{
    return this.editedSpecification?.name.trim() === this.loadedSpecification?.name.trim();

  }

}
