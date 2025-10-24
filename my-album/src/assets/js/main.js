// /assets/js/main.js
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.getElementById("hero");
  if (!hero) return;
  const nav = document.querySelector("nav");
  const img = hero.querySelector("img");
  const desktopLogoImg = nav?.querySelector(".logo-desktop img") ?? null;
  const LOGO_SRC_WHITE = "/assets/img/logo/white-logo/m-b-logo-124w.avif";
  const LOGO_SRC_BLACK = "/assets/img/logo/black-logo/M(2).png";

  // Helper: create the HTML for a single <h1> text
  function wrapByWord(h1) {
    const text = h1.textContent.trim();

    // split into words (preserves only words; multiple spaces collapse)
    const words = text.split(/\s+/);

    // For each word, wrap each character in a span with --col=index-in-word
    const wordHtml = words.map(word => {
      return Array.from(word).map((ch, idx) => {
        // escape HTML characters to be safe
        const escaped = ch === " " ? "&nbsp;" : ch
          .replace?.(/&/g, "&amp;")
          .replace?.(/</g, "&lt;")
          .replace?.(/>/g, "&gt;") ?? ch;
        return `<span class="letter" style="--col:${idx}">${escaped}</span>`;
      }).join("");
    });

    // join words with a non-animated spacer
    h1.innerHTML = wordHtml.join('<span class="word-space" aria-hidden="true">&nbsp;</span>');
  }

  // Wrap all h1s inside .hero-text
  hero.querySelectorAll(".hero-text h1").forEach(h1 => wrapByWord(h1));

  const parseTime = value => {
    if (!value) return 0;
    const trimmed = value.trim();
    if (!trimmed) return 0;
    if (trimmed.endsWith("ms")) return parseFloat(trimmed);
    if (trimmed.endsWith("s")) return parseFloat(trimmed) * 1000;
    const numeric = parseFloat(trimmed);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const heroStyles = window.getComputedStyle(hero);
  const fadeDelayMs = parseTime(heroStyles.getPropertyValue("--hero-fade-delay"));
  const fadeDurationMs = parseTime(heroStyles.getPropertyValue("--hero-fade-duration"));
  const fadeTotalMs = fadeDelayMs + fadeDurationMs;

  let imageReady = !img;
  let fadeReady = fadeTotalMs <= 0;

  const reveal = () => {
    if (hero.classList.contains("is-visible")) return;
    void hero.offsetWidth;
    hero.classList.add("is-visible");
  };

  const tryReveal = () => {
    if (imageReady && fadeReady) {
      reveal();
    }
  };

  if (!fadeReady) {
    window.setTimeout(() => {
      fadeReady = true;
      tryReveal();
    }, fadeTotalMs);
  }

  if (img) {
    const markImageReady = () => {
      imageReady = true;
      tryReveal();
    };
    if (img.complete && img.naturalWidth > 0) {
      markImageReady();
    } else {
      img.addEventListener("load", markImageReady, { once: true });
      img.addEventListener("error", markImageReady, { once: true });
    }
  }

  tryReveal();

  const desktopNavQuery = window.matchMedia("(min-width: 1024px)");
  const docEl = document.documentElement;
  const updateHeroOverlap = () => {
    if (!desktopNavQuery.matches || !nav) {
      docEl.style.setProperty("--nav-desktop-height", "0px");
      return;
    }
    const navHeight = Math.max(0, nav.offsetHeight || 0);
    docEl.style.setProperty("--nav-desktop-height", `${navHeight}px`);
  };

  const scheduleHeroOverlapUpdate = () => {
    window.requestAnimationFrame(updateHeroOverlap);
  };

  scheduleHeroOverlapUpdate();
  window.addEventListener("resize", scheduleHeroOverlapUpdate);
  window.addEventListener("load", scheduleHeroOverlapUpdate);
  if (typeof desktopNavQuery.addEventListener === "function") {
    desktopNavQuery.addEventListener("change", scheduleHeroOverlapUpdate);
  } else if (typeof desktopNavQuery.addListener === "function") {
    desktopNavQuery.addListener(scheduleHeroOverlapUpdate);
  }

  const overlayQuery = window.matchMedia("(min-width: 1024px)");
  let overlayEnabled = overlayQuery.matches;
  let overlayStage = 0;

  const updateNavState = () => {
    if (!nav) return;
    const shouldBeSolid = overlayEnabled && overlayStage >= 2;
    nav.classList.toggle("is-solid", shouldBeSolid);
    if (desktopLogoImg) {
      const targetSrc = shouldBeSolid ? LOGO_SRC_BLACK : LOGO_SRC_WHITE;
      if (desktopLogoImg.getAttribute("src") !== targetSrc) {
        desktopLogoImg.setAttribute("src", targetSrc);
      }
    }
  };

  const updateScrollOverlay = () => {
    let value = 0;
    if (overlayEnabled) {
      if (overlayStage === 1) value = 0.5;
      else if (overlayStage >= 2) value = 1;
    }
    hero.style.setProperty("--hero-scroll-overlay", String(value));
    updateNavState();
  };

  const resetOverlay = () => {
    overlayStage = 0;
    updateScrollOverlay();
  };

  const handleMediaChange = event => {
    overlayEnabled = event.matches;
    resetOverlay();
  };

  if (typeof overlayQuery.addEventListener === "function") {
    overlayQuery.addEventListener("change", handleMediaChange);
  } else if (typeof overlayQuery.addListener === "function") {
    overlayQuery.addListener(handleMediaChange);
  }

  updateScrollOverlay();

  const handleWheel = event => {
    if (!overlayEnabled) return;
    if (event.deltaY > 0) {
      overlayStage = Math.min(2, overlayStage + 1);
      updateScrollOverlay();
    } else if (event.deltaY < 0) {
      overlayStage = Math.max(0, overlayStage - 1);
      updateScrollOverlay();
    }
  };

  window.addEventListener("wheel", handleWheel, { passive: true });
  window.addEventListener("scroll", () => {
    if (!overlayEnabled) return;
    if (window.scrollY <= 0 && overlayStage !== 0) {
      resetOverlay();
    }
  }, { passive: true });
});
