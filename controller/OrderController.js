// import {items} from "../db/DB.js";
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

let items = [];

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
    let orders = [];
    $.ajax({
        url: 'http://localhost:8080/pos/order_servlet',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            orders = data.content;

            if (orders.length === 0) {
                $("#o_id").val("O001");
                return;
            }
            let lastId = orders[orders.length - 1].oId;
            lastId = lastId.substring(1);

            let newId = Number.parseInt(lastId) + 1 + "";
            newId = newId.padStart(3, "0");

            $("#o_id").val("O" + newId);

        },

        error: function (xhr, status, error) {
            console.error('AJAX request failed: ' + status + ', ' + error);
        }
    });


}

// load order's items
const loadOrderItems = () => {

    $("#o_table>tbody").empty();

    orderItems.map((item) => {
        $("#o_table>tbody").append(
            `<tr>
                <td>${item.iCode}</td>
                <td>${item.iName}</td>
                <td>${item.iPrice}</td>
                <td>${item.iQty}</td>
                <td>
                    <div class="container">
                        <div style="justify-content: center" class="row">
                            <button type="button"
                                class="col col-12 col-sm12 col-md-8 col-lg-8 col-xl-4 col-xxl-4 btn btn-danger remove-t-btn"
                                data-index = ${item.iCode}
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

    $.ajax({
        url: 'http://localhost:8080/pos/customer_servlet',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            data.content.map((customer) => {
                $("#customer").append(`<option value="${customer.cId}">${customer.cId}</option>`);

            });

            if (customer == null) {
                $("#customer").append(`<option value="" hidden selected>Select Customer</option>`);
                $("#c_name").val("");
                $("#c_address").val("");
                $("#c_salary").val("");

            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX request failed: ' + status + ', ' + error);
        }
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
        $("#item").append(`<option value="${item.iCode}">${item.iCode}</option>`);
    });

    if (item == null) {
        $("#item").append(`<option value="" hidden selected>Select Item</option>`)
        $("#i_name").val("");
        $("#i_price").val("");
        $("#i_qty_on_hand").val("");
    }


};

$("#customer").on('change', function () {
    $("#loading_div").css("display", "block");

    $.ajax({
        url: 'http://localhost:8080/pos/customer_servlet?cId=' + $(this).val(),
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            customer = data.content;

            $("#c_name").val(customer.cName);
            $("#c_address").val(customer.cAddress);
            $("#c_salary").val(customer.cSalary);


        },
        error: function (xhr, status, error) {
            Swal.fire(
                'Failed',
                'Can\'t find customer , Try another Id.',
                'error'
            )
        },
        complete: function () {
            $("#loading_div").css("display", "none");
        }
    });


});

$("#item").on('change', function () {
    loadItem();
});

function loadItem() {
    let itemCode = $("#item").val();
    item = items.find(item => item.iCode === itemCode);
    $("#i_name").val(item.iName);
    $("#i_price").val(item.iPrice);
    $("#i_qty_on_hand").val(item.iQty);
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

    if ((item.iQty - qty) < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Insufficient space',
            text: 'Fill Item Qty Correctly!'
        });
        return;
    }

    item.iQty = item.iQty - qty;

    let orderItem = findOrderItem(item.iCode);

    if (orderItem != null) {
        orderItem.iQty = Number.parseInt(orderItem.iQty) + qty;

    } else {
        let tempItem = new ItemModel(item.iCode, item.iName, item.iPrice, qty);
        orderItems.push(tempItem);

    }

    loadItem();
    loadOrderItems();
    calcTotal();
    calcBalance();
    clearItem();

});

function findOrderItem(code) {
    return orderItems.find(item => item.iCode === code);

}

function calcTotal() {
    total = 0;
    orderItems.map(orderItem => {
        total += (orderItem.iQty * orderItem.iPrice);
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
    let itemOnOrder = orderItems.find(item => item.iCode == itemCodeRBtn);
    let itemOnDB = items.find(item => item.iCode == itemCodeRBtn);

    itemOnDB.iQty += itemOnOrder.iQty;

    orderItems.splice(item => item.iCode == itemCodeRBtn, 1);

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
        new CustomerModel(customer.cId, customer.cName, customer.cAddress, customer.cSalary),
        orderItems
    );

    $("#loading_div").css("display", "block");



    var data = {
        oId: $("#o_id").val(),
        oDate: $("#date").val(),
        oTotal: total,
        oSubTotal: subTotal,
        oDiscount: discountInput.val(),
        oBalance: $("#balance").val(),
        customerDTO: {
            cId: customer.cId,
            cName: customer.cName,
            cAddress: customer.cAddress,
            cSalary: customer.cSalary
        },
        items: orderItems

    }

    $.ajax({
        url: 'http://localhost:8080/pos/order_servlet',
        method: 'POST',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data) {
            Swal.fire(
                'Success',
                'Order saved successfully',
                'success'
            )

            orderItems = [];
            customer = null;
            item = null;

            loadOrderItems();
            clearAll();

            cashInput.val("");
            discountInput.val("");
            $("#balance").val("");
            $("#total").text("Total : 0/=");
            $("#sub-total").text("Sub Total : 0/=");

            $("#orders_page").click()
        },
        error: function (xhr, status, error) {
            Swal.fire(
                'Failed',
                'Order not placed',
                'error'
            )
        },
        complete: function () {
            $("#loading_div").css("display", "none");
        }
    });

});

export function init() {
    $.ajax({
        url: 'http://localhost:8080/pos/item_servlet',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            items = data.content;

            currentDate();
            generateOId();
            loadItems();
            loadOrderItems();
            loadCustomers();
        },
        error: function (xhr, status, error) {
            console.error('AJAX request failed: ' + status + ', ' + error);
        }
    });

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






