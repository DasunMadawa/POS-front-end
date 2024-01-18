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

    $("#loading_div").css("display", "block");

    $.ajax({
        url: 'http://localhost:8080/pos/order_servlet?oId=' + orderIdInput.val(),
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            let order = data.content;

            if (order == null) {
                Swal.fire({
                    icon: 'info',
                    title: 'Cant Find Order',
                    text: 'Check Another Oder Id!'
                });
                return;
            }

            let customer = order.customerDTO;
            let orderItems = order.items

            // date
            $("#date_history").val(order.oDate);

            // customer
            $("#c_id_history").val(customer.cId);
            $("#c_name_history").val(customer.cName);
            $("#c_address_history").val(customer.cAddress);
            $("#c_salary_history").val(customer.cSalary);

            // total
            $("#total_history").text("Total : " + order.oTotal + "/=");
            $("#sub-total_history").text("Total : " + order.oSubTotal + "/=");
            $("#discount_history").val(order.oDiscount);

            // items
            loadOrderItems(orderItems);

            clear();

        },
        error: function (xhr, status, error) {
            Swal.fire({
                icon: 'info',
                title: 'Can\'t Find Item',
                text: 'Check Another ID !'
            });
        },
        complete: function () {
            $("#loading_div").css("display", "none");
        }
    });


});

// load order's items
const loadOrderItems = (orderItems) => {

    $("#o_table_history>tbody").empty();

    orderItems.map((item) => {
        $("#o_table_history>tbody").append(
            `<tr>
                <td>${item.iCode}</td>
                <td>${item.iName}</td>
                <td>${item.iPrice}</td>
                <td>${item.iQty}</td>
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



