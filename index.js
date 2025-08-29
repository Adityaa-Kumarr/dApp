const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".navbar ul");
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});
hamburger.addEventListener("keypress", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    navLinks.classList.toggle("show");
  }
});

