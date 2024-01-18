import {items, customers, orders} from "../db/DB.js";
import {OrderModel} from "../model/OrderModel.js";
import {CustomerModel} from "../model/CustomerModel.js";
import {ItemModel} from "../model/ItemModel.js";

// let order_1 = new OrderModel("O001", "2023-10-10", 1500, 1350 , 10 , new CustomerModel("C001", "Abc", "abc", 180000), []);
// let order_2 = new OrderModel("O002", "2023-10-10", 1560, new CustomerModel("C001", "Abc", "abc", 180000), []);
// let order_3 = new OrderModel("O003", "2023-10-10", 1560, new CustomerModel("C001", "Abc", "abc", 180000), []);
//
// orders.push(order_1);
// orders.push(order_2);
// orders.push(order_3);

let qtyInput = $("#i_qty");
let cashInput = $("#cash");
let discountInput = $("#discount");

const discount_reg = /^(0|[1-9]\d?|100)$/;
const price_reg = /^\d+(\.\d{2})$/;
const qty_reg = /^[0-9]\d*$/;


// let rowIndex = -1;
let customer = null;
let item = null;
let total = 0;
let subTotal = 0;
let orderItems = [];

// set fields uneditable
// function fieldsLock() {
//     $("#c_name").attr("readonly", true);
//     $("#c_address").attr("readonly", true);
//     $("#c_salary").attr("readonly", true);
//
//     $("#i_name").attr("readonly", true);
//     $("#i_price").attr("readonly", true);
//     $("#i_qty_on_hand").attr("readonly", true);
//
//     $("#o_id").attr("readonly", true);
//     $("#date").attr("readonly", true);
//
//     $("#balance").attr("readonly", true);
//
// }

// set current date
function currentDate() {
    let currentDate = new Date();
    var dd = String(currentDate.getDate()).padStart(2, '0');
    var mm = String(currentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = currentDate.getFullYear();

    currentDate = yyyy + '-' + mm + '-' + dd;

    $("#date").val(currentDate);

}

// generate oder ID
function generateOId() {
    if (orders.length === 0) {
        $("#o_id").val("O001");
        return;
    }
    let lastId = orders[orders.length - 1].id;
    lastId = lastId.substring(1);

    let newId = Number.parseInt(lastId) + 1 + "";
    newId = newId.padStart(3, "0");

    $("#o_id").val("O" + newId);


}

// load order's items
const loadOrderItems = () => {

    $("#o_table>tbody").empty();

    orderItems.map((item) => {
        $("#o_table>tbody").append(
            `<tr>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.qty}</td>
                <td>
                    <div class="container">
                        <div style="justify-content: center" class="row">
                            <button type="button"
                                class="col col-12 col-sm12 col-md-8 col-lg-8 col-xl-4 col-xxl-4 btn btn-danger remove-t-btn"
                                data-index = ${item.code}
                                >
                                    Remove
                            </button>
                        </div>
                     </div>
                </td>
            </tr>`
        );
    });
};

// load customers
const loadCustomers = () => {
    $("#customer").empty();

    customers.map((customer) => {
        $("#customer").append(`<option value="${customer.id}">${customer.id}</option>`);
    });

    if (customer == null) {
        $("#customer").append(`<option value="" hidden selected>Select Customer</option>`);
        $("#c_name").val("");
        $("#c_address").val("");
        $("#c_salary").val("");

    }

};

// load items
const loadItems = () => {
    $("#item").empty();

    items.map((item) => {
        $("#item").append(`<option value="${item.code}">${item.code}</option>`);
    });

    if (item == null) {
        $("#item").append(`<option value="" hidden selected>Select Item</option>`)
        $("#i_name").val("");
        $("#i_price").val("");
        $("#i_qty_on_hand").val("");
    }

};

$("#customer").on('change', function () {
    let customerId = $(this).val();
    customer = customers.find(customer => customer.id === customerId);
    $("#c_name").val(customer.name);
    $("#c_address").val(customer.address);
    $("#c_salary").val(customer.salary);

});

$("#item").on('change', function () {
    loadItem();
});

function loadItem() {
    let itemCode = $("#item").val();
    item = items.find(item => item.code === itemCode);
    $("#i_name").val(item.name);
    $("#i_price").val(item.price);
    $("#i_qty_on_hand").val(item.qty);
    qtyInput.val("");

}

// add item
$("#o-add-item-btn").on("click", () => {
    if (item == null) {
        Swal.fire({
            icon: 'question',
            title: 'Cant Find Item',
            text: 'Select Item First!'
        });
        qtyInput.addClass("is-invalid was-validated form-control:invalid");
        return;
    }

    if (!qty_reg.test(qtyInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Item Qty Correctly!'
        });
        qtyInput.addClass("is-invalid was-validated form-control:invalid");
        return;
    }

    let qty = Number.parseInt(qtyInput.val());

    if ((item.qty - qty) < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Insufficient space',
            text: 'Fill Item Qty Correctly!'
        });
        return;
    }

    item.qty = item.qty - qty;

    let orderItem = findOrderItem(item.code);

    if (orderItem != null) {
        orderItem.qty = Number.parseInt(orderItem.qty) + qty;

    } else {
        let tempItem = new ItemModel(item.code, item.name, item.price, qty);
        orderItems.push(tempItem);

    }

    loadItem();
    loadOrderItems();
    calcTotal();
    calcBalance();
    clearItem();

});

