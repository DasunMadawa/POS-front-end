// import {customers, items} from "../db/DB.js";
import {CustomerModel} from "../model/CustomerModel.js";

const cId_reg = /^C\d{3}$/;
const name_reg = /^[A-Za-z\s\-']{3,50}$/;
const salary_reg = /^\d+(\.\d{2})?$/;


var row_index = -1;

// customers.push(new CustomerModel("C001", "Dasun Madawa", "Horana", 150000));
// customers.push(new CustomerModel("C002", "Dasun Madawa", "Horana", 150000));
// customers.push(new CustomerModel("C003", "Dasun Madawa", "Horana", 150000));
// customers.push(new CustomerModel("C004", "Dasun Madawa", "Horana", 150000));

let searchInput = $(" #c_customer_search ");
let idInput = $(" #c_c_id ");
let nameInput = $(" #c_c_name ");
let addressInput = $(" #c_c_address ");
let salaryInput = $(" #c_c_salary ");


// load all data to table
export const loadAllTableCustomers = () => {
    $("#c_table > tbody").empty();

    $.ajax({
        url: 'http://localhost:8080/pos/customer_servlet',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            data.content.map((customer) => {
                $("#c_table > tbody").append(`<tr><td>${customer.cId}</td><td>${customer.cName}</td><td>${customer.cAddress}</td><td>${customer.cSalary}</td></tr>`);
            });
        },
        error: function (xhr, status, error) {
            console.error('AJAX request failed: ' + status + ', ' + error);
        }
    });


}

loadAllTableCustomers();

const clear = () => {
    row_index = -1;
    $(" #c_clear ").click();

}

// search
$(" #c_search_btn ").on('click', () => {
    if (searchInput.val() == null || searchInput.val().length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Customer Id Correctly !'
        });
        return;
    }

    $("#loading_div").css("display", "block");

    $.ajax({
        url: 'http://localhost:8080/pos/customer_servlet?cId=' + searchInput.val(),
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            var customer = data.content;

            idInput.val(customer.cId);
            nameInput.val(customer.cName);
            addressInput.val(customer.cAddress);
            salaryInput.val(customer.cSalary);

            row_index = 1
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

// table select
$(" #c_table ").on('click', 'tr ', function () {
    clear();
    idInput.val($(this).find("td:first-child").text());
    nameInput.val($(this).find("td:nth-child(2)").text());
    addressInput.val($(this).find("td:nth-child(3)").text());
    salaryInput.val($(this).find("td:nth-child(4)").text());

    row_index = 1;

});

// save
$("#c_save").on('click', () => {

    if (!checkFields()) {
        return;
    }

    $("#loading_div").css("display", "block");

    var data = {
        cId: idInput.val(),
        cName: nameInput.val(),
        cAddress: addressInput.val(),
        cSalary: salaryInput.val()
    };

    $.ajax({
        url: 'http://localhost:8080/pos/customer_servlet',
        method: 'POST',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data) {
            Swal.fire(
                'Success',
                'Customer saved successfully',
                'success'
            )

            loadAllTableCustomers();
            clear();
        },
        error: function (xhr, status, error) {
            Swal.fire(
                'Failed',
                'Check duplicate Ids',
                'error'
            )
        },
        complete: function () {
            $("#loading_div").css("display", "none");
        }
    });

});

// update
$(" #c_update ").on('click', () => {
    if (row_index == -1) {
        Swal.fire(
            'Cant Find Customer',
            'Select or search Customers',
            'question'
        )
        return;
    }

    if (!checkFields()) {
        return;
    }

    Swal.fire({
        title: 'Are you sure to update this Customer?',
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
                cId: idInput.val(),
                cName: nameInput.val(),
                cAddress: addressInput.val(),
                cSalary: salaryInput.val()
            };

            $.ajax({
                url: 'http://localhost:8080/pos/customer_servlet',
                method: 'PUT',
                dataType: 'json',
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data) {
                    Swal.fire(
                        'Success',
                        'Customer updated successfully',
                        'success'
                    )

                    loadAllTableCustomers();
                    clear();
                },
                error: function (xhr, status, error) {
                    Swal.fire(
                        'Failed',
                        'Check Ids',
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
$(" #c_delete ").on('click', () => {
    if (row_index === -1) {
        Swal.fire(
            'Cant Find Customer',
            'Select or search Customers',
            'question'
        )
        return;
    }

    Swal.fire({
        title: 'Are you sure to delete this customer ?',
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
                url: 'http://localhost:8080/pos/customer_servlet?cId=' + idInput.val(),
                method: 'DELETE',
                dataType: 'json',
                success: function (data) {
                    Swal.fire(
                        'Success',
                        'Customer deleted successfully',
                        'success'
                    )

                    loadAllTableCustomers();
                    clear();

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

        }
    });

});

// clear
$(" #c_clear ").on('click', () => {
    idInput.removeClass("is-valid was-validated form-control:valid");
    idInput.removeClass("is-invalid was-validated form-control:invalid");

    nameInput.removeClass("is-valid was-validated form-control:valid");
    nameInput.removeClass("is-invalid was-validated form-control:invalid");

    addressInput.removeClass("is-valid was-validated form-control:valid");
    addressInput.removeClass("is-invalid was-validated form-control:invalid");

    salaryInput.removeClass("is-valid was-validated form-control:valid");
    salaryInput.removeClass("is-invalid was-validated form-control:invalid");

});

// validations
let inputFields = [idInput, nameInput, addressInput, salaryInput];
let regList = [cId_reg, name_reg, name_reg, salary_reg];

for (let i = 0; i < inputFields.length; i++) {
    inputFields[i].on('input', function () {
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
    if (!cId_reg.test(idInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Customer Id Correctly !'
        });
        idInput.addClass("is-invalid was-validated form-control:invalid");
        return false;
    }

    if (!name_reg.test(nameInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Customer Name Correctly !'
        });
        nameInput.addClass("is-invalid was-validated form-control:invalid");
        return false;
    }

    if (!name_reg.test(addressInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Customer Address Correctly !'
        });
        addressInput.addClass("is-invalid was-validated form-control:invalid");
        return false;
    }

    if (!salary_reg.test(salaryInput.val())) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Fill Customer Salary Correctly !'
        });
        salaryInput.addClass("is-invalid was-validated form-control:invalid");
        return false;
    }

    return true;

}





