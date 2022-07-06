import {OptionModel} from "../product/option.model";
import {QuotationSpecificationModel} from "./quotation-specification.model";
import {SpecificationModel} from "../product/specification.model";

export class QuotationGetModel {
    constructor(
        public groupId: string,
        public previousVersionId: string | undefined,
        public status: string,
        public version: number,
        public VAT: number,
        public discount: number,
        public customerInfo: { firstName: string; lastName: string; email: string },
        public productId: string,
        public selectedOptions: string[],
        public selectedQuotationSpecifications: string[],
        public quotationValues: {
            optionValues: OptionModel[],
            productCat: string,
            productName: string,
            productPrice: number,
            productSpecifications: SpecificationModel[],
            quotationSpecificationValues: QuotationSpecificationModel[]
        },
        public _id: string,
        public creationDate: Date,
        public sendDate: string[]|undefined,
        public customer: string,
        public totalPrice: number | undefined
    ) {
    }
}
