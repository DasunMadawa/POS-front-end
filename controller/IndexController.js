import {init} from "./OrderController.js";
import {items , customers , orders} from "../db/DB.js";
import {loadAllTableCustomers} from "../controller/CustomerController.js";
import {loadAllTableItems} from "../controller/ItemController.js";

let homePage = $(" body > div:nth-child(2) ");
let customersPage = $(" body > div:nth-child(3) ");
let itemsPage = $(" body > div:nth-child(4) ");
let ordersPage = $(" body > div:nth-child(5) ");
let ordersHistoryPage = $(" body > div:nth-child(6) ");

const clear = function (){
    homePage.css("display" , "none");
    customersPage.css("display" , "none");
    itemsPage.css("display" , "none");
    ordersPage.css("display" , "none");
    ordersHistoryPage.css("display" , "none");

}

$("#home_page").on('click' , () => {
    clear();
    homePage.css("display" , "flex");
    homePageInit();

});

$("#customers_page").on('click' , () => {
    clear();
    loadAllTableCustomers()
    customersPage.css("display" , "block");
});

$("#items_page").on('click' , () => {
    clear();
    loadAllTableItems();
    itemsPage.css("display" , "block");
});

$("#orders_page").on('click' , () => {
    clear();
    ordersPage.css("display" , "block");
    init();

});

$("#orders_history_page").on('click' , () => {
    clear();
    ordersHistoryPage.css("display" , "block");
    init();

});

$("#logo").on('click' , () => {
    clear();
    $("#home_page").click();

});

$("#home_page").click();

function homePageInit() {
    let sales = 0;
    for (let i = 0; i < orders.length; i++) {
        sales+= orders[i].subTotal;
    }

    $("#items_home").text(items.length);
    $("#customers_home").text(customers.length);
    $("#orders_home").text(orders.length);
    $("#sales_home").text(sales);

}




