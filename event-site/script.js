/* ============================================================
   未来智造 · AI创新体验日 — 网站交互脚本
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 常量 ---------- */
  var EVENT_DATE = new Date("2026-08-22T14:00:00+08:00");
  var DEADLINE = new Date("2026-08-19T18:00:00+08:00");
  var STORE_KEY = "futureai-registrations";
  var MAX_SEATS = 80;

  /* ---------- 工具 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- 顶部导航滚动效果 ---------- */
  var header = $("#siteHeader");
  function onScroll() {
    if (window.scrollY > 10) { header.classList.add("scrolled"); }
    else { header.classList.remove("scrolled"); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 移动端菜单 ---------- */
  var navToggle = $("#navToggle");
  var mainNav = $("#mainNav");
  navToggle.addEventListener("click", function () {
    var open = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  });
  $all(".main-nav a").forEach(function (a) {
    a.addEventListener("click", function () {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- 滚动显现动画 ---------- */
  var revealEls = $all(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 倒计时 ---------- */
  var cdDays = $("#cdDays"), cdHours = $("#cdHours"), cdMins = $("#cdMins"), cdSecs = $("#cdSecs");
  function updateCountdown() {
    var diff = EVENT_DATE.getTime() - Date.now();
    if (diff <= 0) {
      cdDays.textContent = "00"; cdHours.textContent = "00"; cdMins.textContent = "00"; cdSecs.textContent = "00";
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    cdDays.textContent = pad(d); cdHours.textContent = pad(h); cdMins.textContent = pad(m); cdSecs.textContent = pad(s);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- 报名表单 ---------- */
  var form = $("#regForm");
  var successPanel = $("#regSuccess");
  var closedPanel = $("#regClosed");
  var regNo = $("#regNo");
  var ideaText = $("#fIdea");
  var ideaCount = $("#ideaCount");

  // 创意想法字数统计
  ideaText.addEventListener("input", function () {
    ideaCount.textContent = ideaText.value.length;
  });

  function readRegs() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveReg(reg) {
    var list = readRegs();
    list.push(reg);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
    return list.length;
  }
  function genRegNo(seq) {
    return "FAI-" + (2026 % 100) + pad((seq + 1) % 100);
  }

  function setError(input, msg) {
    var err = input.parentElement.querySelector(".field-error");
    if (err) err.textContent = msg || "";
    if (msg) {
      input.classList.add("invalid");
    } else {
      input.classList.remove("invalid");
    }
  }

  function validate() {
    var ok = true;
    var name = $("#fName"), phone = $("#fPhone"), email = $("#fEmail"), role = $("#fRole"), agree = $("#fAgree");

    if (!name.value.trim()) { setError(name, "请填写姓名"); ok = false; }
    else { setError(name, ""); }

    if (!phone.value.trim()) { setError(phone, "请填写手机号"); ok = false; }
    else if (!/^1[3-9]\d{9}$/.test(phone.value.trim())) { setError(phone, "请输入正确的 11 位手机号"); ok = false; }
    else { setError(phone, ""); }

    if (!email.value.trim()) { setError(email, "请填写邮箱"); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError(email, "邮箱格式不正确"); ok = false; }
    else { setError(email, ""); }

    if (!role.value) { setError(role, "请选择身份"); ok = false; }
    else { setError(role, ""); }

    var laptop = form.querySelector('input[name="laptop"]:checked');
    if (!laptop) {
      var lapErr = $("#fLaptop").parentElement.querySelector(".field-error");
      lapErr.textContent = "请选择是否携带笔记本电脑";
      ok = false;
    } else {
      var lapErr2 = $("#fLaptop").parentElement.querySelector(".field-error");
      lapErr2.textContent = "";
    }

    if (!agree.checked) {
      $("#agreeError").textContent = "请先确认报名信息";
      ok = false;
    } else {
      $("#agreeError").textContent = "";
    }

    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var list = readRegs();
    if (list.length >= MAX_SEATS) {
      form.hidden = true;
      closedPanel.hidden = false;
      return;
    }

    var seq = saveReg({
      name: $("#fName").value.trim(),
      phone: $("#fPhone").value.trim(),
      email: $("#fEmail").value.trim(),
      role: $("#fRole").value,
      org: $("#fOrg").value.trim(),
      laptop: form.querySelector('input[name="laptop"]:checked').value,
      idea: ideaText.value.trim(),
      time: new Date().toISOString()
    });

    regNo.textContent = genRegNo(seq);
    form.hidden = true;
    successPanel.hidden = false;
    successPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  // 实时清除错误提示
  ["input", "change"].forEach(function (evt) {
    $all("#regForm input, #regForm select, #regForm textarea").forEach(function (el) {
      el.addEventListener(evt, function () { setError(el, ""); $("#agreeError").textContent = ""; });
    });
  });

  $("#regAgain").addEventListener("click", function () {
    form.reset();
    form.hidden = false;
    successPanel.hidden = true;
    ideaCount.textContent = "0";
    $("#fName").focus();
  });

  /* ---------- 报名截止判断 ---------- */
  function checkDeadline() {
    if (Date.now() > DEADLINE.getTime()) {
      form.hidden = true;
      closedPanel.hidden = false;
    }
  }
  checkDeadline();

  /* ---------- 输入框错误样式 ---------- */
  var style = document.createElement("style");
  style.textContent = ".invalid { border-color: #ef4444 !important; }";
  document.head.appendChild(style);
})();
