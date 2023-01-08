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
        addButton.innerHTML = "+";
      }
      inputText.remove();
      f();
    };
  };
}
f();

function input() {
  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.id = "newListName";
  input.classList.add("new-list-input");
  return input;
}

function sendDataToServer(x) {
  fetch("/newListItem", {
    method: "POST",
    body: JSON.stringify({ newListName: x }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  }).then(() => window.location.reload());
}
