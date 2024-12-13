(function main(params) {
  document.querySelector(".login-form")?.addEventListener("submit", onFormSubmit);
  const userService = new UserService("http://127.0.0.1:5000")
  /**
   * @param {SubmitEvent} ev
   */
  function onFormSubmit(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    const loginNode = ev.target.querySelector('input[type="email"]'),
      passwordNode = ev.target.querySelector('input[type="password"]');

    loginNode.classList.remove("error");
    passwordNode.classList.remove("error");

    const method = ev.submitter.id === "login" ? userService.login.bind(userService) : userService.createUser.bind(userService);

    method(new FormData(ev.target)).then(async (resp) => {
      if (resp.ok) {
        const data = await resp.json();
        sessionStorage.setItem("user", JSON.stringify(data));
        location.replace("./main.html");
      } else {
        ev.target.querySelectorAll(".error-message").forEach(el => ev.target.removeChild(el))
        responseText = await resp.text();
        const message = errorMessageNode.cloneNode(true);
        message.innerText = responseText;
        ev.target.insertAdjacentElement("afterbegin", message);
        setTimeout(() => {
          if (Array.from(ev.target.childNodes).some(el => el === message)) ev.target.removeChild(message)
        }, 10000);

        loginNode.classList.add("error");
        passwordNode.classList.add("error");
      }
    });
  }

  const errorMessageNode = styled.p`
    color: brown;
    font-size: 12px;
    font-weight: bold;
    line-height: 16px;
  `;
  errorMessageNode.classList.add("error-message")
})();
