document.addEventListener("DOMContentLoaded", (event) => {
  event.preventDefault();
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
  } else {
    axios
      .get("/verifyToken", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        checkPremiumStatus();
        getExpense();
      })
      .catch((error) => {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        window.location.href = "/login.html";
      });
  }
  async function checkPremiumStatus() {
    try {
      const response = await axios.get("/check-premium", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.isPremium) {
        document.getElementById("buy-premium-btn").style.display = "none";
        document.getElementById("premiumMessage").style.display = "block";
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
    }
  }

  const form = document.getElementById("my-form");
  const userList = document.getElementById("user-list");
  document
    .getElementById("buy-premium-btn")
    .addEventListener("click", initiatePremiumPurchase);
  let updateExpenseId = null;

  function getAuthToken() {
    return localStorage.getItem("token");
  }
  axios.interceptors.request.use(function (config) {
    const token = getAuthToken();
    config.headers.Authorization = token ? `Bearer ${token}` : "";
    return config;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const expenseAmount = document.querySelector("#expense-amount").value;
    const description = document.querySelector("#expense-description").value;
    const category = document.querySelector("#expense-category").value;

    try {
      if (updateExpenseId) {
        await axios.put(`/user/expense/${updateExpenseId}`, {
          expenseAmount,
          description,
          category,
        });
        updateExpenseId = null;
      } else {
        await axios.post("/user/expense", {
          expenseAmount,
          description,
          category,
        });
      }

      getExpense();
    } catch (error) {
      console.error("Error:", error);
    }
    document.getElementById("expense-amount").value = "";
    document.getElementById("expense-description").value = "";
    document.getElementById("expense-category").value = "";
  });

  let currentExpensePage = 1;
  let totalExpensePages = 0;

  document
    .getElementById("pageSizeSelect")
    .addEventListener("change", function () {
      const selectedValue = this.value;
      localStorage.setItem("expensesPerPage", selectedValue);
      getExpense(1);
    });

  function initializePageSize() {
    const savedPageSize = localStorage.getItem("expensesPerPage") || "10";
    document.getElementById("pageSizeSelect").value = savedPageSize;
    getExpense();
  }

  function updateExpensePaginationControls(currentPage, totalPages) {
    document.getElementById("currentExpensePage").textContent = currentPage;

    document.getElementById("prevExpensePage").disabled = currentPage === 1;
    document.getElementById("nextExpensePage").disabled =
      currentPage === totalPages;
    document.getElementById("lastExpensePageBtn").disabled =
      currentPage === totalPages;
  }

  async function getExpense(pageNumber = currentExpensePage) {
    const expensesPerPage = parseInt(
      document.getElementById("pageSizeSelect").value
    );
    try {
      const response = await axios.get(
        `/user/expense?page=${pageNumber}&pageSize=${expensesPerPage}`
      );
      totalExpensePages = response.data.totalPages;
      showExpenses(response.data.expenses);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      updateExpensePaginationControls(pageNumber, totalExpensePages);
      currentExpensePage = pageNumber;
    }
  }

  document
    .getElementById("prevExpensePage")
    .addEventListener("click", function () {
      if (currentExpensePage > 1) {
        getExpense(currentExpensePage - 1);
      }
    });

  document
    .getElementById("nextExpensePage")
    .addEventListener("click", function () {
      if (currentExpensePage < totalExpensePages) {
        getExpense(currentExpensePage + 1);
      }
    });
  document
    .getElementById("lastExpensePageBtn")
    .addEventListener("click", function () {
      getExpense(totalExpensePages);
    });

  function showExpenses(data) {
    userList.innerHTML = "";
    data.forEach((expense) => {
      const listItem = document.createElement("li");
      listItem.style.listStyle = "none";
      listItem.textContent = ` ${expense.expenseAmount} Rs - ${expense.description} - ${expense.category}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete Expense";
      deleteBtn.addEventListener("click", () => deleteExpense(expense.id));

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit Expense";
      editBtn.addEventListener("click", () => editExpense(expense));

      listItem.appendChild(deleteBtn);
      listItem.appendChild(editBtn);
      userList.appendChild(listItem);
    });
  }

  async function deleteExpense(id) {
    try {
      await axios.delete(`/user/expense/${id}`);
      getExpense();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function editExpense(expense) {
    updateExpenseId = expense.id;
    document.getElementById("expense-amount").value = expense.expenseAmount;
    document.getElementById("expense-description").value = expense.description;
    document.getElementById("expense-category").value = expense.category;
  }
  async function initiatePremiumPurchase() {
    try {
      const orderResponse = await axios.post("/razorpay/create-order", {});
      const { order_id } = orderResponse.data;

      const options = {
        key: "rzp_test_KHf7trqaOUGJWq",
        amount: orderResponse.data.amount,
        currency: "INR",
        name: "Expense Tracker Premium",
        description: "Purchase of premium plan",
        order_id: orderResponse.data.id,
        handler: async function (response) {
          try {
            const {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            } = response;
            const verifyResponse = await axios.post(
              "/razorpay/verify-payment",
              {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
                signature: razorpay_signature,
              }
            );

            if (verifyResponse.data.success) {
              alert("Payment successful and verified!");
              checkPremiumStatus();
            } else {
              alert("Payment verification failed");
            }
          } catch (error) {
            console.error("Error:", error);
          }
        },
        prefill: {},
        theme: {
          color: "#3399cc",
        },
      };
      const rzp1 = new Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  let currentPage = 1;
  let totalPages = 0;
  const pageSize = 10;

  function updatePaginationButtons() {
    document.getElementById("nextPage").disabled = currentPage >= totalPages;
    document.getElementById("prevPage").disabled = currentPage <= 1;
  }

  async function fetchLeaderboardData(page = 1, pageSize = 10) {
    try {
      const response = await axios.get(
        `/leaderboard?page=${page}&pageSize=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      totalPages = Math.ceil(response.data.totalUsers / pageSize);
      return response.data.leaderboardData;
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }
  }

  async function displayLeaderboard() {
    try {
      const response = await axios.get("/check-premium", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.isPremium) {
        const leaderboardData = await fetchLeaderboardData(
          currentPage,
          pageSize
        );

        const leaderboardList = document.getElementById("leaderboards");
        leaderboardList.innerHTML = "";
        document.querySelector(".leaderboard").style.display = "flex";

        let startNumber = (currentPage - 1) * pageSize + 1;

        leaderboardData.forEach((user) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${startNumber}. ${user.username} - ${
            user.totalExpense ? user.totalExpense + " Rs" : "0"
          }`;
          leaderboardList.appendChild(listItem);
          startNumber++;
        });

        document.getElementById("currentPage").textContent = currentPage;
      } else {
        alert("This is for premium users only!");
      }
    } catch (error) {
      console.log(error);
    }
    updatePaginationButtons();
  }
  document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      console.log("Current Page after Next:", currentPage);
      displayLeaderboard();
    }
  });

  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      console.log("Current Page after Previous:", currentPage);
      displayLeaderboard();
    }
  });

  document
    .getElementById("show-leaderboard")
    .addEventListener("click", displayLeaderboard);

  document
    .getElementById("generate-expense")
    .addEventListener("click", async () => {
      try {
        const response = await axios.get("/check-premium", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.isPremium) {
          document.getElementById("reportModal").style.display = "block";
        } else {
          alert("this feature is only for premium users");
        }
      } catch (error) {
        console.log(error);
      }
    });

  document.querySelector(".close").addEventListener("click", function () {
    document.getElementById("reportModal").style.display = "none";
  });

  document
    .getElementById("generateReportForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      generateAndDownloadReport();
    });

  function generateAndDownloadReport() {
    const month = document.getElementById("monthSelector").value;
    const year = document.getElementById("yearSelector").value;
    const format = document.getElementById("report-format").value;

    axios
      .get(
        `/user/generate-expense-report?month=${month}&year=${year}&format=${format}`,
        {
          responseType: "blob",
        }
      )
      .then((response) => {
        const file = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = fileURL;
        a.download = `expense-report-${month}-${year}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((error) => console.error("Error downloading the report:", error));
  }
  initializePageSize();
  getExpense();
});
