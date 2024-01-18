export class OrderModel {
    constructor(id , date , total , subTotal, discount ,  customerModel , items ) {
        this.id = id;
        this.date = date;
        this.total = total;
        this.subTotal = subTotal;
        this.discount = discount;
        this.customerModel = customerModel;
        this.items = items;
    }
}

