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
document.addEventListener("DOMContentLoaded", () => {
      const footer = document.querySelector(".footer");
      const sections = document.querySelectorAll(".footer-section");

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            footer.classList.add("show-footer");

            // Stagger each section with delay
            sections.forEach((sec, i) => {
              setTimeout(() => {
                sec.classList.add("show-section");
              }, i * 250); // 0.25s delay per section
            });

            observer.unobserve(footer); // run once
          }
        });
      }, { threshold: 0.2 });

      observer.observe(footer);
    });