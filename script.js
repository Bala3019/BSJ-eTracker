// Fullscreen enforcement
function enforceFullscreen() {
  // Check if launched as PWA
  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  // For non-PWA launches (direct browser access)
  if (!isPWA) {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.log("Fullscreen error:", err);
      });
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen();
    }
  }

  // iOS specific hacks
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 1000);
  }
}

// Run on load and when returning to app
window.addEventListener("load", enforceFullscreen);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    enforceFullscreen();
  }
});

// Prevent context menu
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Prevent zoom gestures
document.addEventListener("gesturestart", (e) => {
  e.preventDefault();
});

// Fullscreen management
function enterFullscreen() {
  const elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE11 */
    elem.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    /* IE11 */
    document.msExitFullscreen();
  }
}

function isFullscreen() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

// Launch fullscreen when app starts
function launchInFullscreen() {
  // Check if launched as PWA
  const isRunningAsPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (!isRunningAsPWA) {
    enterFullscreen();
  }
}

// Handle fullscreen changes
document.addEventListener("DOMContentLoaded", () => {
  launchInFullscreen();

  // Re-enter fullscreen if user exits it
  document.addEventListener("fullscreenchange", () => {
    if (!isFullscreen()) {
      enterFullscreen();
    }
  });

  document.addEventListener("webkitfullscreenchange", () => {
    if (!isFullscreen()) {
      enterFullscreen();
    }
  });

  // For iOS devices
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 100);
  }
});

// Handle visibility changes (when returning to app)
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    enterFullscreen();
  }
});

// Show app only after splash screen
document.addEventListener("DOMContentLoaded", function () {
  const splashScreen = document.querySelector(".splash-screen");

  // Wait for everything to load
  window.addEventListener("load", function () {
    // Hide splash after minimum display time
    setTimeout(function () {
      splashScreen.classList.add("hidden");

      // Show app content
      document.body.classList.add("loaded");

      // Remove splash screen from DOM after transition
      setTimeout(function () {
        splashScreen.remove();
      }, 3000);
    }, 4000); // Minimum splash display time
  });
});

// State variables
let currentDate = new Date();
let selectedDate = null;
let selectedMonth = currentDate.getMonth();
let selectedYear = currentDate.getFullYear();
let expenseData = JSON.parse(localStorage.getItem("expenseData")) || {};
let tempExpenses = [];

function getMonthName(monthIndex) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthIndex];
}

function formatCurrency(amount) {
  return "₹" + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}

