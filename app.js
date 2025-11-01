let budgetInput = document.getElementById("budget-input");
let budgetBtn = document.getElementById("add-budget-btn");

let expenseTitleInput = document.getElementById("expense-title-input");
let expenseAmountInput = document.getElementById("expense-amount-input");
let expenseBtn = document.getElementById("add-expense-btn");

let resetBtn = document.getElementById("reset-btn");

let budgetAmount = document.getElementById("total-budget");
let expenseAmount = document.getElementById("total-expenses");
let balanceAmount = document.getElementById("balance-amount");

let expenseList = document.getElementById("expense-items");

let totalBudget = 0;
let totalExpenses = 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];   

const currencySign = '₹';

function formatCurrency(n) {
    return currencySign + Number(n).toFixed(2);
}

function createExpenseElement(id, title, amount) {
    let li = document.createElement("li");
    
    // store id on the li for reliable lookup when deleting
    li.dataset.id = id;

    li.textContent = `${title}`;

    let span = document.createElement("span");
    span.textContent = formatCurrency(amount);

    let deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "❌";
    li.append(span, deleteBtn);
    expenseList.appendChild(li);
}

function updateDisplay() {
    budgetAmount.textContent = totalBudget.toFixed(2);

    expenseAmount.textContent = totalExpenses.toFixed(2);

    balanceAmount.textContent = (totalBudget - totalExpenses).toFixed(2);
    if (totalBudget - totalExpenses < 0) {
        balanceAmount.style.color = "red";
    } else {
        balanceAmount.style.color = "green";
    }
}

function handleAddBudget() {
    let budgetValue = parseFloat(budgetInput.value.trim());

    if (isNaN(budgetValue) || budgetValue <= 0) {
        alert("Please enter a valid budget amount.");
        return;
    }

    totalBudget = budgetValue;
    budgetInput.value = "";

    localStorage.setItem("budget", JSON.stringify(totalBudget));   // save budget to localStorage

    updateDisplay();
}

function handleAddExpense() {
    let title = expenseTitleInput.value.trim();
    let amount = parseFloat(expenseAmountInput.value.trim());

    if (title === "") {
        alert("Please enter a valid expense title.");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid expense amount.");
        return;
    }

    let id = Date.now();  // unique id based on timestamp

    expenses.push({ 
        id: id,
        title: title, 
        amount: amount 
    });
    localStorage.setItem("expenses", JSON.stringify(expenses));   // save expenses to localStorage

    createExpenseElement(id, title, amount);

    totalExpenses += amount;
    expenseTitleInput.value = "";
    expenseAmountInput.value = "";
    updateDisplay();
}

function handleDeleteExpense(e) {
    if (!e.target.classList.contains("delete-btn")) return;

    let li = e.target.parentElement;

    let id = li.dataset.id ? Number(li.dataset.id) : null;

    if (id === null) return;   // fallback: do nothing or handle gracefully

    // remove the exact expense object matching the id
    expenses = expenses.filter(exp => Number(exp.id) !== id);

    // update storage
    localStorage.setItem("expenses", JSON.stringify(expenses)); 

    // recompute totals from remaining data
    totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

    // remove the li from the DOM
    li.remove();

    updateDisplay();
}


function loadExpenses() {
    // Get saved data from localStorage
    let savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];

    // persist migrated data back to localStorage
    localStorage.setItem("expenses", JSON.stringify(expenses));

    // Set the global expenses array equal to this saved one
    expenses = savedExpenses;

    //For each saved expense, create and display it again
    expenses.forEach(exp => {
        createExpenseElement(exp.id, exp.title, exp.amount);
    });

    //Update totalExpenses from saved data
    totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    // Load saved budget (if any)
    let savedBudget = JSON.parse(localStorage.getItem("budget")) || 0;
    if (isFinite(savedBudget)) {
        totalBudget = savedBudget;
    }

    // Final Step: Update the display
    updateDisplay();
}


budgetBtn.addEventListener("click", function() {
    handleAddBudget();
    expenseTitleInput.focus();
});

expenseBtn.addEventListener("click", function() {
    handleAddExpense();
});

resetBtn.addEventListener("click", function() {
    totalBudget = 0;
    totalExpenses = 0;
    expenseList.innerHTML = "";

    localStorage.removeItem("budget");
    localStorage.removeItem("expenses");
    expenses = [];

    updateDisplay();
});

expenseList.addEventListener("click", function(e) {
    if (e.target.classList.contains("delete-btn")) {
        handleDeleteExpense(e);
    }
});

window.addEventListener('DOMContentLoaded', loadExpenses);