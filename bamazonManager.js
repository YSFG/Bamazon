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
  startPrompt();
})

const startPrompt = () => {
  inquirer.prompt({
    name: "action",
    type: "list",
    message: "Select from the menu options:",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
  })
    .then(input => {
      if (input.action === "View Products for Sale") {
        viewProd();
      } else if (input.action === "View Low Inventory") {
        viewLow();
      } else if (input.action === "Add to Inventory") {
        addInv();
      } else if (input.action === "Add New Product") {
        addNew();
      }
    });
}

const viewProd = () => {
  var productTable = new Table({
    head: ["ID", "Product", "Department", "Price", "Qty"],
    colWidths: [5, 35, 10, 10, 20]
  });
  db.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    console.log("------All Products in Inventory------")
    for (let i = 0; i < results.length; i++) {
      const prodId = results[i].id;
      const prodName = results[i].product_name;
      const departName = results[i].department_name;
      const price = results[i].price;
      const stock = results[i].stock_quantity; productTable.push(
        [prodId, prodName, departName, price, stock]
      );
    }
    console.log(productTable.toString());
    startPrompt();
  });
}

const viewLow = () => {
  var productTable = new Table({
    head: ["ID", "Product", "Department", "Price", "Qty"],
    colWidths: [5, 35, 10, 10, 20]
  });
  db.query("SELECT * FROM products WHERE stock_quantity < ?", [5], function (err, results) {
    if (err) throw err;
    console.log("------Low Inventory Item(s)------")
    for (let i = 0; i < results.length; i++) {
      const prodId = results[i].id;
      const prodName = results[i].product_name;
      const departName = results[i].department_name;
      const price = results[i].price;
      const stock = results[i].stock_quantity; productTable.push(
        [prodId, prodName, departName, price, stock]
      );
    }
    console.log(productTable.toString());
    startPrompt();
  });
}

const addInv = () => {
  const productTable = new Table({
    head: ["ID", "Product", "Qty"],
    colWidths: [5, 35, 10, 10, 20]
  });
  db.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    console.log("------Adding to Inventory Item(s)------")
    for (let i = 0; i < results.length; i++) {
      const prodId = results[i].id;
      const prodName = results[i].product_name;
      const stock = results[i].stock_quantity; productTable.push(
        [prodId, prodName, stock]
      );
    }
    console.log(productTable.toString());  
    
    inquirer.prompt([
      {
        name: "choice",
        type: "input",
        message: "Enter the ID of the item would you like to add inventory to?",
        validate: function (unitsValue) {
          if (!isNaN(unitsValue)) {
            return true;
          } else {
            return false;
          }
        }
      },
      {     
        name: "units",
        type: "input",
        message: "How many units of the product would you like to add to inventory?",
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
      db.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
       
        let chosenItem;

        for (let i = 0; i < results.length; i++) {
          if (results[i].id == userInput.choice) {
            chosenItem = results[i];
          }
        }
        // console.log(chosenItem);
        //checking if store has sufficent quantity of item chosen
        const updateStock = parseInt(chosenItem.stock_quantity) + parseInt(userInput.units);
        console.log("Updated stock: " + updateStock);

        db.query("UPDATE products SET ? WHERE ?", [{
          stock_quantity: updateStock
        }, {
          id: userInput.choice
        }], function (err, results) {
          if (err) {
            throw err
          } else {
            startPrompt();
          }
        })
      })
    });
  })
}

const addNew = () => {
  inquirer.prompt([
    {
      name: "product_name",
      message: "Product Name:",
      type: "input",
      default: "Bob Ross Wig Beard Set"
    },
    {
      name: "department_name",
      message: "Department:",
      type: "input",
      default: "Miscellaneous"
    },
    {
      name: "price",
      message: "Price:",
      type: "input",
      default: 20,
      validate: function (bidValue) {
        if (!isNaN(bidValue)) {
          return true;
        }
        else {
          return false;
        }
      }
    },
    {
      name: "stock",
      message: "Quantity:",
      type: "input",
      default: 5,
      validate: function (bidValue) {
        if (!isNaN(bidValue)) {
          return true;
        }
        else {
          return false;
        }
      }
    }
  ])
    .then(postInfo => {
      // take post info 
      db.query("INSERT INTO products SET ?", {
        product_name: postInfo.product_name,
        department_name: postInfo.department_name,
        price: parseFloat(postInfo.price),
        stock_quantity: parseFloat(postInfo.stock)
      }, (err, result) => {
        if (err) throw err;
        console.log(`Item Posted!`);
        startPrompt();
      });
    });
}


