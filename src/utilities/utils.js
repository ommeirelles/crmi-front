function debounce(callback, wait) {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    function handler() {
      callback(...args);
    }
    timeout = setTimeout(handler, wait);
  };
}

function addObverserver(el) {
  const observer = new MutationObserver(function (...args) {
    console.log("Element Changed:\n%o\n%o", el, args);
  });

  observer.observe(el, {
    subtree: true,
    childList: true,
  });
}