function addPageNumbers(pdf) {
  const pageCount = pdf.internal.getNumberOfPages();
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 20, pdfHeight - 10, {
      align: "right",
    });
    // Add a light separator line
    pdf.setDrawColor(200);
    pdf.line(20, pdfHeight - 15, pdfWidth - 20, pdfHeight - 15);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const addExpenseBtn = document.getElementById("addExpenseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const expenseModal = document.getElementById("expenseModal");
  const openingBalanceModal = document.getElementById("openingBalanceModal");
  const expenseEntryModal = document.getElementById("expenseEntryModal");
  const addFromSavingsModal = document.getElementById("addFromSavingsModal");
  const monthReportModal = document.getElementById("monthReportModal");
  const closeButtons = document.querySelectorAll(".close");
  const openingBalanceBtn = document.getElementById("openingBalanceBtn");
  const addFromSavingsBtn = document.getElementById("addFromSavingsBtn");
  const viewReportBtn = document.getElementById("viewReportBtn");
  const submitOpeningBalance = document.getElementById("submitOpeningBalance");
  const openingBalanceInput = document.getElementById("openingBalanceInput");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const currentMonthYear = document.getElementById("currentMonthYear");
  const calendar = document.getElementById("calendar");
  const addNewExpenseRow = document.getElementById("addNewExpenseRow");
  const submitExpenses = document.getElementById("submitExpenses");
  const expenseEntries = document.getElementById("expenseEntries");
  const expenseDateTitle = document.getElementById("expenseDateTitle");
  const totalSavingsDisplay = document.getElementById("totalSavingsDisplay");
  const addFromSavingsInput = document.getElementById("addFromSavingsInput");
  const submitAddFromSavings = document.getElementById("submitAddFromSavings");
  const monthReportTitle = document.getElementById("monthReportTitle");
  const monthReportContent = document.getElementById("monthReportContent");
  const downloadReportBtn = document.getElementById("downloadReportBtn");
  const downloadSavingsBtn = document.getElementById("downloadSavingsBtn");

  // Dashboard elements
  const totalSpendingElement = document.getElementById("totalSpending");
  const totalSavingsElement = document.getElementById("totalSavings");
  const totalOnHandElement = document.getElementById("totalOnHand");

  const savingsDetailsModal = document.getElementById("savingsDetailsModal");
  const savingsDetailsContent = document.getElementById(
    "savingsDetailsContent"
  );

  // Initialize the app
  initApp();

  // Event Listeners
  document
    .getElementById("savingsCard")
    .addEventListener("click", showSavingsDetails);

  document
    .getElementById("downloadSavingsBtn")
    .addEventListener("click", function () {
      downloadSavingsReport();
    });

  addExpenseBtn.addEventListener("click", function () {
    // Reset to current month when opening the modal
    selectedMonth = new Date().getMonth();
    selectedYear = new Date().getFullYear();

    expenseModal.style.display = "block";
    renderCalendar(selectedMonth, selectedYear);
  });

  resetBtn.addEventListener("click", async function () {
    if (
      confirm(
        "This will download:\n1. Individual monthly reports\n2. A complete overall report\n3. Savings breakdown report\nThen Permanently delete all data. Continue?"
      )
    ) {
      try {
        resetBtn.disabled = true;
        resetBtn.textContent = "Generating reports...";

        // Generate savings report first
        const savingsReportBlob = await generateSavingsReportForZip();

        // Now download all reports and include the savings report
        await downloadAllReports(savingsReportBlob);

        localStorage.removeItem("expenseData");
        expenseData = {};
        initApp();

        alert("All reports downloaded successfully. Data has been reset.");
      } catch (error) {
        console.error("Reset error:", error);
        alert("Error during report generation. Data was NOT deleted.");
      } finally {
        resetBtn.disabled = false;
        resetBtn.textContent = "Backup & Reset";
      }
    }
  });

  closeButtons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      const modal = e.target.closest(".modal");
      if (modal) {
        modal.style.display = "none";
      }

      if (modal && modal.id !== "expenseModal") {
        expenseModal.style.display = "block";
      }
    });
  });

  openingBalanceBtn.addEventListener("click", function () {
    const monthKey = `${selectedYear}-${selectedMonth + 1}`;
    const prevMonthKey = getPreviousMonthKey(selectedMonth, selectedYear);

    // Check if opening balance is already set
    if (expenseData[monthKey] && expenseData[monthKey].openingBalance > 0) {
      alert("Opening balance for this month is already set.");
      return;
    }

    openingBalanceInput.value = "";
    openingBalanceModal.style.display = "block";
  });

  addFromSavingsBtn.addEventListener("click", function () {
    const monthKey = `${selectedYear}-${selectedMonth + 1}`;

    // Check if opening balance is set
    if (!expenseData[monthKey] || expenseData[monthKey].openingBalance <= 0) {
      alert("Please set opening balance for this month first");
      return;
    }

    // Calculate total available savings (excluding current month)
    const totalSavings = calculateTotalAvailableSavings(monthKey);

    if (totalSavings <= 0) {
      alert("No savings available to add");
      return;
    }

    totalSavingsDisplay.textContent = formatCurrency(totalSavings);
    addFromSavingsInput.value = "";
    addFromSavingsInput.max = totalSavings.toFixed(2); // Set max allowed value
    addFromSavingsModal.style.display = "block";
  });

  addFromSavingsInput.addEventListener("input", function () {
    const amount = parseFloat(this.value) || 0;
    const monthKey = `${selectedYear}-${selectedMonth + 1}`;
    const totalSavings = calculateTotalAvailableSavings(monthKey);

    // Visual feedback
    if (amount > totalSavings) {
      this.style.borderColor = "var(--errorColor)";
      submitAddFromSavings.disabled = true;
      submitAddFromSavings.title = `Amount exceeds available savings by ₹${(
        amount - totalSavings
      ).toFixed(2)}`;
    } else {
      this.style.borderColor = "";
      submitAddFromSavings.disabled = false;
      submitAddFromSavings.title = "";
    }
  });

  viewReportBtn.addEventListener("click", function () {
    const monthKey = `${selectedYear}-${selectedMonth + 1}`;
    if (expenseData[monthKey] && expenseData[monthKey].openingBalance > 0) {
      showMonthReport(selectedMonth, selectedYear);
    } else {
      alert("Please set opening balance for this month first");
    }
  });

  submitOpeningBalance.addEventListener("click", function () {
    const amount = parseFloat(openingBalanceInput.value);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const monthKey = `${selectedYear}-${selectedMonth + 1}`;
    const prevMonthKey = getPreviousMonthKey(selectedMonth, selectedYear);

    // Check if opening balance is already set for this month
    if (expenseData[monthKey] && expenseData[monthKey].openingBalance > 0) {
      alert("Opening balance for this month is already set.");
      return;
    }

    // Move previous month's on-hand to savings if it exists
    if (prevMonthKey && expenseData[prevMonthKey]) {
      const prevOnHand = expenseData[prevMonthKey].onHand || 0;

      if (prevOnHand > 0) {
        // Add to previous month's savings
        expenseData[prevMonthKey].savings =
          (expenseData[prevMonthKey].savings || 0) + prevOnHand;
        expenseData[prevMonthKey].onHand = 0;

        // Lock the previous month
        expenseData[prevMonthKey].isLocked = true;
        expenseData[prevMonthKey].isClosed = true;

        // Show alert with month name
        const prevMonth = selectedMonth - 1 < 0 ? 11 : selectedMonth - 1;
        const prevMonthName = getMonthName(prevMonth);
        alert(
          `₹${prevOnHand.toFixed(
            2
          )} on-hand amount from ${prevMonthName} month moved to savings`
        );
      }
    }

    // Initialize current month data
    expenseData[monthKey] = {
      openingBalance: amount,
      expenses: {},
      onHand: amount,
      savings: 0,
      addedFromSavings: 0,
      isLocked: false,
      isClosed: false,
    };

    openingBalanceInput.value = "";
    openingBalanceModal.style.display = "none";
    saveData();

    // Re-render both months to reflect changes
    if (prevMonthKey) {
      const prevMonth = selectedMonth - 1 < 0 ? 11 : selectedMonth - 1;
      const prevYear = selectedMonth - 1 < 0 ? selectedYear - 1 : selectedYear;
      renderCalendar(prevMonth, prevYear);
    }

    renderCalendar(selectedMonth, selectedYear);
    updateDashboard();
  });

  submitAddFromSavings.addEventListener("click", function () {
    const amount = parseFloat(addFromSavingsInput.value);
    const monthKey = `${selectedYear}-${selectedMonth + 1}`;

    // Calculate total available savings (from all months except current month)
    let totalSavings = 0; // Changed from const to let

    for (const month in expenseData) {
      if (month !== monthKey) {
        totalSavings += expenseData[month].savings || 0;
      }
    }

    // Validation checks
    if (isNaN(amount)) {
      alert("Please enter a valid amount");
      return;
    }

    if (amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    if (amount > totalSavings) {
      alert(
        `Amount (₹${amount.toFixed(
          2
        )}) exceeds available savings (₹${totalSavings.toFixed(2)})`
      );
      return;
    }

    // Deduct from savings (from oldest months first)
    let remainingAmount = amount;
    const months = Object.keys(expenseData).sort(); // Sort months chronologically

    for (const month of months) {
      if (remainingAmount <= 0) break;
      if (month === monthKey) continue; // Skip current month

      if (expenseData[month].savings > 0) {
        const deduction = Math.min(expenseData[month].savings, remainingAmount);
        expenseData[month].savings -= deduction;
        remainingAmount -= deduction;
      }
    }

    // Add to current month
    expenseData[monthKey].onHand += amount;
    expenseData[monthKey].addedFromSavings =
      (expenseData[monthKey].addedFromSavings || 0) + amount;

    addFromSavingsInput.value = "";
    addFromSavingsModal.style.display = "none";
    saveData();

    // Re-render the current month to reflect changes
    renderCalendar(selectedMonth, selectedYear);
    updateDashboard();
  });

  prevMonthBtn.addEventListener("click", function () {
    selectedMonth--;
    if (selectedMonth < 0) {
      selectedMonth = 11;
      selectedYear--;
    }
    renderCalendar(selectedMonth, selectedYear);
  });

  nextMonthBtn.addEventListener("click", function () {
    selectedMonth++;
    if (selectedMonth > 11) {
      selectedMonth = 0;
      selectedYear++;
    }
    renderCalendar(selectedMonth, selectedYear);
  });

  addNewExpenseRow.addEventListener("click", function () {
    addExpenseRow();
  });

  submitExpenses.addEventListener("click", function () {
    saveExpenses();
  });

  // Close modals when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === expenseModal) expenseModal.style.display = "none";
    if (event.target === openingBalanceModal)
      openingBalanceModal.style.display = "none";
    if (event.target === expenseEntryModal)
      expenseEntryModal.style.display = "none";
    if (event.target === addFromSavingsModal)
      addFromSavingsModal.style.display = "none";
    if (event.target === monthReportModal)
      monthReportModal.style.display = "none";
    if (event.target === savingsDetailsModal)
      savingsDetailsModal.style.display = "none";
  });

  downloadReportBtn.addEventListener("click", function () {
    const monthName = getMonthName(selectedMonth);
    downloadMonthReport(monthName, selectedYear);
  });

  // Functions
  function getDayNames() {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  }

  function formatDateWithDay(date, format = "full") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = getMonthName(date.getMonth());
    const year = date.getFullYear();

    if (format === "short") {
      return `${dayName.substring(0, 3)}, ${day} ${month.substring(
        0,
        3
      )} ${year}`;
    }
    return `${dayName}, ${day} ${month} ${year}`;
  }

  function initApp() {
    updateDashboard();
    renderCalendar(selectedMonth, selectedYear);
  }

  function updateDashboard() {
    let totalSpending = 0;
    let totalSavings = 0;
    let totalOnHand = 0;

    for (const monthKey in expenseData) {
      const monthData = expenseData[monthKey];

      // Calculate total spending for the month
      let monthSpending = 0;
      for (const date in monthData.expenses) {
        monthSpending += monthData.expenses[date].reduce(function (
          sum,
          expense
        ) {
          return sum + expense.amount;
        },
        0);
      }

      totalSpending += monthSpending;
      totalSavings += monthData.savings || 0;
      totalOnHand += monthData.onHand || 0;
    }

    totalSpendingElement.textContent = formatCurrency(totalSpending);
    totalSavingsElement.textContent = formatCurrency(totalSavings);
    totalOnHandElement.textContent = formatCurrency(totalOnHand);
  }

  function renderCalendar(month, year) {
    currentMonthYear.textContent = `${getMonthName(month)} ${year}`;
    calendar.innerHTML = "";

    // Add day headers
    const dayNames = getDayNames();
    dayNames.forEach((day) => {
      const dayHeader = document.createElement("div");
      dayHeader.className = "calendar-day-header";
      dayHeader.textContent = day;
      calendar.appendChild(dayHeader);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthKey = `${year}-${month + 1}`;
    const currentDate = new Date();
    const isCurrentMonth =
      month === currentDate.getMonth() && year === currentDate.getFullYear();

    // Check if this month is before any month that has an opening balance set
    const hasFutureOpeningBalance = hasOpeningBalanceInFutureMonths(
      month,
      year
    );
    const isLocked =
      hasFutureOpeningBalance ||
      (expenseData[monthKey] && expenseData[monthKey].isLocked) ||
      (expenseData[monthKey] && expenseData[monthKey].isClosed);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "calendar-day empty";
      calendar.appendChild(emptyDay);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";
      dayElement.textContent = day;

      const dateKey = `${year}-${month + 1}-${day}`;

      if (expenseData[monthKey] && expenseData[monthKey].expenses[dateKey]) {
        dayElement.classList.add("has-expense");
      }

      if (expenseData[monthKey] && expenseData[monthKey].openingBalance > 0) {
        dayElement.classList.add("opening-set");
      }

      if (isLocked) {
        dayElement.classList.add("locked");
        dayElement.style.opacity = "0.5";
        dayElement.style.cursor = "not-allowed";
      } else {
        dayElement.addEventListener("click", function () {
          handleDateClick(day, month, year);
        });
      }

      calendar.appendChild(dayElement);
    }

    // Update button states
    const hasOpeningBalance =
      expenseData[monthKey] && expenseData[monthKey].openingBalance > 0;
    openingBalanceBtn.disabled = hasOpeningBalance || isLocked;
    openingBalanceBtn.style.opacity = openingBalanceBtn.disabled ? 0.5 : 1;
    openingBalanceBtn.style.cursor = openingBalanceBtn.disabled
      ? "not-allowed"
      : "pointer";

    addFromSavingsBtn.disabled = isLocked || !hasOpeningBalance;
    addFromSavingsBtn.style.opacity = addFromSavingsBtn.disabled ? 0.5 : 1;
    addFromSavingsBtn.style.cursor = addFromSavingsBtn.disabled
      ? "not-allowed"
      : "pointer";

    viewReportBtn.style.display =
      expenseData[monthKey] &&
      (expenseData[monthKey].openingBalance > 0 ||
        Object.keys(expenseData[monthKey].expenses || {}).length > 0)
        ? "block"
        : "none";
  }

  function hasOpeningBalanceInFutureMonths(currentMonth, currentYear) {
    const currentDate = new Date(currentYear, currentMonth);

    // Check all months in expenseData
    for (const monthKey in expenseData) {
      if (expenseData[monthKey].openingBalance > 0) {
        const [year, month] = monthKey.split("-").map(Number);
        const monthDate = new Date(year, month - 1); // month is 1-12 in key

        // If this month is after the current month we're checking
        if (monthDate > currentDate) {
          return true;
        }
      }
    }
    return false;
  }

  function lockPreviousMonths(currentMonth, currentYear) {
    const currentDate = new Date(currentYear, currentMonth);

    // Loop through all months in expenseData
    for (const monthKey in expenseData) {
      const [year, month] = monthKey.split("-").map(Number);
      const monthDate = new Date(year, month - 1); // month is 1-12 in key

      // If this month is before the current month
      if (monthDate < currentDate) {
        expenseData[monthKey].isLocked = true;
        expenseData[monthKey].isClosed = true;
      }
    }
  }

  function handleDateClick(day, month, year) {
    const monthKey = `${year}-${month + 1}`;
    const isLocked =
      (expenseData[monthKey] && expenseData[monthKey].isLocked) ||
      (expenseData[monthKey] && expenseData[monthKey].isClosed);

    // Prevent adding expenses to locked/closed months
    if (isLocked) {
      alert("This month is locked. You cannot add new expenses.");
      return;
    }

    selectedDate = new Date(year, month, day);
    const dateKey = `${year}-${month + 1}-${day}`;

    // Check if opening balance is set for this month
    if (!expenseData[monthKey] || expenseData[monthKey].openingBalance <= 0) {
      alert("Please set the opening balance for this month first");
      return;
    }

    // Calculate available balance
    const availableBalance = calculateAvailableBalance(monthKey);
    if (availableBalance <= 0) {
      alert(
        `No available balance remaining for ${getMonthName(month)} ${year}`
      );
      return;
    }

    // Prepare the expense entry modal
    const dateObj = new Date(year, month, day);
    expenseDateTitle.textContent = `Expenses for ${formatDateWithDay(dateObj)}`;
    expenseDateTitle.style.fontSize = "20px";
    expenseEntries.innerHTML = "";
    tempExpenses = [];

    // If there are existing expenses for this date, load them
    if (expenseData[monthKey] && expenseData[monthKey].expenses[dateKey]) {
      expenseData[monthKey].expenses[dateKey].forEach(function (expense) {
        addExpenseRow(expense.category, expense.amount);
      });
    } else {
      addExpenseRow();
    }

    expenseEntryModal.style.display = "block";
  }

  function calculateAvailableBalance(monthKey) {
    if (!expenseData[monthKey]) return 0;

    const monthData = expenseData[monthKey];
    let totalExpenses = 0;

    // Sum all existing expenses
    for (const date in monthData.expenses) {
      totalExpenses += monthData.expenses[date].reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
    }

    return (
      monthData.openingBalance +
      (monthData.addedFromSavings || 0) -
      totalExpenses
    );
  }

  function addExpenseRow(category = "", amount = "") {
    const rowId = Date.now();
    const row = document.createElement("div");
    row.className = "expense-row";
    row.dataset.id = rowId;

    row.innerHTML = `
      <input type="text" placeholder="Category" value="${category}" required>
      <input type="number" placeholder="Amount" min="0.01" step="0.01" value="${amount}" required>
      <button class="remove-expense">Remove</button>
    `;

    expenseEntries.appendChild(row);

    // Add input validation
    const categoryInput = row.querySelector('input[type="text"]');
    const amountInput = row.querySelector('input[type="number"]');

    categoryInput.addEventListener("input", function () {
      validateExpenseRow(row);
    });

    amountInput.addEventListener("input", function () {
      validateExpenseRow(row);
      validateExpenseAmounts();
    });

    // Add event listener to the remove button
    row.querySelector(".remove-expense").addEventListener("click", function () {
      row.remove();
      tempExpenses = tempExpenses.filter(function (exp) {
        return exp.id !== rowId;
      });
      validateExpenseAmounts();
    });

    // Add to temp expenses
    tempExpenses.push({
      id: rowId,
      category: category,
      amount: amount ? parseFloat(amount) : 0,
    });
  }

  function validateExpenseRow(row) {
    const categoryInput = row.querySelector('input[type="text"]');
    const amountInput = row.querySelector('input[type="number"]');

    // Validate category
    if (!categoryInput.value.trim()) {
      categoryInput.style.borderColor = "var(--errorColor)";
    } else {
      categoryInput.style.borderColor = "";
    }

    // Validate amount
    if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
      amountInput.style.borderColor = "var(--errorColor)";
    } else {
      amountInput.style.borderColor = "";
    }

    // Update submit button state
    validateSubmitButton();
  }

  function validateExpenseAmounts() {
    validateSubmitButton();
  }

  function validateSubmitButton() {
    const rows = expenseEntries.querySelectorAll(".expense-row");
    let allValid = true;

    // Check each row for validity
    rows.forEach((row) => {
      const categoryInput = row.querySelector('input[type="text"]');
      const amountInput = row.querySelector('input[type="number"]');

      if (
        !categoryInput.value.trim() ||
        !amountInput.value ||
        parseFloat(amountInput.value) <= 0
      ) {
        allValid = false;
      }
    });

    // Also check total amount validation
    const monthKey = `${selectedDate.getFullYear()}-${
      selectedDate.getMonth() + 1
    }`;
    const availableBalance = calculateAvailableBalance(monthKey);
    const currentTotal = calculateCurrentExpenseTotal();

    submitExpenses.disabled = !allValid || currentTotal > availableBalance;

    if (!allValid) {
      submitExpenses.title =
        "Please fill all required fields with valid values";
    } else if (currentTotal > availableBalance) {
      submitExpenses.title = `Total exceeds available balance by ₹${(
        currentTotal - availableBalance
      ).toFixed(2)}`;
    } else {
      submitExpenses.title = "";
    }

    submitExpenses.style.opacity = submitExpenses.disabled ? 0.5 : 1;
    submitExpenses.style.cursor = submitExpenses.disabled
      ? "not-allowed"
      : "pointer";
  }

  function calculateCurrentExpenseTotal() {
    const rows = expenseEntries.querySelectorAll(".expense-row");
    let total = 0;

    rows.forEach((row) => {
      const amountInput = row.querySelector('input[type="number"]');
      total += parseFloat(amountInput.value) || 0;
    });

    return total;
  }

  function calculateTotalAvailableSavings(currentMonthKey) {
    let totalSavings = 0;

    for (const monthKey in expenseData) {
      if (monthKey !== currentMonthKey) {
        totalSavings += expenseData[monthKey].savings || 0;
      }
    }

    return totalSavings;
  }

  function saveExpenses() {
    // First validate all rows
    const rows = expenseEntries.querySelectorAll(".expense-row");
    let hasErrors = false;

    rows.forEach((row) => {
      validateExpenseRow(row);
      const categoryInput = row.querySelector('input[type="text"]');
      const amountInput = row.querySelector('input[type="number"]');

      if (
        !categoryInput.value.trim() ||
        !amountInput.value ||
        parseFloat(amountInput.value) <= 0
      ) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      alert("Please fill all required fields with valid values");
      return;
    }

    // Rest of the saveExpenses function remains the same...
    const dateKey = `${selectedDate.getFullYear()}-${
      selectedDate.getMonth() + 1
    }-${selectedDate.getDate()}`;
    const monthKey = `${selectedDate.getFullYear()}-${
      selectedDate.getMonth() + 1
    }`;

    // Calculate available balance before saving
    const availableBalance = calculateAvailableBalance(monthKey);

    // Calculate total of new expenses being added
    const newExpensesTotal = tempExpenses.reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0
    );

    // Check if this would exceed available balance
    if (newExpensesTotal > availableBalance) {
      alert(
        `Cannot save expenses. Total (₹${newExpensesTotal.toFixed(
          2
        )}) exceeds available balance (₹${availableBalance.toFixed(2)})`
      );
      return;
    }

    // Update tempExpenses with current values
    rows.forEach(function (row) {
      const inputs = row.querySelectorAll("input");
      const rowId = parseInt(row.dataset.id);
      const expenseIndex = tempExpenses.findIndex(function (exp) {
        return exp.id === rowId;
      });

      if (expenseIndex !== -1) {
        tempExpenses[expenseIndex].category = inputs[0].value;
        tempExpenses[expenseIndex].amount = parseFloat(inputs[1].value) || 0;
      }
    });

    // Filter out empty rows
    const validExpenses = tempExpenses.filter(function (exp) {
      return exp.category.trim() && exp.amount > 0;
    });

    if (validExpenses.length === 0) {
      // No valid expenses, remove the date entry if it exists
      if (expenseData[monthKey] && expenseData[monthKey].expenses[dateKey]) {
        delete expenseData[monthKey].expenses[dateKey];
      }
    } else {
      // Ensure month data exists
      if (!expenseData[monthKey]) {
        expenseData[monthKey] = {
          openingBalance: 0,
          expenses: {},
          onHand: 0,
          savings: 0,
          addedFromSavings: 0,
        };
      }

      // Calculate total amount for this date
      const totalAmount = validExpenses.reduce(function (sum, exp) {
        return sum + exp.amount;
      }, 0);

      // Update expenses for this date
      expenseData[monthKey].expenses[dateKey] = validExpenses.map(function (
        exp
      ) {
        return {
          category: exp.category,
          amount: exp.amount,
        };
      });

      // Calculate total spent so far this month (including this date)
      let totalSpentThisMonth = 0;
      for (const date in expenseData[monthKey].expenses) {
        totalSpentThisMonth += expenseData[monthKey].expenses[date].reduce(
          function (sum, exp) {
            return sum + exp.amount;
          },
          0
        );
      }

      // Update on-hand balance
      expenseData[monthKey].onHand =
        expenseData[monthKey].openingBalance +
        (expenseData[monthKey].addedFromSavings || 0) -
        totalSpentThisMonth;
    }

    saveData();
    expenseEntryModal.style.display = "none";
    renderCalendar(selectedDate.getMonth(), selectedDate.getFullYear());
    updateDashboard();
  }

  function showMonthReport(month, year) {
    const monthKey = `${year}-${month + 1}`;
    monthReportTitle.textContent = `Report for ${getMonthName(month)} ${year}`;
    monthReportTitle.style.fontSize = "20px";
    monthReportContent.innerHTML = "";

    if (!expenseData[monthKey]) {
      monthReportContent.innerHTML = "<p>No data available for this month.</p>";
      monthReportModal.style.display = "block";
      return;
    }

    // Get all dates with expenses and sort them numerically
    const dates = Object.keys(expenseData[monthKey].expenses).sort(function (
      a,
      b
    ) {
      const dayA = parseInt(a.split("-")[2]);
      const dayB = parseInt(b.split("-")[2]);
      return dayA - dayB;
    });

    // Add each date's expenses
    dates.forEach(function (date) {
      const dateParts = date.split("-");
      const day = parseInt(dateParts[2]);
      const dateItem = document.createElement("div");
      dateItem.className = "month-report-item";
      const dateObj = new Date(year, month, day);

      let expensesHtml = `<div class="month-report-date">${formatDateWithDay(
        dateObj
      )}</div>`;

      expenseData[monthKey].expenses[date].forEach(function (expense) {
        expensesHtml += `
          <div class="expense-item">
            <span>${expense.category}</span>
            <span>${formatCurrency(expense.amount)}</span>
          </div>
        `;
      });

      // Add total for this date
      const dateTotal = expenseData[monthKey].expenses[date].reduce(function (
        sum,
        exp
      ) {
        return sum + exp.amount;
      },
      0);
      expensesHtml += `
        <div class="expense-item" style="font-weight: bold; margin-top: 5px;">
          <span>Total</span>
          <span>${formatCurrency(dateTotal)}</span>
        </div>
      `;

      dateItem.innerHTML = expensesHtml;
      monthReportContent.appendChild(dateItem);
    });

    // Add month summary
    const summary = document.createElement("div");
    summary.style.marginTop = "40px";
    summary.style.pageBreakBefore = "auto";
    summary.style.pageBreakInside = "avoid";
    summary.className = "month-summary";

    let totalExpenses = 0;
    for (const date in expenseData[monthKey].expenses) {
      totalExpenses += expenseData[monthKey].expenses[date].reduce(function (
        sum,
        exp
      ) {
        return sum + exp.amount;
      },
      0);
    }

    let addedFromSavingsHtml = "";
    if (expenseData[monthKey].addedFromSavings > 0) {
      addedFromSavingsHtml = `
        <div class="month-summary-item">
          <span>Added from Savings:</span>
          <span>${formatCurrency(expenseData[monthKey].addedFromSavings)}</span>
        </div>
      `;
    }

    summary.innerHTML = `
      ${addedFromSavingsHtml}
      <div class="month-summary-item">
        <span>Opening Balance:</span>
        <span>${formatCurrency(expenseData[monthKey].openingBalance)}</span>
      </div>
      <div class="month-summary-item">
        <span>Total Expenses:</span>
        <span>${formatCurrency(totalExpenses)}</span>
      </div>
      <div class="month-summary-item">
        <span>On-Hand Balance:</span>
        <span>${formatCurrency(expenseData[monthKey].onHand)}</span>
      </div>
      <div class="month-summary-item">
        <span>Saved This Month:</span>
        <span>${formatCurrency(expenseData[monthKey].savings || 0)}</span>
      </div>
    `;

    monthReportContent.appendChild(summary);
    monthReportModal.style.display = "block";
  }

  function getPreviousMonthKey(currentMonth, currentYear) {
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;

    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }

    return `${prevYear}-${prevMonth + 1}`;
  }

  function isCurrentMonthYear(month, year) {
    const currentDate = new Date();
    return (
      month === currentDate.getMonth() && year === currentDate.getFullYear()
    );
  }

  function saveData() {
    localStorage.setItem("expenseData", JSON.stringify(expenseData));
  }

  function downloadMonthReport(monthName, year) {
    const monthKey = `${year}-${selectedMonth + 1}`; // Changed from month to selectedMonth

    // Create a container for the PDF content
    const element = document.createElement("div");
    element.style.textAlign = "center";
    element.style.padding = "0 20px"; // Horizontal padding only

    // Add Logo
    const logo = document.createElement("img");
    logo.src = "images/eTracker_Black.png";
    logo.style.width = "50px";
    logo.style.height = "auto";
    element.appendChild(logo);
    logo.style.pageBreakAfter = "avoid";

    // Add title
    const title = document.createElement("h2");
    title.textContent = `Expense Report - ${monthName} ${year}`;
    title.style.textAlign = "center";
    title.style.margin = "20px 0";
    element.appendChild(title);

    // Add generation timestamp
    // const timestamp = document.createElement("p");
    // timestamp.textContent = `Report generated: ${new Date().toLocaleString()}`;
    // timestamp.style.textAlign = "center";
    // timestamp.style.margin = "0 0 20px 0";
    // timestamp.style.color = "#666";
    // timestamp.style.fontSize = "14px";
    // element.appendChild(timestamp);

    // Clone the report content
    const reportContent = document
      .getElementById("monthReportContent")
      .cloneNode(true);
    element.style.pageBreakAfter = "avoid";
    element.appendChild(reportContent);

    // PDF options
    const opt = {
      margin: [15, 15, 25, 15], // top, right, bottom, left (extra bottom space for footer)
      filename: `Expense_Report_${monthName}_${year}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        hotfixes: ["px_scaling"],
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        before: ".page-break-before",
        after: ".page-break-after",
        avoid: ".avoid-break",
      },
    };

    // Generate PDF with page numbers
    html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .get("pdf")
      .then(function (pdf) {
        addPageNumbers(pdf);
        pdf.save(opt.filename);
      });
  }

  async function downloadAllReports(savingsReportBlob) {
    const monthsWithData = Object.keys(expenseData).filter(
      (key) =>
        expenseData[key].openingBalance > 0 ||
        Object.keys(expenseData[key].expenses || {}).length > 0
    );

    if (monthsWithData.length === 0) {
      return Promise.resolve();
    }

    const zip = new JSZip();
    const html2pdf = window.html2pdf;

    // Add savings report to zip if it exists
    if (savingsReportBlob) {
      zip.file("Savings_Breakdown_Report.pdf", savingsReportBlob);
    }

    // Create container for the overall report
    const overallReport = document.createElement("div");
    overallReport.style.padding = "0 20px";

    const overallTitle = document.createElement("h1");
    overallTitle.textContent = "Complete Expense Report";
    overallTitle.style.textAlign = "center";
    overallTitle.style.margin = "40px";
    overallReport.appendChild(overallTitle);

    // Process each month
    for (const monthKey of monthsWithData) {
      const [year, month] = monthKey.split("-").map(Number);
      const monthName = getMonthName(month - 1);

      // Generate individual PDF
      const pdfContent = generateReportContent(month - 1, year);
      const opt = {
        margin: [15, 15, 25, 15],
        filename: `Expense_Report_${monthName}_${year}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      const pdfBlob = await html2pdf()
        .set(opt)
        .from(pdfContent)
        .toPdf()
        .get("pdf")
        .then(function (pdf) {
          addPageNumbers(pdf);
          return pdf.output("blob");
        });

      zip.file(opt.filename, pdfBlob);
      overallReport.style.pageBreakAfter = "avoid";
      pdfContent.style.pageBreakAfter = "avoid";
      overallReport.appendChild(pdfContent.cloneNode(true));
    }

    // Generate overall PDF
    const overallOpt = {
      margin: [15, 15, 25, 15],
      filename: `Complete_Expense_Report.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    const overallPdf = await html2pdf()
      .set(overallOpt)
      .from(overallReport)
      .toPdf()
      .get("pdf")
      .then(function (pdf) {
        addPageNumbers(pdf);
        return pdf.output("blob");
      });

    zip.file(overallOpt.filename, overallPdf);

    // Generate and download ZIP
    const zipContent = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipContent);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Expense_Reports_Backup.zip";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  async function generateIndividualReportForZip(month, year) {
    const monthName = getMonthName(month);
    const pdfContent = generateReportContent(month, year);

    const opt = {
      margin: [15, 15, 25, 15],
      filename: `Expense_Report_${monthName}_${year}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        logging: false,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        hotfixes: ["px_scaling"],
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        before: ".page-break-before",
        after: ".page-break-after",
        avoid: ".avoid-break",
      },
    };

    return html2pdf()
      .set(opt)
      .from(pdfContent)
      .toPdf()
      .get("pdf")
      .then(function (pdf) {
        addPageNumbers(pdf);
        return pdf.output("blob");
      });
  }

  function generateReportContent(month, year) {
    const monthKey = `${year}-${month + 1}`;
    const monthName = getMonthName(month);

    // Create a container for the PDF content
    const element = document.createElement("div");
    element.style.textAlign = "center";
    element.style.padding = "0 20px";

    // Add Logo
    const logo = document.createElement("img");
    logo.src = "images/eTracker_Black.png";
    logo.style.width = "50px";
    logo.style.height = "auto";
    element.appendChild(logo);
    logo.style.pageBreakAfter = "avoid";

    // Add title
    const title = document.createElement("h2");
    title.textContent = `Expense Report - ${monthName} ${year}`;
    title.style.textAlign = "center";
    title.style.marginBottom = "20px";
    title.style.pageBreakAfter = "avoid";
    element.appendChild(title);

    // Add date and time
    const dateTime = document.createElement("p");
    dateTime.textContent = `Generated on: ${new Date().toLocaleString()}`;
    dateTime.style.textAlign = "center";
    dateTime.style.marginBottom = "20px";
    dateTime.style.color = "#666";
    title.style.pageBreakAfter = "avoid";
    element.appendChild(dateTime);

    // Create a temporary container for the report content
    const tempContainer = document.createElement("div");

    // Get all dates with expenses and sort them
    const dates = Object.keys(expenseData[monthKey].expenses || {}).sort(
      (a, b) => {
        return parseInt(a.split("-")[2]) - parseInt(b.split("-")[2]);
      }
    );

    // Add each date's expenses
    dates.forEach((date) => {
      const dateParts = date.split("-");
      const day = parseInt(dateParts[2]);
      const dateItem = document.createElement("div");
      dateItem.className = "month-report-item";
      const dateObj = new Date(year, month, day);

      let expensesHtml = `<div class="month-report-date">${formatDateWithDay(
        dateObj
      )}</div>`;

      expenseData[monthKey].expenses[date].forEach((expense) => {
        expensesHtml += `
        <div class="expense-item">
          <span>${expense.category}</span>
          <span>${formatCurrency(expense.amount)}</span>
        </div>
      `;
      });

      // Add total for this date
      const dateTotal = expenseData[monthKey].expenses[date].reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      expensesHtml += `
      <div class="expense-item" style="font-weight: bold; margin-top: 5px;">
        <span>Total</span>
        <span>${formatCurrency(dateTotal)}</span>
      </div>
    `;

      dateItem.innerHTML = expensesHtml;
      tempContainer.style.pageBreakAfter = "avoid";
      tempContainer.appendChild(dateItem);
    });

    // Add month summary
    const summary = document.createElement("div");
    summary.style.marginTop = "40px";
    summary.style.marginBottom = "80px";
    summary.style.pageBreakBefore = "auto";
    summary.style.pageBreakInside = "avoid";
    summary.className = "month-summary";

    let totalExpenses = 0;
    for (const date in expenseData[monthKey].expenses || {}) {
      totalExpenses += expenseData[monthKey].expenses[date].reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
    }

    let addedFromSavingsHtml = "";
    if (expenseData[monthKey].addedFromSavings > 0) {
      addedFromSavingsHtml = `
      <div class="month-summary-item">
        <span>Added from Savings:</span>
        <span>${formatCurrency(expenseData[monthKey].addedFromSavings)}</span>
      </div>
    `;
    }

    summary.innerHTML = `
    ${addedFromSavingsHtml}
    <div class="month-summary-item">
      <span>Opening Balance:</span>
      <span>${formatCurrency(expenseData[monthKey].openingBalance)}</span>
    </div>
    <div class="month-summary-item">
      <span>Total Expenses:</span>
      <span>${formatCurrency(totalExpenses)}</span>
    </div>
    <div class="month-summary-item">
      <span>On-Hand Balance:</span>
      <span>${formatCurrency(expenseData[monthKey].onHand)}</span>
    </div>
    <div class="month-summary-item">
      <span>Saved This Month:</span>
      <span>${formatCurrency(expenseData[monthKey].savings || 0)}</span>
    </div>
  `;

    tempContainer.appendChild(summary);
    element.appendChild(tempContainer);

    return element;
  }

  function showSavingsDetails() {
    savingsDetailsContent.innerHTML = "";

    let totalSavings = 0;
    let hasSavings = false;

    // Get all months with savings data, sorted chronologically
    const monthsWithSavings = Object.keys(expenseData)
      .filter((monthKey) => {
        const savings = expenseData[monthKey].savings || 0;
        return savings > 0;
      })
      .sort();

    if (monthsWithSavings.length === 0) {
      savingsDetailsContent.innerHTML = "<p>No savings data available.</p>";
      savingsDetailsModal.style.display = "block";
      savingsDetailsModal.style.textAlign = "center";
      downloadSavingsBtn.disabled = true;
      downloadSavingsBtn.style.opacity = "0.5";
      downloadSavingsBtn.style.cursor = "not-allowed";
      downloadSavingsBtn.style.transform = "none";
      return;
    } else {
      // Enable download button if there's savings data
      downloadSavingsBtn.disabled = false;
      downloadSavingsBtn.style.opacity = "1";
      downloadSavingsBtn.style.cursor = "pointer";
    }

    // Add each month's savings
    monthsWithSavings.forEach((monthKey) => {
      const [year, month] = monthKey.split("-").map(Number);
      const monthName = getMonthName(month - 1);
      const savings = expenseData[monthKey].savings || 0;
      totalSavings += savings;

      const monthItem = document.createElement("div");
      monthItem.className = "savings-month-item";
      monthItem.style.pageBreakAfter = "avoid";
      monthItem.innerHTML = `
      <span class="savings-month-name">${monthName} ${year}</span>
      <span>${formatCurrency(savings)}</span>
    `;

      savingsDetailsContent.style.pageBreakAfter = "avoid";
      savingsDetailsContent.appendChild(monthItem);
    });

    // Add total savings
    const totalElement = document.createElement("div");
    totalElement.className = "savings-total";
    totalElement.style.pageBreakAfter = "avoid";
    totalElement.innerHTML = `
    <span>Total Savings</span>
    <span>${formatCurrency(totalSavings)}</span>
  `;

    savingsDetailsContent.appendChild(totalElement);
    savingsDetailsModal.style.display = "block";
  }

  function downloadSavingsReport() {
    // Create a container for the PDF content
    const element = document.createElement("div");
    element.style.textAlign = "center";
    element.style.padding = "0 20px"; // Horizontal padding only

    // Add Logo
    const logo = document.createElement("img");
    logo.src = "images/eTracker_Black.png";
    logo.style.width = "50px";
    logo.style.height = "auto";
    element.appendChild(logo);
    logo.style.pageBreakAfter = "avoid";

    // Add title
    const title = document.createElement("h2");
    title.textContent = "Savings Breakdown Report";
    title.style.textAlign = "center";
    title.style.margin = "20px 0";
    element.appendChild(title);

    // Add date and time
    const dateTime = document.createElement("p");
    dateTime.textContent = `Generated on: ${new Date().toLocaleString()}`;
    dateTime.style.textAlign = "center";
    dateTime.style.marginBottom = "20px";
    dateTime.style.color = "#666";
    title.style.pageBreakAfter = "avoid";
    element.appendChild(dateTime);

    // Clone the savings content
    const savingsContent = document
      .getElementById("savingsDetailsContent")
      .cloneNode(true);
    element.style.pageBreakAfter = "avoid";
    element.appendChild(savingsContent);

    // PDF options
    const opt = {
      margin: [15, 15, 25, 15],
      filename: "Savings_Breakdown_Report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Generate PDF with page numbers
    html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .get("pdf")
      .then(function (pdf) {
        addPageNumbers(pdf);
        pdf.save(opt.filename);
      });
  }

  async function generateSavingsReportForZip() {
    // Create a container for the PDF content
    const element = document.createElement("div");
    element.style.textAlign = "center";
    element.style.padding = "0 20px";

    // Add Logo
    const logo = document.createElement("img");
    logo.src = "images/eTracker_Black.png";
    logo.style.width = "50px";
    logo.style.height = "auto";
    element.appendChild(logo);
    logo.style.pageBreakAfter = "avoid";

    // Add title
    const title = document.createElement("h2");
    title.textContent = "Savings Breakdown Report";
    title.style.textAlign = "center";
    title.style.margin = "20px 0";
    element.appendChild(title);

    // Add date and time
    const dateTime = document.createElement("p");
    dateTime.textContent = `Generated on: ${new Date().toLocaleString()}`;
    dateTime.style.textAlign = "center";
    dateTime.style.marginBottom = "20px";
    dateTime.style.color = "#666";
    title.style.pageBreakAfter = "avoid";
    element.appendChild(dateTime);

    // Create temporary container for savings content
    const tempContainer = document.createElement("div");

    let totalSavings = 0;
    const monthsWithSavings = Object.keys(expenseData)
      .filter((monthKey) => (expenseData[monthKey].savings || 0) > 0)
      .sort();

    if (monthsWithSavings.length === 0) {
      tempContainer.innerHTML = "<p>No savings data available.</p>";
    } else {
      monthsWithSavings.forEach((monthKey) => {
        const [year, month] = monthKey.split("-").map(Number);
        const monthName = getMonthName(month - 1);
        const savings = expenseData[monthKey].savings || 0;
        totalSavings += savings;

        const monthItem = document.createElement("div");
        monthItem.className = "savings-month-item";
        monthItem.innerHTML = `
        <span class="savings-month-name">${monthName} ${year}</span>
        <span>${formatCurrency(savings)}</span>
      `;
        tempContainer.appendChild(monthItem);
      });

      // Add total savings
      const totalElement = document.createElement("div");
      totalElement.className = "savings-total";
      totalElement.innerHTML = `
      <span>Total Savings</span>
      <span>${formatCurrency(totalSavings)}</span>
    `;
      tempContainer.appendChild(totalElement);
    }
    element.style.pageBreakAfter = "avoid";
    element.appendChild(tempContainer);

    const opt = {
      margin: [15, 15, 25, 15],
      filename: "Savings_Breakdown_Report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    return html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .get("pdf")
      .then(function (pdf) {
        addPageNumbers(pdf);
        return pdf.output("blob");
      });
  }
});
