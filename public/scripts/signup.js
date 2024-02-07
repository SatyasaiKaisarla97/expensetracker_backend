document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  axios
    .post("/signUp", {
      username,
      email,
      password,
    })
    .then(function (response) {
      console.log(response);
      alert("Signup successful");
      document.getElementById("username").value = "";
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
    })
    .catch(function (error) {
      console.error(error);
      alert("Signup failed");
    });
});
