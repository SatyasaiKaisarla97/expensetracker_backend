document.addEventListener("DOMContentLoaded", function () {
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  resetPasswordForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    axios
      .post("/user/reset-password", {
        newPassword,
        token,
      })
      .then(function (response) {
        console.log(response);
        alert("Your password has been reset successfully.");
        window.location.href = "/login.html";
      })
      .catch(function (error) {
        console.error(error);
        if (error.response && error.response.data) {
          alert(error.response.data);
        } else {
          alert("An error occurred. Please try again later.");
        }
      });
  });
});
