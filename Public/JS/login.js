//Collect containers for login and register
let registerContainer = document.querySelector(".registerContainer");
let loginContainer = document.querySelector(".loginContainer");

//Toggle between login and register
let changeDisplay = document.getElementById("signUpBtn");
changeDisplay.addEventListener("click", () => {
  if (changeDisplay.innerText === "Sign up to travel") {
    registerContainer.style.display = "block";
    loginContainer.style.display = "none";
    changeDisplay.innerText = "Sign in here";
  } else {
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
    changeDisplay.innerText = "Sign up to travel";
  }
});

//Login
let loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", async () => {
  let username = document.getElementById("uname");
  let pwd = document.getElementById("pwd");

  let user = {
    username: username.value,
    pwd: pwd.value,
  };
  console.log(user);

  let data = await fetch("/login", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(user),
  })
    .then((result) => {
      return result.json();
    })
    .then((answer) => {
      console.log(answer);
      if (answer.login) {
        if (answer.admin) {
          location.replace("http://localhost:3000/admin.html");
          return;
        }
        location.replace("http://localhost:3000/");
      } else {
        alert(answer.message);
      }
    })
    .catch((err) => console.error(err));
});

//Register
let registerBtn = document.getElementById("registerBtn");
registerBtn.addEventListener("click", async () => {
  let newUsername = document.getElementById("newUsename");
  let newPwd = document.getElementById("newPwd");

  if (newPwd.value === "" || newUsername.value === "") {
    alert("You can't leave any fields empty");
    return;
  }

  let user = {
    username: newUsername.value,
    pwd: newPwd.value,
  };

  let data = await fetch("/createUser", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(user),
  })
    .then((result) => {
      return result.json();
    })
    .then((answer) => {
      console.log(answer);
      if (!answer.login) {
        alert(answer.message);
        return;
      }
      if (answer) {
        registerContainer.style.display = "none";
        loginContainer.style.display = "block";
        changeDisplay.innerText = "Sign up to travel";
        alert("Your account was successfully created! Log in to travel!");
      }
      newUsername.value = "";
      newPwd.value = "";
    })
    .catch((err) => console.error(err));
});
