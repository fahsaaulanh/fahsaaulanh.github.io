document.addEventListener("DOMContentLoaded", () => {
  // Section fade-in animation
  const sections = document.querySelectorAll(".section-detail-hidden");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("section-detail-visible");
          }, i * 150);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  sections.forEach((section) => observer.observe(section));

  // Carousel Logic
  const track = document.querySelector(".carousel-track");
  if (track) {
    const slides = Array.from(track.children);
    if (slides.length > 0) {
      const dotsNav = document.querySelector(".carousel-dots");
      let slideWidth = slides[0].getBoundingClientRect().width;
      let currentIndex = 0;
      let autoPlayInterval;
      const moveToSlide = (targetIndex) => {
        const newIndex = (targetIndex + slides.length) % slides.length;
        track.style.transform = `translateX(-${slideWidth * newIndex}px)`;
        currentIndex = newIndex;
        updateDots();
      };
      const updateDots = () => {
        if (!dotsNav) return;
        Array.from(dotsNav.children).forEach((dot, index) =>
          dot.classList.toggle("active", index === currentIndex)
        );
      };
      const createDots = () => {
        if (!dotsNav) return;
        dotsNav.innerHTML = "";
        slides.forEach((_, index) => {
          const button = document.createElement("button");
          button.classList.add("carousel-dot");
          if (index === 0) button.classList.add("active");
          button.addEventListener("click", () => {
            moveToSlide(index);
            resetAutoPlay();
          });
          dotsNav.appendChild(button);
        });
      };
      const startAutoPlay = (interval = 4000) => {
        stopAutoPlay();
        if (slides.length > 1)
          autoPlayInterval = setInterval(
            () => moveToSlide(currentIndex + 1),
            interval
          );
      };
      const stopAutoPlay = () => clearInterval(autoPlayInterval);
      const resetAutoPlay = () => {
        stopAutoPlay();
        startAutoPlay();
      };
      const setupCarousel = () => {
        slideWidth = slides[0].getBoundingClientRect().width;
        createDots();
        moveToSlide(currentIndex);
        startAutoPlay();
      };
      setupCarousel();
      window.addEventListener("resize", () => {
        slideWidth = slides[0].getBoundingClientRect().width;
        track.style.transition = "none";
        moveToSlide(currentIndex);
        setTimeout(
          () => (track.style.transition = "transform 0.5s ease-in-out"),
          50
        );
      });
    }
  }

  const yearSpanDetail = document.getElementById("current-year-detail");
  if (yearSpanDetail)
    yearSpanDetail.textContent = new Date().getFullYear().toString();
});
