// Reveal on scroll
function revealOnScroll() {
  const elements = document.querySelectorAll(".feature-card, .step");
  const windowHeight = window.innerHeight;

  elements.forEach(el => {
    const position = el.getBoundingClientRect().top;
    if (position < windowHeight - 50) {
      el.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);