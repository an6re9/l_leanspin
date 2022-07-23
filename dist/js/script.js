window.onload = () => {
  burgerMenu();
  slider();
  runningString();
};

// бургер
function burgerMenu() {
  const burger = document.querySelector(".burger");
  const navMenu = document.querySelector(".navigation__menu");
  const media = 768; // на какой ширине переключаемся на бургер

  burger.onclick = burgerClick;
  window.onresize = burgerResize;

  function burgerResize() {
    if (window.innerWidth > media) {
      document.body.removeAttribute("style");
      navMenu.classList.remove("navigation__menu_mobile");
      burger.classList.remove("burger__active");
      // при ресайзе с большого экранаблок скрываем без анимации
    } else if (!burger.classList.contains("burger__active")) {
      // alert("Work!");
      navMenu.style.transition = "none";
    }
  }

  function burgerClick(event) {
    burger.classList.toggle("burger__active");
    if (burger.classList.contains("burger__active")) {
      document.body.style.overflow = "hidden";
      navMenu.removeAttribute("style");
      navMenu.classList.add("navigation__menu_mobile");
    } else {
      document.body.removeAttribute("style");
      navMenu.classList.remove("navigation__menu_mobile");
    }
  }
}

function slider() {
  const sliders = document.querySelectorAll(".slider");

  sliders.forEach((slider) => {
    const links = slider.querySelectorAll(".slider__links a[data-link]");
    const paginationContainer = slider.querySelector(".pagination__container");
    const paginationItems = slider.querySelectorAll(
      ".pagination__item[data-link]"
    );
    let pagintaionResize;
    // если не задан left, то добавляем, чтобы при первом перелистывании сработал transition
    paginationContainer.style.left = paginationContainer.offsetLeft + "px";
    dragSlider();

    // делаем активным первый элемент автоматически
    links[0].classList.add("active");
    paginationItems[0].classList.add("active");

    links.forEach((link) => {
      link.addEventListener("click", (event) =>
        trigger(event.target.dataset.link)
      );
    });

    // вызов при клике на ссылку и при окончании перетаскивания пагинации
    function trigger(dataLink) {
      slider.querySelectorAll("[data-link]").forEach((element) => {
        element.classList.remove("active", "slide_visible");

        if (element.dataset.link === dataLink) {
          if (element.classList.contains("slide")) {
            element.classList.add("slide_visible");
          } else {
            element.classList.add("active");
            if (element.classList.contains("pagination__item"))
              paginationTrigger(element);
          }
        }
      });
    }

    // пагинация
    // пагинация

    function paginationTrigger(item) {
      paginationContainer.style.left = -item.offsetLeft + "px";
      transition(paginationContainer);
      return true;
    }

    // перетаскивание пагинации
    function dragSlider() {
      const slider = document.querySelector(".slider__pagination");
      const slidesContainer = slider.querySelector(".pagination__container");
      const slides = Array.from(slider.querySelectorAll(".pagination__item"));

      window.addEventListener("resize", resize);
      slidesContainer.addEventListener("pointerdown", move);

      function move(e) {
        const beginCursorPosition = parseInt(e.clientX);
        let containerLeft = left();
        document.addEventListener("pointermove", paginationToLeft);
        document.addEventListener("pointerup", up);

        function paginationToLeft(e) {
          slidesContainer.style.left =
            containerLeft + (parseInt(e.clientX) - beginCursorPosition) + "px";
        }

        function up() {
          document.removeEventListener("pointermove", paginationToLeft);
          stop();
          document.removeEventListener("pointerup", up);
        }
      }

      function stop() {
        let offset = left();
        // если утащили вправо на первом же слайде, то возвращаемся к нему
        if (offset >= 0) {
          transition(slidesContainer);
          slidesContainer.style.left = "0px";
          trigger(slides[0].dataset.link);
          return;
        }
        offset = Math.abs(offset);

        let slidesWidth = 0;
        for (let i = 0; i < slides.length; i++) {
          let currentSlideWidth = slides[i].offsetWidth;
          slidesWidth += currentSlideWidth;
          // чтобы не ушел из виду последний слайд
          if (
            i === slides.length - 1 &&
            offset > slidesWidth - currentSlideWidth
          ) {
            transition(slidesContainer);
            slidesContainer.style.left =
              -(slidesWidth - currentSlideWidth) + "px";
            trigger(slides[i].dataset.link);
            return;
          }
          // если перетащили до середины слайд, то перелистываем его
          if (
            offset < slidesWidth &&
            offset > slidesWidth - currentSlideWidth + currentSlideWidth / 2
          ) {
            trigger(slides[i + 1].dataset.link);
            transition(slidesContainer);
            slidesContainer.style.left = -slidesWidth + "px";
            return;
          } else if (
            offset < slidesWidth &&
            offset > slidesWidth - currentSlideWidth
          ) {
            trigger(slides[i].dataset.link);
            transition(slidesContainer);
            slidesContainer.style.left =
              -slidesWidth + currentSlideWidth + "px";
            return;
          }
        }
      }

      function left() {
        return Number(slidesContainer.style.left.replace(/[^\d-]/g, "")) || 0;
      }

      function resize() {
        clearTimeout(pagintaionResize);
        pagintaionResize = setTimeout(() => {
          paginationTrigger(slider.querySelector(".pagination__item.active"));
        }, 300);
      }
    }

    function transition(element) {
      element.style.transition = "left 0.4s";
      let timeout = setTimeout(() => (element.style.transition = ""), 500);
    }
  });
}

function runningString() {
  // скорость и направление задаются через data-speed
  // -1 - влево, 2 - в 2 раза быстрее в вправо
  document.querySelectorAll(".str__container").forEach((strContainer) => {
    const child = strContainer.firstElementChild;
    const speed = Number(strContainer.dataset.speed);
    let transitionVal = 0;
    let reqestId;
    reqestId = requestAnimationFrame(move);

    // добавляем пробелы между "слайдами"
    // const space = document.createElement("span");
    // [...strContainer.children].forEach((child) =>
    //   child.insertAdjacentHTML("beforeend", "&thinsp;")
    // );

    // определяем направление
    if (speed > 0) {
      strContainer.style.cssText = `position:relative; left:-${child.offsetWidth}px`;
    }

    function move() {
      if (child.offsetWidth <= Math.abs(transitionVal)) {
        transitionVal = child.offsetWidth - Math.abs(transitionVal) + speed;
      } else {
        transitionVal += speed;
      }

      reqestId = requestAnimationFrame(move);
      strContainer.style.transform = `translateX(${transitionVal}px)`;
    }
  });
}
