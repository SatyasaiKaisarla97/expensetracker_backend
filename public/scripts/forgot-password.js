document.addEventListener("DOMContentLoaded", function () {
  const forgotPasswordForm = document.getElementById("forgot-password-form");

  forgotPasswordForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;

    axios
      .post("/user/forgot-password", { email })
      .then(function (response) {
        console.log(response);
        alert(
          "If an account with that email exists, we have sent a password reset link."
        );
        document.getElementById("email").value = "";
      })
      .catch(function (error) {
        console.error(error);
        alert("An error occurred. Please try again later.");
      });
  });
});
