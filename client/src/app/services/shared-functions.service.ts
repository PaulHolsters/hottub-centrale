import {Injectable} from "@angular/core";


@Injectable()
export class SharedFunctionService{

    dateToString(date:Date):string{
        return Intl.DateTimeFormat('en-GB').format(date)
    }

}
