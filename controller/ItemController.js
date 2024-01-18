import {customers, items} from "../db/DB.js";
import {ItemModel} from "../model/ItemModel.js";

const i_code_reg = /^I\d{3}$/;
const name_reg = /^[A-Za-z\d\s\-']{3,50}$/;
const price_reg = /^\d+(\.\d{2})$/;
const qty_reg = /^[0-9]\d*$/;

// items.push(new ItemModel("I001", "Shampoo", 150, 23));
// items.push(new ItemModel("I002", "Fresh Milk", 350, 15));


var row_index = -1;

let searchInput = $("#item_search");
let codeInput = $("#i_i_code");
let nameInput = $("#i_i_name");
let priceInput = $("#i_i_price");
let qtyInput = $("#i_i_qty");

const clear = () => {
    row_index = -1;
    $("#i_clear_btn").click();

}

// load all data to table
export const loadAllTableItems = () => {
    $("#i_table>tbody").empty();

    $.ajax({
        url: 'http://localhost:8080/pos/item_servlet',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            data.content.map((item) => {
                $("#i_table > tbody").append(`<tr><td>${item.iCode}</td><td>${item.iName}</td><td>${item.iPrice}</td><td>${item.iQty}</td></tr>`);
            });
        },
        error: function (xhr, status, error) {
            console.error('AJAX request failed: ' + status + ', ' + error);
        }
    });

};

loadAllTableItems();

// search
$("#i_search_btn").on('click', () => {
    if (!i_code_reg.test(searchInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Item Code Correctly !'
        });
        return;
    }

    $("#loading_div").css("display", "block");

    $.ajax({
        url: 'http://localhost:8080/pos/item_servlet?iCode=' + searchInput.val(),
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            var item = data.content;

            codeInput.val(item.iCode);
            nameInput.val(item.iName);
            priceInput.val(item.iPrice);
            qtyInput.val(item.iQty);

            row_index = 1;
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

// save
$("#i_save_btn").on('click', () => {
    if (!checkFields()) {
        return;
    }

    $("#loading_div").css("display", "block");

    var data = {
        iCode: codeInput.val(),
        iName: nameInput.val(),
        iPrice: priceInput.val(),
        iQty: qtyInput.val()
    };

    $.ajax({
        url: 'http://localhost:8080/pos/item_servlet',
        method: 'POST',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data) {
            Swal.fire(
                'Success',
                'Item saved successfully',
                'success'
            )

            loadAllTableItems();
            clear();
        },
        error: function (xhr, status, error) {
            Swal.fire(
                'Failed',
                'Check duplicate Item Codes',
                'error'
            )
        },
        complete: function () {
            $("#loading_div").css("display", "none");
        }
    });

});

// update
$("#i_update_btn").on('click', () => {
    if (row_index == -1) {
        Swal.fire(
            'Cant Find Item',
            'Select or search Item',
            'question'
        )
        return;
    }

    if (!checkFields()) {
        return;
    }

    Swal.fire({
        title: 'Are you sure to update this item?',
        text: " ",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Update !'
    }).then((result) => {
        if (result.isConfirmed) {
            $("#loading_div").css("display", "block");

            var data = {
                iCode: codeInput.val(),
                iName: nameInput.val(),
                iPrice: priceInput.val(),
                iQty: qtyInput.val()
            };

            $.ajax({
                url: 'http://localhost:8080/pos/item_servlet',
                method: 'PUT',
                dataType: 'json',
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data) {
                    Swal.fire(
                        'Updated!',
                        'Item has been Updated.',
                        'success'
                    )

                    loadAllTableItems();
                    clear();
                },
                error: function (xhr, status, error) {
                    Swal.fire(
                        'Failed',
                        'Check Item Codes',
                        'error'
                    )
                },
                complete: function () {
                    $("#loading_div").css("display", "none");
                }
            });

        }
    });

});

// delete
$("#i_delete_btn").on('click', () => {
    if (row_index === -1) {
        Swal.fire(
            'Cant Find Item',
            'Select or search Item',
            'question'
        )
        return;
    }

    Swal.fire({
        title: 'Are you sure to delete this item ?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete !'
    }).then((result) => {
        if (result.isConfirmed) {
            $("#loading_div").css("display", "block");

            $.ajax({
                url: 'http://localhost:8080/pos/item_servlet?iCode=' + codeInput.val(),
                method: 'DELETE',
                dataType: 'json',
                success: function (data) {
                    Swal.fire(
                        'Deleted!',
                        'Item has been deleted.',
                        'success'
                    )

                    loadAllTableItems();
                    clear();

                },
                error: function (xhr, status, error) {
                    Swal.fire(
                        'Failed',
                        'Can\'t find item , Try another Item Codes.',
                        'error'
                    )
                },
                complete: function () {
                    $("#loading_div").css("display", "none");
                }
            });

        }
    });


});

// table select
$("#i_table").on('click', 'tr', function () {
    clear();

    codeInput.val($(this).find("td:first-child").text());
    nameInput.val($(this).find("td:nth-child(2)").text());
    priceInput.val($(this).find("td:nth-child(3)").text());
    qtyInput.val($(this).find("td:nth-child(4)").text());

    row_index = 1;

});

// validations
let inputFields = [codeInput, nameInput, priceInput, qtyInput, searchInput];
let regList = [i_code_reg, name_reg, price_reg, qty_reg, i_code_reg];

for (let i = 0; i < 5; i++) {
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
    if (!i_code_reg.test(codeInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Item Code Correctly !'
        });
        codeInput.addClass("is-invalid was-validated form-control:invalid");
        return false;
    }

    if (!name_reg.test(nameInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Item Name Correctly !'
        });
        nameInput.addClass("is-invalid was-validated form-control:invalid");
        return false;
    }

    if (!price_reg.test(priceInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Item Price Correctly !'
        });
        priceInput.addClass("is-invalid was-validated form-control:invalid");
        return false;
    }

    if (!qty_reg.test(qtyInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill qty Correctly !'
        });
        qtyInput.addClass("is-invalid was-validated form-control:invalid");
        return false;
    }

    return true;

}

// clear
$(" #i_clear_btn ").on('click', () => {
    codeInput.removeClass("is-valid was-validated form-control:valid");
    codeInput.removeClass("is-invalid was-validated form-control:invalid");

    nameInput.removeClass("is-valid was-validated form-control:valid");
    nameInput.removeClass("is-invalid was-validated form-control:invalid");

    priceInput.removeClass("is-valid was-validated form-control:valid");
    priceInput.removeClass("is-invalid was-validated form-control:invalid");

    qtyInput.removeClass("is-valid was-validated form-control:valid");
    qtyInput.removeClass("is-invalid was-validated form-control:invalid");

});






