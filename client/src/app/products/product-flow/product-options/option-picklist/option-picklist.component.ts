import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProductStorageService} from "../../../../services/product.storage.service";
import {DataService} from "../../../../services/data.service";
import {OptionModel} from "../../../../models/product/option.model";
import {ConfirmationService, MessageService} from "primeng/api";

@Component({
  selector: 'app-option-picklist',
  templateUrl: './option-picklist.component.html',
  styleUrls: ['./option-picklist.component.css']
})
export class OptionPicklistComponent implements OnInit {
  @Input() source: OptionModel[]
  @Input() target: OptionModel[]
  @Output() listChanged = new EventEmitter<{source:OptionModel[],target:OptionModel[]}>()
  @Output('store') storeEvent = new EventEmitter<{source:OptionModel[],target:OptionModel[]}>()

  editedOption:OptionModel|undefined
  loadedOption:OptionModel|undefined
  displayEditOptionDialog:boolean
  constructor(private storage: ProductStorageService, private dataService: DataService
              ,private confirmationService:ConfirmationService,private messageService:MessageService) {
    this.displayEditOptionDialog = false
    this.source = []
    this.target = []
  }

  ngOnInit(): void {
  }

  deleteOption(id:string){
    this.confirmationService.confirm({
      message: 'Als je deze optie verwijdert, dan wordt deze verwijderd uit alle producten die mogelijks momenteel ' +
          'van deze optie gebruik maken. Doorgaan?',
      accept: ()=>{
        this.dataService.deleteOption(id).subscribe(res=>{
          // inform parent to rerender this component
          this.source.splice(this.source.findIndex(opt=>{
            return opt._id===id
          }),1)
          this.listChanged.emit({source:this.source,target:this.target})
          this.messageService.add({severity:'success', summary: 'Optie verwijderd', life:3000});
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

  editOption(id:string){
    // open a dialog where the user can edit this specification
    this.editedOption = this.source.find(opt=>{
      return opt._id===id
    })
    if(this.editedOption){
      this.editedOption = {...this.editedOption}
      this.loadedOption = {...this.editedOption}
      this.displayEditOptionDialog = true
    }
  }

  cancel(){
    this.editedOption = undefined
    this.loadedOption = undefined
    this.displayEditOptionDialog = false
  }

  save(){
    // inform the parent to rerender this component
    if(this.editedOption)
      this.dataService.editOption(this.editedOption).subscribe(res=>{
        const index = this.source.findIndex(opt=>{
          return opt._id===this.editedOption?._id
        })
        if(index>=0 && this.editedOption?.name && this.editedOption?.price){
          this.source[index].name = this.editedOption?.name
          this.source[index].price = this.editedOption?.price
        }
        this.listChanged.emit({source:this.source,target:this.target})
        this.editedOption = undefined
        this.loadedOption= undefined
        this.displayEditOptionDialog = false
        this.messageService.add({severity:'success', summary: 'Optie aangepast', life:3000});
      },err=>{
        this.messageService.add({severity:'error', summary: err.error.error, life:3000});
      })
  }

  isDisabled():boolean{
    return this.editedOption?.name.trim() === this.loadedOption?.name.trim()&&this.editedOption?.price === this.loadedOption?.price;

  }

}
