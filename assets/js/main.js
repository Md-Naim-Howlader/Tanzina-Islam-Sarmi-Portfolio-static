(function () {
    "use strict";
    const navbar = document.getElementById("siteNavbar");
    const navCollapseEl = document.getElementById("navMenu");
    const bsCollapse = navCollapseEl
        ? new bootstrap.Collapse(navCollapseEl, { toggle: false })
        : null;

    /* Navbar scroll state */
    window.addEventListener(
        "scroll",
        function () {
            navbar.classList.toggle("scrolled", window.scrollY > 60);
            document
                .getElementById("scrollTop")
                .classList.toggle("show", window.scrollY > 500);
        },
        { passive: true },
    );

    /* Close mobile menu after tapping a link */
    document.querySelectorAll("#navMenu .nav-link").forEach((a) => {
        a.addEventListener("click", () => {
            if (bsCollapse) bsCollapse.hide();
        });
    });

    /* Active nav link on scroll */
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll("#navMenu .nav-link");
    const navObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    navLinks.forEach((l) => l.classList.remove("active"));
                    const link = document.querySelector(
                        '#navMenu .nav-link[href="#' + entry.target.id + '"]',
                    );
                    if (link) link.classList.add("active");
                }
            });
        },
        { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => navObserver.observe(s));

    /* Scroll top button */
    document.getElementById("scrollTop").addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* Reveal on scroll */
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 },
    );
    document
        .querySelectorAll(".reveal")
        .forEach((el) => revealObserver.observe(el));

    /* Animated counters */
    const counters = document.querySelectorAll(".num[data-count]");
    const countObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.getAttribute("data-count"), 10);
                const suffix = el.getAttribute("data-suffix") || "";
                const duration = 1400;
                const start = performance.now();
                function tick(now) {
                    const p = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    const val = Math.floor(eased * target);
                    el.textContent = val.toLocaleString("en-US") + suffix;
                    if (p < 1) requestAnimationFrame(tick);
                    else
                        el.textContent =
                            target.toLocaleString("en-US") + suffix;
                }
                requestAnimationFrame(tick);
                countObserver.unobserve(el);
            });
        },
        { threshold: 0.5 },
    );
    counters.forEach((c) => countObserver.observe(c));

    /* Hero slider */
    const slides = document.querySelectorAll("#heroSlides img");
    const dotsWrap = document.getElementById("heroDots");
    let current = 0,
        timer;
    slides.forEach((_, i) => {
        const b = document.createElement("button");
        if (i === 0) b.classList.add("active");
        b.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(b);
    });
    const dots = dotsWrap.querySelectorAll("button");
    function goTo(i) {
        slides[current].classList.remove("active");
        dots[current].classList.remove("active");
        current = i;
        slides[current].classList.add("active");
        dots[current].classList.add("active");
    }
    function next() {
        goTo((current + 1) % slides.length);
    }
    function startAuto() {
        timer = setInterval(next, 5000);
    }
    function stopAuto() {
        clearInterval(timer);
    }
    if (slides.length > 1) {
        startAuto();
    }

    /* Gallery filter — animated reflow (FLIP technique), like Isotope */
    const filterBtns = document.querySelectorAll("#filters button");
    const galItems = document.querySelectorAll(".gal-item");
    const FADE_OUT_MS = 220;

    function applyFilter(filterValue) {
        const items = Array.from(galItems);
        const showList = [];
        const hideList = [];
        items.forEach((item) => {
            const match =
                filterValue === "all" ||
                item.getAttribute("data-cat") === filterValue;
            if (match) showList.push(item);
            else hideList.push(item);
        });

        const firstRects = new Map();
        items.forEach((item) => {
            if (!item.classList.contains("hide")) {
                firstRects.set(item, item.getBoundingClientRect());
            }
        });

        hideList.forEach((item) => {
            if (!item.classList.contains("hide"))
                item.classList.add("fading-out");
        });

        setTimeout(function () {
            hideList.forEach((item) => {
                item.classList.add("hide");
                item.classList.remove("fading-out");
            });

            const wasHidden = new Map();
            showList.forEach((item) => {
                wasHidden.set(item, item.classList.contains("hide"));
                item.classList.remove("hide");
                if (wasHidden.get(item)) item.classList.add("entering");
            });

            requestAnimationFrame(function () {
                showList.forEach((item) => {
                    const first = firstRects.get(item);
                    if (!first) return;
                    const last = item.getBoundingClientRect();
                    const dx = first.left - last.left;
                    const dy = first.top - last.top;
                    if (dx || dy) {
                        item.style.transition = "none";
                        item.style.transform =
                            "translate(" + dx + "px," + dy + "px)";
                    }
                });
                void document.body.offsetHeight;
                requestAnimationFrame(function () {
                    showList.forEach((item) => {
                        item.style.transition = "";
                        item.style.transform = "";
                        item.classList.remove("entering");
                    });
                });
            });
        }, FADE_OUT_MS);
    }

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            filterBtns.forEach((b) => b.classList.remove("active"));
            this.classList.add("active");
            applyFilter(this.getAttribute("data-filter"));
        });
    });

    /* Lightbox */
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    galItems.forEach((item) => {
        item.addEventListener("click", function () {
            const img = this.querySelector("img");
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add("open");
        });
    });
    function closeLightbox() {
        lightbox.classList.remove("open");
    }
    document
        .getElementById("lightboxClose")
        .addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeLightbox();
    });
})();
