import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {RouterModule,Routes} from "@angular/router";

import { AppComponent } from './app.component';
import { ProductsComponent } from './products/products.component';

import {MenubarModule} from "primeng/menubar";
import {MenuModule} from "primeng/menu";
import {ButtonModule} from "primeng/button";
import {TableModule} from "primeng/table";
import {DataService} from "./services/data.service";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {PanelModule} from "primeng/panel";
import {InplaceModule} from "primeng/inplace";
import {AutoCompleteModule} from "primeng/autocomplete";
import {CapitalizeFirst} from "./pipes/capitalize-first.pipe";
import { ProductFlowComponent } from './products/product-flow/product-flow.component';
import {StepsModule} from "primeng/steps";
import { ProductInfoComponent } from './products/product-flow/product-info/product-info.component';
import { ProductSpecificationsComponent } from './products/product-flow/product-specifications/product-specifications.component';
import { ProductOptionsComponent } from './products/product-flow/product-options/product-options.component';
import { ProductSummaryComponent } from './products/product-flow/product-summary/product-summary.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { ProductOverviewComponent } from './products/product-overview/product-overview.component';
import {CardModule} from "primeng/card";
import {RadioButtonModule} from "primeng/radiobutton";
import {DividerModule} from "primeng/divider";
import {ProductStorageService} from "./services/product.storage.service";
import {ListboxModule} from "primeng/listbox";
import {PickListModule} from "primeng/picklist";
import { SpecificationPicklistComponent } from './products/product-flow/product-specifications/specification-picklist/specification-picklist.component';
import { OptionPicklistComponent } from './products/product-flow/product-options/option-picklist/option-picklist.component';
import {ToastModule} from "primeng/toast";
import {ConfirmationService, MessageService} from "primeng/api";
import { QuotationsComponent } from './quotations/quotations.component';
import { QuotationFlowComponent } from './quotations/quotation-flow/quotation-flow.component';
import { QuotationOverviewComponent } from './quotations/quotation-overview/quotation-overview.component';
import { QuotationCustomerComponent } from './quotations/quotation-flow/quotation-customer/quotation-customer.component';
import { QuotationProductComponent } from './quotations/quotation-flow/quotation-product/quotation-product.component';
import { QuotationOptionsComponent } from './quotations/quotation-flow/quotation-options/quotation-options.component';
import { QuotationSummaryComponent } from './quotations/quotation-flow/quotation-summary/quotation-summary.component';
import { QuotationSpecificationsComponent } from './quotations/quotation-flow/quotation-specifications/quotation-specifications.component';
import {QuotationStorageService} from "./services/quotation.storage.service";
import { QuotationSpecificationPicklistComponent } from './quotations/quotation-flow/quotation-specifications/quotation-specification-picklist/quotation-specification-picklist.component';
import {CheckboxModule} from "primeng/checkbox";
import {DialogModule} from "primeng/dialog";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {BlockUIModule} from "primeng/blockui";

const appRoutes: Routes = [
  {path: 'producten', component: ProductsComponent},
  {path: 'producten/nieuw', component: ProductFlowComponent},
  {path: 'producten/overzicht', component: ProductOverviewComponent},
  {path: 'producten/details/:id', component: ProductDetailComponent},
  {path: 'producten/aanpassen/:id', component: ProductFlowComponent},
  {path: 'offertes', component: QuotationsComponent},
  {path: 'offertes/nieuw', component: QuotationFlowComponent},
  {path: 'offertes/overzicht', component: QuotationOverviewComponent},
  {path: 'offertes/nieuwe-versie/:id', component: QuotationFlowComponent},
]

@NgModule({
  declarations: [
    AppComponent,
    ProductsComponent,
    CapitalizeFirst,
    ProductFlowComponent,
    ProductInfoComponent,
    ProductSpecificationsComponent,
    ProductOptionsComponent,
    ProductSummaryComponent,
    ProductDetailComponent,
    ProductOverviewComponent,
    SpecificationPicklistComponent,
    OptionPicklistComponent,
    QuotationsComponent,
    QuotationFlowComponent,
    QuotationOverviewComponent,
    QuotationCustomerComponent,
    QuotationProductComponent,
    QuotationOptionsComponent,
    QuotationSummaryComponent,
    QuotationSpecificationsComponent,
    QuotationSpecificationPicklistComponent
  ],
    imports: [
        BrowserModule,
        MenubarModule,
        MenuModule,
        RouterModule.forRoot(appRoutes),
        ButtonModule,
        TableModule,
        HttpClientModule,
        FormsModule,
        DropdownModule,
        InputTextModule,
        PanelModule,
        InplaceModule,
        AutoCompleteModule,
        StepsModule,
        CardModule,
        RadioButtonModule,
        DividerModule,
        ListboxModule,
        PickListModule,
        ToastModule,
        CheckboxModule,
        DialogModule,
        ConfirmDialogModule,
        BlockUIModule,
    ],
  exports: [BrowserAnimationsModule],
  providers: [DataService,ProductStorageService,QuotationStorageService,BrowserAnimationsModule,MessageService,ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
