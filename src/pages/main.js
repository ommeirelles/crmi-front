/**
 * @typedef  {{login: string, id: number}} User
 */

(async function main() {

  const user = getUser();
  if (!user) return logout();
  document.querySelector("#user-name").innerText = user.login;
  document.querySelector(".form-content__props__action-root")?.addEventListener("click", addRoot)

  /**
   * Services
   */
  const configService = new Config()
  const namespaceService = new NamespaceService(configService.env.endpoint)
  const languageService = new LanguageService(configService.env.endpoint)

  /**
   * Language
   */
  let currentLanguage = await loadLanguage();
  /** @type {HTMLSelectElement} */
  const languageNode = document.querySelector(".header__actions-language");

  await fillLanguageSelect()
  if (currentLanguage) languageNode.value = currentLanguage;
  languageNode.addEventListener("change", onLanguageChange);

  /**
   * Namespaces
   */
  /** @type {string | undefined} */
  let currentNamespace;
  document.querySelector("#namespaces").addEventListener("change", onNamespaceChange);
  await fillNamespaceSelect();

  /**
   * DIALOGS
   */
  /** @type {HTMLDialogElement} */
  const dialogCreateNamespaceNode = document.querySelector(".create-namespace");
  dialogCreateNamespaceNode.querySelector(".create-namespace__namespace-form")?.addEventListener('submit', submitNamespaceCreateDialog)
  document.querySelector(".namespace-select__create")?.addEventListener("click", toggleNamespaceModal)

  const dialogCreateLanguageNode = document.querySelector(".create-language");
  dialogCreateLanguageNode.querySelector(".create-language__form")?.addEventListener('submit', submitLanguageCreateDialog)
  document.querySelector(".header__actions-language__add")?.addEventListener("click", toggleLanguageModal)

  document.querySelector(".form-content")?.addEventListener("submit", (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    dumpTree()
  })

  /**
   * EVENTS AND METHODS
   */

  /** @param {Event} ev  */
  function onLanguageChange(ev) {
    currentLanguage = ev.target.value;
    sessionStorage.setItem("language", currentLanguage);
    fillNamespaceSelect()
  }

  /**
   * @param {object} obj
   * @returns {Element}
   */
  function buildTree(obj) {
    const list = getBlockList();

    for (const key in obj) {
      if (typeof obj[key] === "object") {
        const entry = getBlock(key)

        entry.querySelector(".entries__record-key")?.insertAdjacentElement("afterend", buildTree(obj[key]));

        list.appendChild(entry);
        continue;
      }

      list.appendChild(getRow(key, obj[key]));
    }

    return list;
  }

  /** @param {PointerEvent} ev  */
  function addRowClick(ev) {
    ev.stopPropagation()
    ev.target.parentElement.nextSibling.appendChild(getRow("", ""));
  }

  /** @param {PointerEvent} ev  */
  function addBlockClick(ev) {
    ev.stopPropagation()
    const newEntry = getBlock("")
    newEntry.querySelector(".entries__record-key")?.insertAdjacentElement("afterend", buildTree({
      "": ""
    }));
    ev.target.parentElement.nextSibling.appendChild(newEntry);
  }

  /** @param {PointerEvent} ev  */
  function removeEntryClick(ev) {
    ev.stopPropagation()
    let parent = ev.target.parentElement
    while (parent !== document.body && parent.tagName !== "LI") {
      parent = parent.parentElement;
    }

    parent.parentElement.removeChild(parent)
  }

  async function update(data) {
    document.querySelector(".form-content__props__header").innerText = currentNamespace.toUpperCase()
    if (!data) data = await getNamespaceData()
    const root = document.querySelector(".form-content__all-entries");
    root.innerHTML = "";
    root.appendChild(buildTree(data));
  }

  function getRow(key, value) {
    const entry = HTML("li", { classNames: 'entries__record' })`
      <input class="entries__record-key-value" value="${key}" type="text" required minlength="1" placeholder="chave"/>:
      <input class="entries__record-value" value="${value}" type="text" required minlength="1" placeholder="valor"/>
      <button class="entries__record-key__add-action remove-row-action" type="button">
        <span class="entries__record-key__add-action-icon material-symbols-outlined">
          remove
        </span>
      </button>
    `;

    const debouncedEv = debounce(onInputSanitize, 500)
    entry.querySelector(".entries__record-key-value")?.addEventListener("input", debouncedEv)
    entry.querySelector(".entries__record-value")?.addEventListener("input", debouncedEv)
    entry.querySelector(".entries__record-key-value")?.addEventListener("blur", onInputSanitize)
    entry.querySelector(".entries__record-value")?.addEventListener("blur", onInputSanitize)
    entry.querySelector(".entries__record-key-value")?.addEventListener("keydown", stopPropagationOnSpace)
    entry.querySelector(".entries__record-value")?.addEventListener("keydown", stopPropagationOnSpace)
    entry.querySelector(".entries__record-key__add-action.remove-row-action")?.addEventListener("click", removeEntryClick)
    return entry;
  }

  function getBlock(key) {
    const entry = HTML('li', { classNames: 'entries__record' })`
          <details open>
            <summary class="entries__record-key"> 
              <input class="entries__record-key-value" value="${key}" type="text" required minlength="1" placeholder="chave"/>
              <button class="entries__record-key__add-action add-row-action" type="button">
                <span class="entries__record-key__add-action-icon material-symbols-outlined">
                  add
                </span>
              </button>

              <button class="entries__record-key__add-action add-block-action mx8" type="button">
                <span class="entries__record-key__add-action-icon material-symbols-outlined">
                  data_object
                </span>
              </button>

              <button class="entries__record-key__add-action remove-row-action" type="button">
                <span class="entries__record-key__add-action-icon material-symbols-outlined">
                  remove
                </span>
              </button>
            </summary>
          </details>
        `;


    const debounceSanitize = debounce(onInputSanitize, 500)

    entry.querySelector(".entries__record-key-value")?.addEventListener("input", debounceSanitize)
    entry.querySelector(".entries__record-value")?.addEventListener("input", debounceSanitize)

    entry.querySelector(".entries__record-key-value")?.addEventListener("keydown", stopPropagationOnSpace)
    entry.querySelector(".entries__record-value")?.addEventListener("keydown", stopPropagationOnSpace)

    entry.querySelector(".entries__record-key-value")?.addEventListener("blur", onInputSanitize)
    entry.querySelector(".entries__record-value")?.addEventListener("blur", onInputSanitize)

    entry.querySelector(".entries__record-key__add-action.add-row-action")?.addEventListener("click", addRowClick)
    entry.querySelector(".entries__record-key__add-action.add-block-action")?.addEventListener("click", addBlockClick)
    entry.querySelector(".entries__record-key__add-action.remove-row-action")?.addEventListener("click", removeEntryClick)

    return entry
  }

  /** @returns {Promise<string>} */
  async function loadLanguage() {

    let lang = sessionStorage.getItem("language");

    const possibleLanguages = await languageService.getLanguages()
    if (possibleLanguages.length < 1) {
      const newLanguage = await languageService.createLanguage("PT", "Portugues")
      if (newLanguage) possibleLanguages.push(newLanguage)
    }

    if (!lang || possibleLanguages.findIndex(el => el.code === lang) < 0) lang = possibleLanguages.at(0)?.code

    return lang;
  }

  /** @returns {User | null} */
  function getUser() {
    try {
      return JSON.parse(sessionStorage.getItem("user"));
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  /** @param {Event} ev */
  function onInputSanitize(ev) {
    if (!ev.target) return;

    ev.target.innerText = ev.target.innerText.replaceAll(/(^[0-9]+| |\n)/gim, "")
      .replaceAll(String.fromCharCode(160), "")
      .trim();
  }

  /** @param {KeyboardEvent} ev */
  function stopPropagationOnSpace(ev) {
    if (["Space", "Enter"].includes(ev.code)) {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  /**
 * @param {SubmitEvent} ev
 */
  async function submitNamespaceCreateDialog(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    if (!currentLanguage) throw new Error("No language selected")
    const data = new FormData(ev.target);

    const name = data.get("namespace")
    if (!name) throw new Error("Namespace name is missing")

    await namespaceService.createNamespace(name, currentLanguage)
    await fillNamespaceSelect()
    dialogCreateNamespaceNode.close()
  }

  /**
* @param {SubmitEvent} ev
*/
  async function submitLanguageCreateDialog(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    const data = new FormData(ev.target);

    const name = data.get("language-name")
    const code = data.get("language-code")
    if (!name || !code) throw new Error("Namespace name is missing")

    await languageService.createLanguage(code, name)
    await fillLanguageSelect()
    await fillNamespaceSelect()
    dialogCreateLanguageNode.close()
  }

  function fillNamespaceSelect() {
    if (!currentLanguage) return

    return namespaceService.getNamespaces(currentLanguage).then(namespaces => {
      currentNamespace = namespaces.at(0)?.name

      document.querySelector("#namespaces").innerHTML = namespaces.map(el => `
            <option value="${el.name}">${el.name}</option>
        `).join("")

      update()
    })
  }

  function fillLanguageSelect() {
    return languageService.getLanguages().then((languages = []) => {
      languageNode.innerHTML = languages.map(el => `
              <option value="${el.code}">${el.name}</option>
          `).join("")
    })
  }

  function toggleNamespaceModal() {
    /** @type {HTMLDialogElement} */
    dialogCreateNamespaceNode.open === true ?
      dialogCreateNamespaceNode.close() :
      dialogCreateNamespaceNode.showModal()
  }

  function toggleLanguageModal() {
    /** @type {HTMLDialogElement} */
    dialogCreateLanguageNode.open === true ?
      dialogCreateLanguageNode.close() :
      dialogCreateLanguageNode.showModal()
  }

  /** @param {Event} ev */
  function onNamespaceChange(ev) {
    currentNamespace = ev.target.value
    update()
  }

  function addRoot() {
    const block = getBlock()
    const list = getBlockList()
    block.querySelector("summary").insertAdjacentElement("afterend", list)
    document.querySelector(".form-content__all-entries ul")?.appendChild(block)
  }

  function getBlockList() {
    const list = HTML("ul")``;
    list.classList.add("entries");
    return list
  }

  async function getNamespaceData() {
    if (!currentLanguage || !currentNamespace) return;

    const data = await namespaceService.getNamespaceData(currentNamespace, currentLanguage)
    return data
  }

  /**
 * @param {Element} root 
 * @param {Record<string, unknown>} data 
 */
  async function dumpTree(root, data) {
    let hasError = false

    const parser = (root, data) => {
      // row
      if (root.firstElementChild.tagName === "INPUT") {
        const input = root.querySelector(".entries__record-key-value")
        const key = input.value
        const value = root.querySelector(".entries__record-value").value
        if (!!data[key]) {
          input.classList.add("error")
          hasError = true
        }
        data[key] = value

        return data
      } else {
        const input = root.querySelector("summary > .entries__record-key-value")
        const childrens = root.querySelectorAll(":scope > details > ul > li")
        const key = input.value
        if (!!data[key] || !childrens.length) {
          input.classList.add("error")
          hasError = true
        }
        data[key] = {}
        for (const element of childrens) {
          parser(element, data[key])
        }

        return data
      }
    }

    if (!data) {
      root = document.querySelectorAll(".form-content__all-entries > ul > li")
      data = {}
      for (const rootEl of root) {
        parser(rootEl, data)
      }

      if (hasError) {
        return
      }

      const newData = await namespaceService.saveNamespaceData(currentNamespace, currentLanguage, data)
      update(newData)
    }
  }
})();

function logout() {
  sessionStorage.clear();
  localStorage.clear();
  location.replace("./login.html");
}

function closeAll() {
  document.body.querySelectorAll("details[open]").forEach(el => el.toggleAttribute("open"))
}

function openAll() {
  document.body.querySelectorAll("details:not([open])").forEach(el => el.toggleAttribute("open"))
}