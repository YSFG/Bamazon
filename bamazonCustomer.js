//require dependencies
const inquirer = require("inquirer");
const mysql = require("mysql");
const Table = require("cli-table");

//set up database connection
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_db"
});

//turn on connection to database
db.connect(err => {
  if (err) throw err;

  console.log("You're now connected to the database.");
  //start our application
  startOrder();
})

const startOrder = () => {
  var productTable = new Table({
    head: ["ID", "Product", "Department", "Price", "Qty"],
    colWidths: [5,35,10,10,20]
  });
  db.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    console.log("------Welcome to BAMazon!!------")
          for (let i = 0; i < results.length; i++) {
           const prodId = results[i].id; 
           const prodName = results[i].product_name; 
           const departName = results[i].department_name;
           const price = results[i].price;
           const stock = results[i].stock_quantity;           productTable.push(
             [prodId, prodName, departName, price, stock]
           );
          }         
          console.log(productTable.toString());
  
    inquirer.prompt([
      {
        //ask user item they would like to purchase using the ID of the product 
        name: "choice",
        type: "input",
        message: "Enter the ID of the item would you like to buy?",
        validate: function (unitsValue) {
          if (!isNaN(unitsValue)) {
            return true;
          } else {
            return false;
          }
        }
      },
      {
        //then ask user how many units of the product they would like to buy
        name: "units",
        type: "input",
        message: "How many units of the product would you like to buy?",
        validate: function (unitsValue) {
          if (!isNaN(unitsValue)) {
            return true;
          } else {
            return false;
          }
        }
      }
    ]).then(userInput => {
       
      console.log(userInput);
      var chosenItem;
      
        for (var i = 0; i < results.length; i++) {
          if (results[i].id == userInput.choice) {
            chosenItem = results[i];
          }
        }
    //  console.log(chosenItem);
      //checking if store has sufficent quantity of item chosen

      if (userInput.units < chosenItem.stock_quantity) {
        // subtract amount you want to buy from current stock quantity
        
        const updatedStockQty = chosenItem.stock_quantity - userInput.units
        updateItem(chosenItem.id, updatedStockQty, chosenItem.price, userInput.units);
      }
      else{
        console.log("Sorry, not enough stock. Please try again later.");
        startOrder();
      }
  });
});
}

const updateItem = (itemId, updatedStock, itemPrice, quantityPurchased) => {
  db.query("UPDATE products SET ? WHERE ?", [
    {
      stock_quantity: updatedStock,
    },
    {
      id: itemId
    }
  ], (err, result) => {
    if (err) throw err;
    console.log("Order was placed successfully!");
    var total = itemPrice * quantityPurchased; 
    console.log("Total: " + total);
    //update product_sales column in the supervisor view
    // updateSales(total);
    startOrder();
  })
  
} 

// const updateSales = (departmentName, salesTotal) => {
//   db.query("UPDATE departments SET ? WHERE ?", [
// {
// department_name: departmentName,
// },
// {
//   product_sales: salesTotal
// }
//   ], (err, result) => {
//     if (err) throw err;
//   var sales = total + product_sales;
// }

//const departmentInfo = () => {

// }