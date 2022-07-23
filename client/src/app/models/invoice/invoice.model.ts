import {QuotationGetModel} from "./../quotation/quotation.get.model"

export class InvoiceModel {
    constructor(
        public quotation: QuotationGetModel,
        public customer?: string,
        public invoiceType?: string,
        public statusHistory?: string[],
        public _id?: string,
        public invoiceNumber?: string ) {
    }
}
