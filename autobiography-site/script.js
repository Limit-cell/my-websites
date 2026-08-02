/* ============================================================
   LJM · 我的自传 — 交互脚本
   ============================================================ */
(function () {
  "use strict";

  function $(s, r) { return (r || document).querySelector(s); }

  /* ---------- 顶栏滚动效果 ---------- */
  var topbar = $("#topbar");
  function onScroll() {
    if (window.scrollY > 12) topbar.classList.add("scrolled");
    else topbar.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 移动端菜单 ---------- */
  var burger = $("#burger");
  var nav = $("#mainNav");
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- 背景粒子 ---------- */
  (function makeParticles() {
    var box = $("#particles");
    if (!box) return;
    var count = window.innerWidth < 760 ? 18 : 34;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "particle";
      var size = 1.5 + Math.random() * 3;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = "-10px";
      p.style.setProperty("--op", (0.25 + Math.random() * 0.55).toFixed(2));
      p.style.animationDuration = (7 + Math.random() * 14).toFixed(1) + "s";
      p.style.animationDelay = (-Math.random() * 20).toFixed(1) + "s";
      box.appendChild(p);
    }
  })();

  /* ---------- 终端打字效果 ---------- */
  (function typewriter() {
    var target = $("#typeText");
    if (!target) return;
    var lines = [
      "踏实自律 · 心怀进取",
      "电气工程与智能控制专业大一学生",
      "热爱钻研 · 专注硬件与工程实践"
    ];
    var lineIdx = 0, charIdx = 0;
    var current = "";
    function type() {
      var line = lines[lineIdx];
      charIdx++;
      current = line.slice(0, charIdx);
      target.textContent = current;
      if (charIdx < line.length) {
        setTimeout(type, 90);
      } else {
        setTimeout(function () {
          lineIdx++;
          charIdx = 0;
          current = "";
          if (lineIdx >= lines.length) {
            target.textContent = lines[lines.length - 1];
            return; // 全部打完，停留
          }
          target.textContent = "";
          setTimeout(type, 420);
        }, 1300);
      }
    }
    var started = false;
    function startWhenVisible() {
      var rect = target.getBoundingClientRect();
      if (!started && rect.top < window.innerHeight * 0.9) {
        started = true;
        setTimeout(type, 600);
        window.removeEventListener("scroll", startWhenVisible);
        window.removeEventListener("resize", startWhenVisible);
      }
    }
    window.addEventListener("scroll", startWhenVisible, { passive: true });
    window.addEventListener("resize", startWhenVisible);
    startWhenVisible();
  })();

  /* ---------- 滚动显现动画 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 特质指数条动画 ---------- */
  var bars = document.querySelectorAll(".bar-fill");
  if ("IntersectionObserver" in window) {
    var barIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
          barIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { barIO.observe(b); });
  } else {
    bars.forEach(function (b) { b.classList.add("animated"); });
  }

  /* ---------- 平滑锚点（降级处理，浏览器原生已支持） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length > 1 && document.querySelector(id)) return; // 交给 CSS scroll-behavior
    });
  });
})();
