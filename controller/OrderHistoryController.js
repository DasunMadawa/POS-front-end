import {orders} from "../db/DB.js";

const i_code_reg = /^O\d{3}$/;

let searchBtn = $("#o_search_btn_history");
let orderIdInput = $("#o_id_history");


// search
searchBtn.on("click", function () {
    if (!i_code_reg.test(orderIdInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Cash Amount Correctly !'
        });
        orderIdInput.addClass("is-invalid was-validated form-control:invalid");
        return false;
    }

    let order = orders.find(order => order.id === orderIdInput.val());

    if (order == null) {
        Swal.fire({
            icon: 'info',
            title: 'Cant Find Order',
            text: 'Check Another Oder Id!'
        });
        return;
    }

    let customer = order.customerModel;
    let orderItems = order.items

    // date
    $("#date_history").val(order.date);

    // customer
    $("#c_id_history").val(customer.id);
    $("#c_name_history").val(customer.name);
    $("#c_address_history").val(customer.address);
    $("#c_salary_history").val(customer.salary);

    // total
    $("#total_history").text("Total : " + order.total + "/=");
    $("#sub-total_history").text("Total : " + order.subTotal + "/=");
    $("#discount_history").val(order.discount);

    // items
    loadOrderItems(orderItems);

    clear();

});

// load order's items
const loadOrderItems = (orderItems) => {

    $("#o_table_history>tbody").empty();

    orderItems.map((item) => {
        $("#o_table_history>tbody").append(
            `<tr>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.qty}</td>
            </tr>`
        );
    });
};

// validation
orderIdInput.on("input", function () {
    if (i_code_reg.test(orderIdInput.val())) {
        orderIdInput.addClass("is-valid was-validated");
        orderIdInput.removeClass("is-invalid was-validated form-control:invalid");
    } else {
        orderIdInput.addClass("is-invalid was-validated form-control:invalid");
        orderIdInput.removeClass("is-valid was-validated form-control:valid");

    }
});

// clear
function clear() {
    orderIdInput.removeClass("is-valid was-validated form-control:valid");
    orderIdInput.removeClass("is-invalid was-validated form-control:invalid");

};



