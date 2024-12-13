/**
 *
 * @param {keyof HTMLElementTagNameMap} element
 */
function styleFactory(element) {
  /**
   * @param {Array<string>} chunks
   * @returns {HTMLElementTagNameMap[element]}
   */
  return (chunks) => {
    const el = document.createElement(element);
    for (const chunk of chunks) {
      for (const rule of chunk
        .split(";")
        .map((style) => style.trim())
        .filter(Boolean)) {
        const [attribute, value] = rule.split(":");

        if (!attribute || !value) throw new Error("Invalid style declaration");
        el.style[attribute] = value.trim();
      }
    }

    return el;
  };
}

const styled = styleFactory;
styled.p = styleFactory("p");
styled.div = styleFactory("div");
styled.h1 = styleFactory("h1");
styled.h2 = styleFactory("h2");
styled.span = styleFactory("span");
styled.b = styleFactory("b");
styled.a = styleFactory("a");
styled.form = styleFactory("form");

/**
 *
 * @param {keyof HTMLElementTagNameMap} element
 * @param {Object} options
 * @param {Array<string> | string} options.classNames
 * @param {GlobalEventHandlers} options.handlers
 * @param {Array<Element> | Element} options.childNodes
 */
function elementFactory(element, options) {
  /**
   * @param {Array<string>} chunks
   * @param {Array<string>} elements
   * @returns {HTMLElementTagNameMap[element]}
   */
  return (chunks, ...elements) => {
    /** @type {HTMLElementTagNameMap[element]} */
    const el = document.createElement(element);
    const { classNames = "", handlers = {}, childNodes = [] } = options ?? {};
    [classNames]
      .flat()
      .filter(Boolean)
      .forEach((c) => el.classList.add(c));

    for (const handler in handlers) {
      el[handler] = handlers[handler];
    }

    el.innerHTML = chunks.map((chunk, index) => `${chunk}${elements[index] ?? ""}`).join("");

    [childNodes].flat().forEach((n) => el.appendChild(n));

    return el;
  };
}

const HTML = elementFactory;