function findOrderItem(code) {
    return orderItems.find(item => item.code === code);

}

function calcTotal() {
    total = 0;
    orderItems.map(orderItem => {
        total += (orderItem.qty * orderItem.price);
    });
    total = total.toFixed(2);

    $("#total").text("Total : " + total + "/=");
    calcDiscount(total);

}

function calcDiscount(total) {
    let discount = discountInput.val();
    subTotal = total;
    if (discount != null) {
        subTotal -= ((subTotal * discount) / 100.0);
    }
    subTotal = subTotal.toFixed(2);

    $("#sub-total").text("Sub Total : " + subTotal + "/=");

}

function calcBalance() {
    let cash = cashInput.val();
    $("#balance").val((cash - subTotal).toFixed(2));
}

discountInput.on("input", () => {
    calcDiscount(total);
    calcBalance();

});

cashInput.on("input", function () {
    calcBalance();
});

// set remove btn action
$("#o_table").on("click", "button", function () {
    let itemCodeRBtn = $(this).attr("data-index");
    let itemOnOrder = orderItems.find(item => item.code == itemCodeRBtn);
    let itemOnDB = items.find(item => item.code == itemCodeRBtn);

    itemOnDB.qty += itemOnOrder.qty;

    orderItems.splice(item => item.code == itemCodeRBtn, 1);

    calcTotal();
    loadItem();
    loadOrderItems();
    calcBalance();

});

// do purchase
$("#purchase_btn").on("click", () => {
    if (!checkFields()) {
        return;
    }

    if ($("#balance").val() < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Insufficient Money!',
            text: 'Low balance!'
        });
        return;
    }

    let order = new OrderModel(
        $("#o_id").val(),
        $("#date").val(),
        total,
        subTotal,
        discountInput.val(),
        new CustomerModel(customer.id, customer.name, customer.address, customer.salary),
        orderItems
    );

    orders.push(order);

    orderItems = [];
    customer = null;
    item = null;

    Swal.fire('Saved!', '', 'success');

    loadOrderItems();
    clearAll();

    cashInput.val("");
    discountInput.val("");
    $("#balance").val("");
    $("#total").text("Total : 0/=");
    $("#sub-total").text("Sub Total : 0/=");

    $("#orders_page").click();

});

export function init() {
    // fieldsLock();
    currentDate();
    generateOId();
    loadItems();
    loadOrderItems();
    loadCustomers();

    // $("#total").text("Total : 0/=");
    // $("#sub-total").text("Sub Total : 0/=");
    // cashInput.val("");
    // total = 0;
    // subTotal = 0;
    // calcBalance();
}

// validations
let inputFields = [qtyInput, cashInput, discountInput];
let regList = [qty_reg, price_reg, discount_reg];

for (let i = 0; i < 3; i++) {
    inputFields[i].on('keyup', function () {
        if (regList[i].test(inputFields[i].val())) {
            $(this).addClass("is-valid was-validated");
            $(this).removeClass("is-invalid was-validated form-control:invalid");
        } else {
            $(this).addClass("is-invalid was-validated form-control:invalid");
            $(this).removeClass("is-valid was-validated form-control:valid");

        }

    });
}

function checkFields() {
    if (customer == null) {
        Swal.fire({
            icon: 'question',
            title: 'Cant Find Customer!',
            text: 'Select Customer First!'
        });
        return false;
    }
    if (orderItems.length == 0) {
        Swal.fire({
            icon: 'question',
            title: 'No Order Items!',
            text: 'Add Some Items!'
        });
        return false;
    }

    if (!price_reg.test(cashInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Cash Amount Correctly !'
        });
        cashInput.addClass("is-invalid was-validated form-control:invalid");
        return false;
    }

    if (!discount_reg.test(discountInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Discount Correctly!'
        });
        discountInput.addClass("is-invalid was-validated form-control:invalid");
        return false;
    }
    return true;

}

// clear
function clearItem() {
    qtyInput.removeClass("is-valid was-validated form-control:valid");
    qtyInput.removeClass("is-invalid was-validated form-control:invalid");

};

function clearAll() {
    clearItem();

    cashInput.removeClass("is-valid was-validated form-control:valid");
    cashInput.removeClass("is-invalid was-validated form-control:invalid");

    discountInput.removeClass("is-valid was-validated form-control:valid");
    discountInput.removeClass("is-invalid was-validated form-control:invalid");

};






