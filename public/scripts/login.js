document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  axios
    .post("/login", { email, password })
    .then((response) => {
      localStorage.setItem("token", response.data.token);
      window.location.href = "/expense.html";
    })
    .catch((error) => alert("Login failed!"));
});
