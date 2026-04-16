// Mobile navigation toggle
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !expanded);
    });
  }

  // Mobile dropdown toggle
  document.querySelectorAll(".has-dropdown").forEach(function (item) {
    item.addEventListener("click", function (e) {
      if (window.innerWidth <= 768) {
        const link = item.querySelector(".dropdown-toggle");
        if (e.target === link || link.contains(e.target)) {
          e.preventDefault();
          item.classList.toggle("open");
        }
      }
    });
  });

  // Carousel: scroll on hover over arrows
  const track = document.querySelector(".carousel-track");
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");

  if (track && prevBtn && nextBtn) {
    let scrollInterval = null;
    const scrollSpeed = 3;

    function startScroll(direction) {
      stopScroll();
      scrollInterval = setInterval(function () {
        track.scrollLeft += direction * scrollSpeed;
      }, 10);
    }

    function stopScroll() {
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
    }

    // Scroll on hover (not click), matching the original Wix behavior
    prevBtn.addEventListener("mouseenter", function () { startScroll(-1); });
    prevBtn.addEventListener("mouseleave", stopScroll);
    nextBtn.addEventListener("mouseenter", function () { startScroll(1); });
    nextBtn.addEventListener("mouseleave", stopScroll);

    // Also allow click for a bigger jump
    prevBtn.addEventListener("click", function (e) {
      e.preventDefault();
      track.scrollBy({ left: -400, behavior: "smooth" });
    });
    nextBtn.addEventListener("click", function (e) {
      e.preventDefault();
      track.scrollBy({ left: 400, behavior: "smooth" });
    });
  }
});
