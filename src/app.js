/* ═══════════════════════════════════════════════════════════
   ЧВК «MSF-043» — интерактив // чистый JS
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── ПРЕЛОАДЕР ── */
  var pre = document.getElementById("pre");
  var t0 = Date.now();
  function hidePre() {
    var wait = Math.max(0, 950 - (Date.now() - t0));
    setTimeout(function () {
      if (pre) pre.classList.add("off");
      document.body.style.overflow = "";
      startTypewriter();
    }, wait);
  }
  document.body.style.overflow = "hidden";
  if (document.readyState === "complete") hidePre();
  else window.addEventListener("load", hidePre);
  setTimeout(hidePre, 3200); // страховка

  /* ── КУРСОР-СВЕЧЕНИЕ (lerp) ── */
  var glow = document.getElementById("glow");
  var gx = -600, gy = -600, mx = -600, my = -600;
  if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loopGlow() {
      gx += (mx - gx) * 0.09;
      gy += (my - gy) * 0.09;
      glow.style.transform = "translate(" + (gx - 260) + "px," + (gy - 260) + "px)";
      requestAnimationFrame(loopGlow);
    })();
  }

  /* ── НАВИГАЦИЯ + ПРОГРЕСС СКРОЛЛА ── */
  var nav = document.getElementById("nav");
  var progressBar = document.querySelector("#progress span");
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("scrolled", y > 40);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── БУРГЕР-МЕНЮ ── */
  var burger = document.getElementById("burger");
  var mmenu = document.getElementById("mmenu");
  if (burger && mmenu) {
    burger.addEventListener("click", function () {
      var open = mmenu.classList.toggle("open");
      burger.classList.toggle("x", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      mmenu.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mmenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mmenu.classList.remove("open");
        burger.classList.remove("x");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ── АКТИВНАЯ ССЫЛКА В НАВИГАЦИИ ── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var secForLink = {};
  navLinks.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el) secForLink[id] = a;
  });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        navLinks.forEach(function (a) { a.classList.remove("act"); });
        var a = secForLink[en.target.id];
        if (a) a.classList.add("act");
      }
    });
  }, { rootMargin: "-38% 0px -55% 0px" });
  Object.keys(secForLink).forEach(function (id) { spy.observe(document.getElementById(id)); });

  /* ── ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ ── */
  var rvObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("on");
        rvObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".rv").forEach(function (el) { rvObs.observe(el); });

  /* ── СЧЁТЧИКИ В HERO ── */
  var cntObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, n = parseInt(el.getAttribute("data-n"), 10);
      cntObs.unobserve(el);
      if (reduceMotion) { el.textContent = n; return; }
      var start = null;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / 1100);
        el.textContent = String(Math.round(n * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".cnt").forEach(function (el) { cntObs.observe(el); });

  /* ── ПЕЧАТНАЯ МАШИНКА ── */
  var phrases = [
    "Дисциплина — наше основное оружие.",
    "Структура вместо хаоса.",
    "Один состав. Один приказ. Один результат.",
    "Порядок под контролем СКИВР.",
    "От статуса Ку — до грейда K6."
  ];
  var tw = document.getElementById("tw");
  var twStarted = false;
  function startTypewriter() {
    if (twStarted || !tw) return;
    twStarted = true;
    if (reduceMotion) { tw.textContent = phrases[0]; return; }
    var pi = 0, ci = 0, del = false;
    (function type() {
      var full = phrases[pi];
      tw.textContent = full.slice(0, ci);
      var t = del ? 26 : 62;
      if (!del && ci === full.length) { del = true; t = 2100; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; t = 420; }
      else ci += del ? -1 : 1;
      setTimeout(type, t);
    })();
  }

  /* ── ПАРАЛЛАКС ЭМБЛЕМЫ В HERO ── */
  var heroEmb = document.getElementById("heroEmb");
  var hero = document.querySelector(".hero");
  if (!reduceMotion && heroEmb && hero && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      heroEmb.style.transform = "translate(" + dx * 18 + "px," + dy * 14 + "px)";
    }, { passive: true });
    hero.addEventListener("pointerleave", function () { heroEmb.style.transform = ""; });
  }

  /* ── ДАННЫЕ ГРЕЙДОВ ── */
  var GRADES = {
    ky: {
      grade: "Ку", tag: "Учебный статус // переходный этап",
      title: "Учебный — перед первым грейдом",
      desc: "Статус первичного отбора и обучения. Полноценным грейдом не признаётся: это фильтр, отсеивающий случайных людей до попадания в строй.",
      pts: [
        "Срок нахождения — максимум 7 календарных дней",
        "Практическая аттестация + тест: 10 вопросов Регламента, минимум 7 верных",
        "Боевые операции — только по учебной программе, под контролем старшего состава",
        "Не перешёл в K1 вовремя — контракт расторгается"
      ],
      next: "Переход в K1 // аттестация + тест 7/10"
    },
    k1: {
      grade: "K1", tag: "Карбогрейд I степени",
      title: "Базовая боевая единица",
      desc: "Начальная подготовка завершена, базовая безопасность подтверждена. Оперативник допущен к ограниченному участию в операциях под контролем старшего состава.",
      pts: [
        "Права командования — нет",
        "Обязательное подчинение оперативникам K3 и выше",
        "Специализация — не выше первого уровня корпуса",
        "Задача этапа — закрепить базу и адаптироваться к боевой среде"
      ],
      next: "До K2 // 15 баллов"
    },
    k2: {
      grade: "K2", tag: "Карбогрейд II степени",
      title: "Стабильность в составе группы",
      desc: "Испытательный срок пройден, стабильность выполнения задач подтверждена. Допуск к полноценному участию в операциях в составе группы.",
      pts: [
        "Уровень самостоятельности повышен",
        "Подчинение старшим грейдам сохраняется",
        "Развитие корпуса — до второго уровня (кроме RSC и TSC)",
        "Минимальный грейд для отбора в Double MilSec"
      ],
      next: "До K3 // 45 баллов"
    },
    k3: {
      grade: "K3", tag: "Карбогрейд III степени",
      title: "Опорный элемент группы",
      desc: "Сформировавшаяся боевая единица с подтверждённым опытом операций. Действует без постоянного контроля, привлекается к обучению младшего состава.",
      pts: [
        "Специализация — до третьего уровня корпуса",
        "Расширение функциональных обязанностей",
        "Минимальный грейд для отбора в USF, Ревизора и Модератора СКИВР",
        "USF-штатный получает приоритет командования над линейными K3 и ниже"
      ],
      next: "До K4 // 90 баллов"
    },
    k4: {
      grade: "K4", tag: "Карбогрейд IV степени // командный состав",
      title: "Переход в командиры",
      desc: "Устойчивые лидерские качества, высокая дисциплина, способность передавать опыт. С этого грейда оперативник — командный состав Компании.",
      pts: [
        "Право командования группой и вспомогательные должности",
        "Доступ γάμμα + должность поддерживающей специализации",
        "Участие в планировании операций",
        "Минимальный грейд для Аналитика, Инструктора и Инспектора СКИВР"
      ],
      next: "До K5 // 150 баллов + заслуги"
    },
    k5: {
      grade: "K5", tag: "Карбогрейд V степени",
      title: "Командир подразделения",
      desc: "Значительный боевой опыт и подтверждённые управленческие способности. В подчинение — подразделение уровня взвода, ответственность — за его боеспособность.",
      pts: [
        "Доступ βῆτα + внутренний или внешний отдел MSF",
        "Минимальный грейд для должности Логиста",
        "Минимальный грейд для Супервайзера СКИВР",
        "Требования: безупречная дисциплина и стратегическое мышление"
      ],
      next: "До K6 // 220 баллов + заслуги"
    },
    k6: {
      grade: "K6", tag: "Карбогрейд VI степени // высший",
      title: "Вершина системы",
      desc: "Высший уровень квалификации Карбогрейда. Управление крупными подразделениями и участие в стратегическом планировании Компании.",
      pts: [
        "Прямое подчинение высшему руководству",
        "Стратегическое планирование",
        "Ответственность за стабильность всего вверенного направления",
        "Эталон для всего личного состава MSF-043"
      ],
      next: "Максимальный грейд // потолок системы"
    }
  };

  /* ── ТАБЫ ГРЕЙДОВ ── */
  var gpTag = document.getElementById("gpTag"),
      gpTitle = document.getElementById("gpTitle"),
      gpDesc = document.getElementById("gpDesc"),
      gpPts = document.getElementById("gpPts"),
      gpGrade = document.getElementById("gpGrade"),
      gpNext = document.getElementById("gpNext"),
      gpanel = document.getElementById("gpanel");

  function renderGrade(key) {
    var g = GRADES[key];
    if (!g || !gpTag) return;
    gpTag.textContent = g.tag;
    gpTitle.textContent = g.title;
    gpDesc.textContent = g.desc;
    gpGrade.textContent = g.grade;
    gpNext.textContent = g.next;
    gpPts.innerHTML = "";
    g.pts.forEach(function (p) {
      var li = document.createElement("li");
      li.textContent = p;
      gpPts.appendChild(li);
    });
    gpanel.classList.remove("swap");
    void gpanel.offsetWidth; // рестарт анимации
    gpanel.classList.add("swap");
  }
  document.querySelectorAll(".gt").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".gt").forEach(function (b) { b.classList.remove("on"); });
      btn.classList.add("on");
      renderGrade(btn.getAttribute("data-g"));
    });
  });
  renderGrade("k1");

  /* ── ЛЁГКИЙ НАКЛОН КАРТОЧЕК ФОРМИРОВАНИЙ ── */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-dy * 4) + "deg) rotateY(" + (dx * 5) + "deg) translateY(-6px)";
      }, { passive: true });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ── КОПИРОВАНИЕ ИНВАЙТА ── */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2400);
  }
  var copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var link = "https://discord.gg/dGPaKnT99C";
      function done() { showToast("Ссылка скопирована"); }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(link).then(done, function () { fallback(); });
      } else fallback();
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = link;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); }
        catch (e) { showToast(link); }
        document.body.removeChild(ta);
      }
    });
  }

  /* ── ГОД В ФУТЕРЕ ── */
  var yy = document.getElementById("yy");
  if (yy) yy.textContent = String(new Date().getFullYear());
})();
