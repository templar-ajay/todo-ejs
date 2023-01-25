const addButton = document.querySelector(".addList");

console.log("hi");

function f() {
  addButton.onclick = () => {
    const inputText = input();
    addButton.parentElement.insertBefore(inputText, addButton);
    addButton.innerHTML = "&#10003;";
    addButton.onclick = () => {
      if (inputText.value.trim()) {
        // write your logic
        sendDataToServer(inputText.value);
        console.log(inputText.value);
      }
      addButton.innerHTML = "+";
      inputText.remove();
      f();
    };
  };
}
if (addButton) f();

function input() {
  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.id = "newListName";
  input.classList.add("new-list-input");
  return input;
}

function sendDataToServer(x) {
  fetch("/newListName", {
    method: "POST",
    body: JSON.stringify({ newListName: x }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  }).then(() => window.location.reload());
}

function showError(x = true) {
  const error = document.querySelector("#error");
  console.log("show error called");
  error.style.display = x ? "" : "none";
}

let newSubmit;
let time;
function verify(strong = false) {
  const pass = document.querySelector("#reg-pass");
  const confirmPass = document.querySelector("#confirm-pass");

  const submit = document.querySelector("#register-submit");

  if (time) clearTimeout(time);
  submit.removeAttribute("type");

  if (pass?.value) {
    if (pass?.value == confirmPass?.value) {
      if (time) clearTimeout(time);
      showError(false);
      submit.setAttribute("type", "submit");
      return true;
    } else {
      time = setTimeout(showError, 2000);
      if (confirmPass.value.length > pass.value.length || strong)
        showError(true);
      return false;
    }
  }
}
