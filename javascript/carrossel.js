var swiper = new Swiper(".swiper", {
  loop: true,
  grabCursor: true,
  slidesPerView: 1, // valor padrão
  spaceBetween: 16, // valor padrão
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true
  },
  breakpoints: {
    640: {
      slidesPerView: 1,
      spaceBetween: 18
    },
    768: {
      slidesPerView: 2,
      spaceBetween: 18
    },
    1024: {
      slidesPerView: 3,
      spaceBetween: 24
    }
  }
});