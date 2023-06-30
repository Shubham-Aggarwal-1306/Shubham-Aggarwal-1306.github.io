// animations.js
window.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section");
    const windowHeight = window.innerHeight;
  
    const fadeInElements = () => {
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
  
        if (sectionTop < windowHeight - 50) {
          section.classList.add("fade-in");
        }
      });
    };
  
    fadeInElements();
  
    window.addEventListener("scroll", fadeInElements);
  });
  