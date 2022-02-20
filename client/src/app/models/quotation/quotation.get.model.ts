import {OptionModel} from "../product/option.model";
import {QuotationSpecificationModel} from "./quotation-specification.model";
import {SpecificationModel} from "../product/specification.model";

export class QuotationGetModel {
  constructor(public version: number,
              public VAT: number,
              public discount: number,
              public customerInfo: { firstName: string; lastName: string; email: string },
              public productId: string,
              public selectedOptions: string[],
              public selectedQuotationSpecifications: string[],
              public _id: string,
              public quotationValues:{
                optionValues:OptionModel[],
                productCat:string,
                productName:string,
                productPrice:number,
                productSpecifications:SpecificationModel[],
                quotationSpecificationValues:QuotationSpecificationModel[]
              }
  ) {
  }
}
