import PhotoSwipeLightbox from "./photoswipe/photoswipe-lightbox.esm.js";
import PhotoSwipe from "./photoswipe/photoswipe.esm.js";
import PhotoSwipeDynamicCaption from "./photoswipe/photoswipe-dynamic-caption-plugin.esm.min.js";
import * as params from "@params";

const gallery = document.getElementById("gallery");

if (gallery) {
  const lightbox = new PhotoSwipeLightbox({
    gallery,
    children: ".gallery-item",
    showHideAnimationType: "zoom",
    bgOpacity: 1,
    pswpModule: PhotoSwipe,
    imageClickAction: "close",
    closeTitle: params.closeTitle,
    zoomTitle: params.zoomTitle,
    arrowPrevTitle: params.arrowPrevTitle,
    arrowNextTitle: params.arrowNextTitle,
    errorMsg: params.errorMsg,
    // Wix-style sizing: leave whitespace, reserve right column for caption
    paddingFn: (viewportSize) => ({
      top: Math.max(60, viewportSize.y * 0.08),
      bottom: Math.max(60, viewportSize.y * 0.08),
      left: Math.max(60, viewportSize.x * 0.06),
      right: viewportSize.x > 700 ? Math.max(280, viewportSize.x * 0.30) : 30,
    }),
  });

  // Love (heart) button — toggle per-image, persist to localStorage
  lightbox.on("uiRegister", () => {
    lightbox.pswp.ui.registerElement({
      name: "love-button",
      order: 9,
      isButton: true,
      tagName: "button",
      html: {
        isCustomSVG: true,
        inner:
          '<path id="pswp__icn-love-outline" d="M16 28.6 4.7 17.3a6 6 0 1 1 8.5-8.5L16 11.6l2.8-2.8a6 6 0 1 1 8.5 8.5L16 28.6Z" fill="none" stroke="currentColor" stroke-width="2"/>' +
          '<path id="pswp__icn-love-filled" d="M16 28.6 4.7 17.3a6 6 0 1 1 8.5-8.5L16 11.6l2.8-2.8a6 6 0 1 1 8.5 8.5L16 28.6Z" fill="currentColor" style="display:none"/>',
        outlineID: "pswp__icn-love-outline",
      },
      onInit: (el, pswp) => {
        el.setAttribute("title", "Love");
        el.classList.add("pswp__button--love");
        const refresh = () => {
          const target = pswp.currSlide?.data?.element?.dataset?.pswpTarget;
          const loved = target && localStorage.getItem("loved:" + target) === "1";
          el.classList.toggle("pswp__button--loved", !!loved);
          const outline = el.querySelector("#pswp__icn-love-outline");
          const filled = el.querySelector("#pswp__icn-love-filled");
          if (outline && filled) {
            outline.style.display = loved ? "none" : "";
            filled.style.display = loved ? "" : "none";
          }
        };
        pswp.on("change", refresh);
        el.addEventListener("click", () => {
          const target = pswp.currSlide?.data?.element?.dataset?.pswpTarget;
          if (!target) return;
          const key = "loved:" + target;
          if (localStorage.getItem(key) === "1") {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, "1");
          }
          refresh();
        });
        refresh();
      },
    });
  });

  if (params.enableDownload) {
    lightbox.on("uiRegister", () => {
      lightbox.pswp.ui.registerElement({
        name: "download-button",
        order: 8,
        isButton: true,
        tagName: "a",
        html: {
          isCustomSVG: true,
          inner: '<path d="M20.5 14.3 17.1 18V10h-2.2v7.9l-3.4-3.6L10 16l6 6.1 6-6.1ZM23 23H9v2h14Z" id="pswp__icn-download"/>',
          outlineID: "pswp__icn-download",
        },
        onInit: (el, pswp) => {
          el.setAttribute("download", "");
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener");
          el.setAttribute("title", params.downloadTitle || "Download");
          pswp.on("change", () => {
            el.href = pswp.currSlide.data.element.href;
          });
        },
      });
    });
  }

  lightbox.on("change", () => {
    const target = lightbox.pswp.currSlide?.data?.element?.dataset["pswpTarget"];
    history.replaceState("", document.title, "#" + target);
  });

  lightbox.on("close", () => {
    history.replaceState("", document.title, window.location.pathname);
  });

  new PhotoSwipeDynamicCaption(lightbox, {
    mobileLayoutBreakpoint: 700,
    type: "aside",
    horizontalEdgeThreshold: 0,
    mobileCaptionOverlapRatio: 1,
  });

  lightbox.init();

  if (window.location.hash.substring(1).length > 1) {
    const target = window.location.hash.substring(1);
    const items = gallery.querySelectorAll("a");
    for (let i = 0; i < items.length; i++) {
      if (items[i].dataset["pswpTarget"] === target) {
        lightbox.loadAndOpen(i, { gallery });
        break;
      }
    }
  }
}
