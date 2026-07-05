import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const script = `
(function() {
  'use strict';

  if (window.__mediCallLoaded) return;
  window.__mediCallLoaded = true;

  var config = {};
  var widget = null;
  var fabEl = null;
  var pc = null;
  var dc = null;
  var localStream = null;
  var audioEl = null;
  var conversationId = null;
  var callStartTime = null;
  var currentAssistantMsg = null;
  var currentAssistantText = '';
  var pendingSaves = [];
  var muted = false;
  var waveInterval = null;
  var pulseAnimFrame = null;
  var APP_URL = '${appUrl}';
  var cachedServices = null;
  var cachedCfg = null;
  var activeTab = 'call';
  var cachedAgentName = 'AI Receptionist';
  var widgetTheme = 'dark';

  /* ── Multi-step booking state ─────────────────────────── */
  var bookStep = 1;            // 1=service 2=date 3=time 4=details
  var bookSelectedService = null;
  var bookSelectedDate = null; // 'YYYY-MM-DD'
  var bookSelectedTime = null; // display string e.g. '9:30 AM'
  var bookSelectedTimeKey = null; // 'YYYY-MM-DDTHH:MM' for ISO
  var calendarYear = null;
  var calendarMonth = null;   // 0-based

  /* ─── Public API ─────────────────────────────────────── */
  // Global opener — called by CTA buttons in website templates
  window.__mediCallOpen = function(tab) {
    if (widget) {
      // Already open — switch tab if requested
      if (tab && cachedCfg) switchTab(tab, cachedCfg, getColor());
      return;
    }
    if (cachedCfg) {
      var pos = config.position || (cachedCfg.widget && cachedCfg.widget.position) || 'bottom-right';
      openWidget(cachedCfg, getColor(), pos);
      if (tab && cachedCfg) setTimeout(function() { switchTab(tab, cachedCfg, getColor()); }, 50);
    }
  };

  window.MediCall = {
    init: function(options) {
      config = options || {};
      if (options && options.primaryColor) config._color = options.primaryColor;
      if (!config.businessId) { console.error('[MediCall] businessId is required'); return; }
      loadConfig()
        .then(function(cfg) { injectStyles(cfg); createFAB(cfg); })
        .catch(function() {
          var fallback = { widget: { primary_color: config._color || '#0d7377', position: config.position || 'bottom-right', theme: 'dark' }, business: { name: 'AI Receptionist' } };
          injectStyles(fallback);
          createFAB(fallback);
        });
    }
  };

  /* ─── Auto-init from data attributes ────────────────── */
  (function autoInit() {
    var el = document.currentScript ||
      document.querySelector('script[data-business-id][src*="widget-script"]') ||
      document.querySelector('script[src*="widget-script"]');
    if (!el) return;
    var bid = el.getAttribute('data-business-id');
    if (!bid) return;
    var pos     = el.getAttribute('data-position') || 'bottom-right';
    var color   = el.getAttribute('data-color') || '#0d7377';
    var agentId = el.getAttribute('data-agent-id') || null;
    window.MediCall.init({ businessId: bid, position: pos, primaryColor: color, agentId: agentId });
  })();

  /* ─── Config ─────────────────────────────────────────── */
  var configPromise = null;
  function loadConfig() {
    if (cachedCfg) return Promise.resolve(cachedCfg);
    if (configPromise) return configPromise;
    var url = APP_URL + '/api/widget/config?businessId=' + encodeURIComponent(config.businessId);
    if (config.agentId) url += '&agentId=' + encodeURIComponent(config.agentId);
    configPromise = fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(cfg) {
        if (cfg.services) cachedServices = cfg.services;
        if (cfg.widget && cfg.widget.theme) widgetTheme = cfg.widget.theme;
        cachedCfg = cfg;
        configPromise = null;
        return cfg;
      });
    return configPromise;
  }

  /* ─── FAB ────────────────────────────────────────────── */
  function createFAB(cfg) {
    var color   = cfg.widget && cfg.widget.primary_color ? cfg.widget.primary_color : '#22c55e';
    var pos     = config.position || (cfg.widget && cfg.widget.position) || 'bottom-right';
    var isLeft  = pos === 'bottom-left';

    var wrap = document.createElement('div');
    wrap.id = 'carbot-fab-wrap';
    wrap.style.cssText = 'position:fixed;bottom:20px;' + (isLeft ? 'left:20px' : 'right:20px') + ';z-index:2147483646;';

    var ring1 = document.createElement('div');
    ring1.className = 'carbot-ring1';
    ring1.style.background = color;

    var ring2 = document.createElement('div');
    ring2.className = 'carbot-ring2';
    ring2.style.background = color;

    var tip = document.createElement('div');
    tip.className = 'carbot-tooltip';
   

    fabEl = document.createElement('button');
    fabEl.className = 'carbot-fab';
    fabEl.style.cssText = 'background:linear-gradient(135deg,' + color + ',' + color + 'cc);box-shadow:0 8px 24px ' + color + '55,0 2px 8px rgba(0,0,0,.4);';
    fabEl.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.71 13 19.79 19.79 0 011.65 4.4a2 2 0 011.99-2.19h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9.91a16 16 0 006.29 6.29l1.77-1.77a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
    fabEl.addEventListener('click', function() { openWidget(cfg, color, pos); });

    wrap.appendChild(ring1);
    wrap.appendChild(ring2);
    wrap.appendChild(tip);
    wrap.appendChild(fabEl);
    document.body.appendChild(wrap);
    animatePulse(ring1, ring2);
  }

  function animatePulse(r1, r2) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = ((ts - start) % 2200) / 2200;
      var t2 = ((ts - start + 440) % 2200) / 2200;
      r1.style.transform = 'scale(' + (1 + t * 0.5) + ')';
      r1.style.opacity = (0.25 * (1 - t));
      r2.style.transform = 'scale(' + (1 + t2 * 0.8) + ')';
      r2.style.opacity = (0.15 * (1 - t2));
      pulseAnimFrame = requestAnimationFrame(step);
    }
    pulseAnimFrame = requestAnimationFrame(step);
  }

  /* ─── Widget panel ───────────────────────────────────── */
  function openWidget(cfg, color, pos) {
    if (widget) return;
    if (pulseAnimFrame) { cancelAnimationFrame(pulseAnimFrame); pulseAnimFrame = null; }
    var wrap = document.getElementById('carbot-fab-wrap');
    if (wrap) wrap.style.display = 'none';

    cachedCfg = cfg;
    var greeting   = (cfg.widget && cfg.widget.greeting) || (cfg.agent && cfg.agent.greeting) || 'Talk to our AI receptionist — ask about services, hours, or book an appointment.';
    var name       = (cfg.business && cfg.business.name) || 'AI Receptionist';
    var agentName  = (cfg.agent && cfg.agent.name) || 'AI Receptionist';
    cachedAgentName = agentName;
    var isLeft     = pos === 'bottom-left';
    var theme      = (cfg.widget && cfg.widget.theme) || widgetTheme || 'dark';
    widgetTheme    = theme;

    widget = document.createElement('div');
    widget.className = 'carbot-widget carbot-theme-' + theme;
    widget.style.cssText = (isLeft ? 'left:20px' : 'right:20px') + ';';
    widget.innerHTML = buildWidgetHTML(name, agentName, color, greeting);
    document.body.appendChild(widget);

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        widget.style.opacity = '1';
        widget.style.transform = 'translateY(0) scale(1)';
      });
    });

    widget.querySelector('#carbot-close').addEventListener('click', closeWidget);
    widget.querySelector('#carbot-start-btn').addEventListener('click', startVoice);
    widget.querySelector('#carbot-mute-btn').addEventListener('click', toggleMute);
    widget.querySelector('#carbot-end-btn').addEventListener('click', function() { endVoice(); showIdle(); });

    widget.querySelector('#carbot-tab-call').addEventListener('click', function() { switchTab('call', cfg, color); });
    widget.querySelector('#carbot-tab-book').addEventListener('click', function() { switchTab('book', cfg, color); });
  }

  function switchTab(tab, cfg, color) {
    activeTab = tab;
    var tabCall = widget.querySelector('#carbot-tab-call');
    var tabBook = widget.querySelector('#carbot-tab-book');
    var panelCall = widget.querySelector('#carbot-panel-call');
    var panelBook = widget.querySelector('#carbot-panel-book');

    if (tab === 'call') {
      tabCall.classList.add('carbot-tab-active');
      tabBook.classList.remove('carbot-tab-active');
      panelCall.style.display = 'block';
      panelBook.style.display = 'none';
    } else {
      tabBook.classList.add('carbot-tab-active');
      tabCall.classList.remove('carbot-tab-active');
      panelCall.style.display = 'none';
      panelBook.style.display = 'block';
      // Reset to step 1 when opening fresh
      if (bookStep === 1) renderBookStep(color);
    }
  }

  /* ─── Multi-step booking ─────────────────────────────── */
  function renderBookStep(color) {
    var panel = widget && widget.querySelector('#carbot-panel-book');
    if (!panel) return;

    if (bookStep === 1) renderStep1(panel, color);
    else if (bookStep === 2) renderStep2(panel, color);
    else if (bookStep === 3) renderStep3(panel, color);
    else if (bookStep === 4) renderStep4(panel, color);
  }

  /* Step 1: Service selection */
  function renderStep1(panel, color) {
    var services = cachedServices || (cachedCfg && cachedCfg.services) || [];
    var cards = '';
    if (services.length === 0) {
      cards = '<div class="carbot-no-services">No services available. Please contact us directly.</div>';
    } else {
      cards = services.map(function(svc) {
        var priceStr = '';
        if (svc.price_type === 'fixed' && svc.price_min != null) priceStr = '$' + svc.price_min;
        else if (svc.price_type === 'range' && svc.price_min != null && svc.price_max != null) priceStr = '$' + svc.price_min + '–$' + svc.price_max;
        else if (svc.price_type === 'starting_at' && svc.price_min != null) priceStr = 'From $' + svc.price_min;
        else if (svc.price_type === 'call_for_price') priceStr = 'Call for price';
        var durStr = svc.duration_minutes ? svc.duration_minutes + ' min' : '';
        var selected = bookSelectedService && bookSelectedService.id === svc.id;
        return '<div class="carbot-svc-card' + (selected ? ' carbot-svc-selected' : '') + '" data-id="' + escHtml(svc.id) + '" style="' + (selected ? '--svc-border:' + color + ';--svc-bg:' + color + '18' : '') + '">' +
          '<div class="carbot-svc-name">' + escHtml(svc.name) + '</div>' +
          '<div class="carbot-svc-meta">' +
            (durStr ? '<span>' + durStr + '</span>' : '') +
            (durStr && priceStr ? '<span class="carbot-svc-dot">·</span>' : '') +
            (priceStr ? '<span>' + priceStr + '</span>' : '') +
          '</div>' +
        '</div>';
      }).join('');
    }

    panel.innerHTML =
      '<div class="carbot-steps-header">' +
        '<div class="carbot-step-indicator">' + stepDots(1, color) + '</div>' +
        '<div class="carbot-step-title">Select a Service</div>' +
      '</div>' +
      '<div class="carbot-svc-list">' + cards + '</div>' +
      '<div class="carbot-step-nav">' +
        '<div></div>' +
        '<button id="carbot-step-next" class="carbot-step-btn" style="background:' + color + '" disabled>Next</button>' +
      '</div>';

    // Re-select if bookSelectedService is already set
    if (bookSelectedService) {
      var preCard = panel.querySelector('[data-id="' + bookSelectedService.id + '"]');
      if (preCard) preCard.classList.add('carbot-svc-selected');
      panel.querySelector('#carbot-step-next').disabled = false;
    }

    panel.querySelectorAll('.carbot-svc-card').forEach(function(card) {
      card.addEventListener('click', function() {
        panel.querySelectorAll('.carbot-svc-card').forEach(function(c) {
          c.classList.remove('carbot-svc-selected');
          c.style.removeProperty('--svc-border');
          c.style.removeProperty('--svc-bg');
        });
        card.classList.add('carbot-svc-selected');
        card.style.setProperty('--svc-border', color);
        card.style.setProperty('--svc-bg', color + '18');
        var sid = card.getAttribute('data-id');
        var svcs = cachedServices || (cachedCfg && cachedCfg.services) || [];
        bookSelectedService = svcs.find(function(s) { return s.id === sid; }) || { id: sid, name: card.querySelector('.carbot-svc-name').textContent };
        panel.querySelector('#carbot-step-next').disabled = false;
      });
    });

    panel.querySelector('#carbot-step-next').addEventListener('click', function() {
      bookStep = 2;
      var now = new Date();
      calendarYear = now.getFullYear();
      calendarMonth = now.getMonth();
      renderBookStep(color);
    });
  }

  /* Step 2: Calendar date picker */
  function renderStep2(panel, color) {
    panel.innerHTML =
      '<div class="carbot-steps-header">' +
        '<div class="carbot-step-indicator">' + stepDots(2, color) + '</div>' +
        '<div class="carbot-step-title">Pick a Date</div>' +
      '</div>' +
      '<div id="carbot-calendar-wrap"></div>' +
      '<div class="carbot-step-nav">' +
        '<button id="carbot-step-back" class="carbot-step-btn carbot-step-back-btn">Back</button>' +
        '<button id="carbot-step-next" class="carbot-step-btn" style="background:' + color + '" disabled>Next</button>' +
      '</div>';

    renderCalendar(color);

    panel.querySelector('#carbot-step-back').addEventListener('click', function() {
      bookStep = 1; renderBookStep(color);
    });
    panel.querySelector('#carbot-step-next').addEventListener('click', function() {
      if (!bookSelectedDate) return;
      bookStep = 3;
      renderBookStep(color);
    });
  }

  function renderCalendar(color) {
    var wrap = widget && widget.querySelector('#carbot-calendar-wrap');
    if (!wrap) return;

    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];

    var year = calendarYear;
    var month = calendarMonth;
    var today = new Date();
    today.setHours(0,0,0,0);

    // First day of month
    var firstDay = new Date(year, month, 1).getDay();
    // Days in month
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    var dayHeaders = dayNames.map(function(d) {
      return '<div class="carbot-cal-dayhdr">' + d + '</div>';
    }).join('');

    var cells = [];
    // Empty cells before first day
    for (var i = 0; i < firstDay; i++) cells.push('<div></div>');

    for (var d = 1; d <= daysInMonth; d++) {
      var cellDate = new Date(year, month, d);
      cellDate.setHours(0,0,0,0);
      var isPast = cellDate < today;
      var dateStr = year + '-' + pad2(month + 1) + '-' + pad2(d);
      var isSelected = bookSelectedDate === dateStr;
      var cls = 'carbot-cal-day' + (isPast ? ' carbot-cal-past' : '') + (isSelected ? ' carbot-cal-selected' : '');
      var style = isSelected ? 'style="background:' + color + ';color:#fff;border-color:' + color + '"' : '';
      cells.push('<div class="' + cls + '" data-date="' + dateStr + '" ' + style + (isPast ? '' : '') + '>' + d + '</div>');
    }

    wrap.innerHTML =
      '<div class="carbot-cal-nav">' +
        '<button id="carbot-cal-prev" class="carbot-cal-arrow">&#8249;</button>' +
        '<span class="carbot-cal-month">' + monthNames[month] + ' ' + year + '</span>' +
        '<button id="carbot-cal-next" class="carbot-cal-arrow">&#8250;</button>' +
      '</div>' +
      '<div class="carbot-cal-grid">' +
        dayHeaders +
        cells.join('') +
      '</div>';

    // Prev/Next month
    wrap.querySelector('#carbot-cal-prev').addEventListener('click', function() {
      calendarMonth--;
      if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
      renderCalendar(color);
    });
    wrap.querySelector('#carbot-cal-next').addEventListener('click', function() {
      calendarMonth++;
      if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
      renderCalendar(color);
    });

    // Day click
    wrap.querySelectorAll('.carbot-cal-day:not(.carbot-cal-past)').forEach(function(cell) {
      cell.addEventListener('click', function() {
        bookSelectedDate = cell.getAttribute('data-date');
        bookSelectedTime = null;
        bookSelectedTimeKey = null;
        renderCalendar(color);
        var nextBtn = widget && widget.querySelector('#carbot-step-next');
        if (nextBtn) nextBtn.disabled = false;
      });
    });
  }

  /* Step 3: Time slots */
  function renderStep3(panel, color) {
    panel.innerHTML =
      '<div class="carbot-steps-header">' +
        '<div class="carbot-step-indicator">' + stepDots(3, color) + '</div>' +
        '<div class="carbot-step-title">Pick a Time</div>' +
        '<div class="carbot-step-date-label">' + formatDateLabel(bookSelectedDate) + '</div>' +
      '</div>' +
      '<div id="carbot-slots-wrap" class="carbot-slots-loading">Loading slots…</div>' +
      '<div class="carbot-step-nav">' +
        '<button id="carbot-step-back" class="carbot-step-btn carbot-step-back-btn">Back</button>' +
        '<button id="carbot-step-next" class="carbot-step-btn" style="background:' + color + '" disabled>Next</button>' +
      '</div>';

    panel.querySelector('#carbot-step-back').addEventListener('click', function() {
      bookStep = 2; renderBookStep(color);
    });
    panel.querySelector('#carbot-step-next').addEventListener('click', function() {
      if (!bookSelectedTime) return;
      bookStep = 4; renderBookStep(color);
    });

    // Fetch slots
    fetch(APP_URL + '/api/widget/slots?businessId=' + encodeURIComponent(config.businessId) + '&date=' + encodeURIComponent(bookSelectedDate))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var wrap = widget && widget.querySelector('#carbot-slots-wrap');
        if (!wrap) return;

        if (data.closed) {
          wrap.className = 'carbot-slots-empty';
          wrap.innerHTML = 'Closed on this day. Please pick another date.';
          return;
        }

        var slots = data.slots || [];
        if (slots.length === 0) {
          wrap.className = 'carbot-slots-empty';
          wrap.innerHTML = 'No available slots on this day.';
          return;
        }

        wrap.className = 'carbot-slots-grid';
        wrap.innerHTML = slots.map(function(time, idx) {
          // Build timeKey from date + slot index (slots are in 30-min order)
          // We need to reconstruct the key from the display time
          var isSelected = bookSelectedTime === time;
          return '<button class="carbot-slot' + (isSelected ? ' carbot-slot-selected' : '') + '" data-time="' + escHtml(time) + '" ' +
            (isSelected ? 'style="background:' + color + ';color:#fff;border-color:' + color + '"' : '') + '>' + escHtml(time) + '</button>';
        }).join('');

        wrap.querySelectorAll('.carbot-slot').forEach(function(btn) {
          btn.addEventListener('click', function() {
            wrap.querySelectorAll('.carbot-slot').forEach(function(b) {
              b.classList.remove('carbot-slot-selected');
              b.style.removeProperty('background');
              b.style.removeProperty('color');
              b.style.removeProperty('border-color');
            });
            btn.classList.add('carbot-slot-selected');
            btn.style.background = color;
            btn.style.color = '#fff';
            btn.style.borderColor = color;
            bookSelectedTime = btn.getAttribute('data-time');
            // Convert display time to ISO key
            bookSelectedTimeKey = displayTimeToKey(bookSelectedDate, bookSelectedTime);
            var nextBtn = widget && widget.querySelector('#carbot-step-next');
            if (nextBtn) nextBtn.disabled = false;
          });
        });
      })
      .catch(function() {
        var wrap = widget && widget.querySelector('#carbot-slots-wrap');
        if (wrap) { wrap.className = 'carbot-slots-empty'; wrap.innerHTML = 'Could not load slots. Try again.'; }
      });
  }

  /* Step 4: Details form + confirmation */
  function renderStep4(panel, color) {
    var serviceLabel = bookSelectedService ? bookSelectedService.name : 'Not selected';
    var dateLabel = formatDateLabel(bookSelectedDate);
    var timeLabel = bookSelectedTime || '';
    // Compute end time from service duration if available
    var endTimeLabel = '';
    if (bookSelectedTimeKey && bookSelectedService && bookSelectedService.duration_minutes) {
      var startDt = new Date(bookSelectedTimeKey);
      var endDt = new Date(startDt.getTime() + bookSelectedService.duration_minutes * 60000);
      endTimeLabel = ' – ' + formatAMPM(endDt) + ' (' + bookSelectedService.duration_minutes + ' mins)';
    }

    panel.innerHTML =
      '<div class="carbot-steps-header">' +
        '<div class="carbot-step-indicator">' + stepDots(4, color) + '</div>' +
        '<div class="carbot-step-title">Your Details</div>' +
        '<div class="carbot-step-summary">' +
          '<span class="carbot-sum-chip">' + escHtml(serviceLabel) + '</span>' +
          '<span class="carbot-sum-chip">' + escHtml(dateLabel) + ' · ' + escHtml(timeLabel) + escHtml(endTimeLabel) + '</span>' +
        '</div>' +
      '</div>' +
      '<form id="carbot-book-form" class="carbot-book-form">' +
        '<div class="carbot-field">' +
          '<label class="carbot-label">Full Name *</label>' +
          '<input id="carbot-fname" class="carbot-input" type="text" placeholder="Jane Smith" required />' +
        '</div>' +
        '<div class="carbot-field-row">' +
          '<div class="carbot-field">' +
            '<label class="carbot-label">Email *</label>' +
            '<input id="carbot-femail" class="carbot-input" type="email" placeholder="jane@example.com" required />' +
          '</div>' +
          '<div class="carbot-field">' +
            '<label class="carbot-label">Phone</label>' +
            '<input id="carbot-fphone" class="carbot-input" type="tel" placeholder="(555) 000-0000" />' +
          '</div>' +
        '</div>' +
        '<div class="carbot-field">' +
          '<label class="carbot-label">Date of Birth *</label>' +
          '<input id="carbot-fdob" class="carbot-input" type="date" required />' +
        '</div>' +
        '<div class="carbot-field">' +
          '<label class="carbot-label">Insurance Provider</label>' +
          '<input id="carbot-finsurance" class="carbot-input" type="text" placeholder="Optional" />' +
        '</div>' +
        '<div class="carbot-field">' +
          '<label class="carbot-label">Notes</label>' +
          '<textarea id="carbot-fnotes" class="carbot-input carbot-textarea" placeholder="Any additional information…" rows="2"></textarea>' +
        '</div>' +
        '<div id="carbot-book-msg" class="carbot-book-msg" style="display:none"></div>' +
        '<div class="carbot-step-nav" style="margin-top:6px">' +
          '<button type="button" id="carbot-step-back" class="carbot-step-btn carbot-step-back-btn">Back</button>' +
          '<button id="carbot-book-submit" type="submit" class="carbot-step-btn" style="background:' + color + '">Request Appointment</button>' +
        '</div>' +
      '</form>' +
      '<div id="carbot-book-success" class="carbot-book-success" style="display:none">' +
        '<div class="carbot-success-icon" style="color:' + color + '">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
        '</div>' +
        '<div class="carbot-success-title">Appointment Requested!</div>' +
        '<div class="carbot-success-sub">We will confirm for</div>' +
        '<div class="carbot-success-time" id="carbot-success-time">' + escHtml(dateLabel + ' at ' + timeLabel + endTimeLabel) + '</div>' +
        '<div class="carbot-success-note">Check your email for confirmation details.</div>' +
      '</div>';

    panel.querySelector('#carbot-step-back').addEventListener('click', function() {
      bookStep = 3; renderBookStep(color);
    });

    panel.querySelector('#carbot-book-form').addEventListener('submit', function(e) {
      e.preventDefault();
      submitBooking(color);
    });
  }

  /* Submit booking from step 4 (or agent pre-fill) */
  function submitBooking(color) {
    var form = widget && widget.querySelector('#carbot-book-form');
    var submitBtn = widget && widget.querySelector('#carbot-book-submit');
    var msgEl = widget && widget.querySelector('#carbot-book-msg');

    var nameVal     = (widget.querySelector('#carbot-fname').value || '').trim();
    var emailVal    = (widget.querySelector('#carbot-femail').value || '').trim();
    var phoneVal    = (widget.querySelector('#carbot-fphone').value || '').trim();
    var dobVal      = (widget.querySelector('#carbot-fdob').value || '').trim();
    var insuranceVal = (widget.querySelector('#carbot-finsurance') ? widget.querySelector('#carbot-finsurance').value : '') || '';
    var notesVal    = (widget.querySelector('#carbot-fnotes').value || '').trim();

    // Use the multi-step selections as the canonical date/time/service
    var scheduledAt = bookSelectedTimeKey ? (bookSelectedTimeKey + ':00') : null;
    // Fallback: if agent pre-filled form with a hidden input or dataset
    if (!scheduledAt && form && form.dataset.scheduledAt) scheduledAt = form.dataset.scheduledAt;

    var serviceId = bookSelectedService ? bookSelectedService.id : null;
    if (!serviceId && form && form.dataset.serviceId) serviceId = form.dataset.serviceId;

    if (!nameVal || !emailVal || !dobVal || !scheduledAt) {
      showBookMsg(msgEl, 'error', 'Please fill in name, email, date of birth. Select a date and time.');
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Booking…'; }
    showBookMsg(msgEl, '', '');

    var payload = {
      customer_name: nameVal,
      customer_email: emailVal,
      date_of_birth: dobVal,
      scheduled_at: new Date(scheduledAt).toISOString(),
      businessId: config.businessId,
      conversationId: (form && form.dataset.conversationId) || conversationId || null,
    };
    if (phoneVal) payload.customer_phone = phoneVal;
    if (serviceId) payload.service_id = serviceId;
    if (notesVal) payload.notes = notesVal;
    if (insuranceVal) payload.insurance_provider = insuranceVal;

    fetch(APP_URL + '/api/appointments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) throw new Error(data.error);
      if (form) form.style.display = 'none';
      var successEl = widget && widget.querySelector('#carbot-book-success');
      if (successEl) successEl.style.display = 'flex';
    })
    .catch(function(err) {
      showBookMsg(msgEl, 'error', err.message || 'Booking failed. Please try again.');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Request Appointment'; }
    });
  }

  function showBookMsg(el, type, text) {
    if (!el) return;
    el.textContent = text;
    el.style.display = text ? 'block' : 'none';
    el.style.color = type === 'error' ? '#f87171' : '#4ade80';
  }

  /* ─── Agent pre-fill: jump to step 4 and populate ────── */
  function agentPrefillBooking(prefill, convId, color) {
    // Set multi-step state from agent data
    if (prefill.service_id) {
      var svcs = cachedServices || [];
      bookSelectedService = svcs.find(function(s) { return s.id === prefill.service_id; }) || { id: prefill.service_id };
      // Merge duration from prefill if service wasn't found in cache
      if (prefill.duration_minutes && !bookSelectedService.duration_minutes) {
        bookSelectedService.duration_minutes = prefill.duration_minutes;
      }
    }
    if (prefill.scheduled_at) {
      var dt = new Date(prefill.scheduled_at);
      bookSelectedDate = dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate());
      bookSelectedTimeKey = bookSelectedDate + 'T' + pad2(dt.getHours()) + ':' + pad2(dt.getMinutes());
      bookSelectedTime = formatAMPM(dt);
    }

    // Switch to book tab and render step 4
    switchTab('book', cachedCfg, color);
    bookStep = 4;
    renderBookStep(color);

    // Wait a tick then fill fields
    setTimeout(function() {
      var setVal = function(id, val) {
        var el = widget && widget.querySelector(id);
        if (el && val) el.value = val;
      };
      setVal('#carbot-fname', prefill.customer_name);
      setVal('#carbot-femail', prefill.customer_email);
      setVal('#carbot-fphone', prefill.customer_phone);
      setVal('#carbot-fnotes', prefill.notes);
      setVal('#carbot-finsurance', prefill.insurance_provider);
      if (prefill.date_of_birth) setVal('#carbot-fdob', prefill.date_of_birth);

      // Store conversationId on form
      var formEl = widget && widget.querySelector('#carbot-book-form');
      if (formEl && convId) formEl.dataset.conversationId = convId;
    }, 50);
  }

  function closeWidget() {
    endVoice();
    activeTab = 'call';
    bookStep = 1;
    bookSelectedService = null;
    bookSelectedDate = null;
    bookSelectedTime = null;
    bookSelectedTimeKey = null;
    if (widget) {
      widget.style.opacity = '0';
      widget.style.transform = 'translateY(16px) scale(0.95)';
      setTimeout(function() {
        if (widget) { widget.remove(); widget = null; }
        var wrap = document.getElementById('carbot-fab-wrap');
        if (wrap) {
          wrap.style.display = '';
          animatePulse(wrap.querySelector('.carbot-ring1'), wrap.querySelector('.carbot-ring2'));
        }
      }, 220);
    }
  }

  function buildWidgetHTML(name, agentName, color, greeting) {
    var micSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    var endSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07"/><path d="M13.32 10.68A19.5 19.5 0 005 4.71"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    var sparkSvg = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    var msgSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
    var calSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    var phoneSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.71 13 19.79 19.79 0 011.65 4.4a2 2 0 011.99-2.19h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9.91a16 16 0 006.29 6.29l1.77-1.77a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';

    var waveBarHeights = [6, 10, 14, 10, 6];
    var waveBars = waveBarHeights.map(function(h, i) {
      return '<div class="carbot-wbar" data-h="' + h + '" style="height:3px;animation-delay:' + (i * 0.07) + 's;animation-duration:' + (0.55 + i * 0.08) + 's"></div>';
    }).join('');

    return (
      '<div class="carbot-header">' +
        '<div class="carbot-hbg" style="background:linear-gradient(135deg,' + color + '33 0%,transparent 60%)"></div>' +
        '<div class="carbot-header-left">' +
          '<div class="carbot-hicon" style="background:' + color + '22;border:1px solid ' + color + '44">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
          '</div>' +
          '<div>' +
            '<div class="carbot-hname">' + escHtml(name) + '</div>' +
            '<div class="carbot-hsub">' +
              '<div class="carbot-hdot" style="background:' + color + '"></div>' +
              '<span id="carbot-status-text" style="color:' + color + '">' + escHtml(agentName) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="carbot-header-right">' +
          '<div id="carbot-waveform" class="carbot-waveform" style="display:none">' + waveBars + '</div>' +
          '<button id="carbot-close" class="carbot-closebtn" title="Close">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +

      '<div class="carbot-tabs">' +
        '<button id="carbot-tab-call" class="carbot-tab carbot-tab-active" style="--tab-color:' + color + '">' +
          phoneSvg + '<span>Call AI</span>' +
        '</button>' +
        '<button id="carbot-tab-book" class="carbot-tab" style="--tab-color:' + color + '">' +
          calSvg + '<span>Book</span>' +
        '</button>' +
      '</div>' +

      '<div id="carbot-panel-call">' +
        '<div id="carbot-transcript" class="carbot-transcript">' +
          '<div id="carbot-empty-state" class="carbot-empty-state">' +
            '<div class="carbot-empty-icon">' + msgSvg + '</div>' +
            '<span>Conversation will appear here</span>' +
          '</div>' +
        '</div>' +
        '<div class="carbot-controls">' +
          '<div id="carbot-idle" class="carbot-idle">' +
            '<p class="carbot-greeting-text">' + escHtml(greeting) + '</p>' +
            '<div class="carbot-orb-wrap">' +
              '<button id="carbot-start-btn" class="carbot-orb" style="background:linear-gradient(135deg,' + color + ',' + color + 'bb);box-shadow:0 0 20px ' + color + '55,0 4px 16px rgba(0,0,0,.4)">' +
                micSvg +
              '</button>' +
              '<div class="carbot-tap-hint">Tap to start</div>' +
            '</div>' +
          '</div>' +
          '<div id="carbot-active" class="carbot-active-controls" style="display:none">' +
            '<div class="carbot-orb-wrap">' +
              '<div id="carbot-ring-outer" class="carbot-ring-outer" style="background:' + color + '12;display:none"></div>' +
              '<div id="carbot-ring-inner" class="carbot-ring-inner" style="background:' + color + '07;display:none"></div>' +
              '<div id="carbot-listen-ring" class="carbot-listen-ring" style="border-color:' + color + '44;display:none"></div>' +
              '<button id="carbot-mute-btn" class="carbot-orb carbot-orb-active" style="background:linear-gradient(135deg,' + color + ',' + color + 'bb);box-shadow:0 0 20px ' + color + '55,0 4px 16px rgba(0,0,0,.4)">' +
                micSvg +
              '</button>' +
            '</div>' +
            '<div class="carbot-status-row">' +
              '<div id="carbot-state-label" class="carbot-state-label" style="color:' + color + '">' +
                '<div class="carbot-sdot" style="background:' + color + '"></div>' +
                '<span id="carbot-state-text">Listening…</span>' +
              '</div>' +
              '<button id="carbot-end-btn" class="carbot-endbtn">' +
                endSvg + 'End' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div id="carbot-panel-book" style="display:none"></div>' +

      '<div class="carbot-footer">' +
        sparkSvg + '<span>Powered by Raphael Samuel Soutien</span>' +
      '</div>'
    );
  }

  /* ─── Voice connection ───────────────────────────────── */
  async function startVoice() {
    var startBtn = widget.querySelector('#carbot-start-btn');
    startBtn.disabled = true;
    setStatusText('Connecting…');

    try {
      var res = await fetch(APP_URL + '/api/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: config.businessId, agentId: config.agentId || null }),
      });
      var sessionData = await res.json();
      if (sessionData.error) throw new Error(sessionData.error);
      conversationId = sessionData.conversationId;
      var model = sessionData.model || 'gpt-realtime';

      pc = new RTCPeerConnection();
      audioEl = new Audio();
      audioEl.autoplay = true;
      pc.ontrack = function(e) { audioEl.srcObject = e.streams[0]; };

      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.getTracks().forEach(function(t) { pc.addTrack(t, localStream); });

      dc = pc.createDataChannel('oai-events');
      dc.onopen = function() {
        callStartTime = Date.now();
        muted = false;
        showActive();
        setCallState('listening');
        dc.send(JSON.stringify({ type: 'response.create' }));
      };
      dc.onmessage = function(e) {
        try { handleEvent(JSON.parse(e.data)); } catch(_) {}
      };

      var offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      var completeSdp = await new Promise(function(resolve) {
        if (pc.iceGatheringState === 'complete') {
          resolve(pc.localDescription.sdp);
        } else {
          pc.addEventListener('icegatheringstatechange', function() {
            if (pc.iceGatheringState === 'complete') resolve(pc.localDescription.sdp);
          });
        }
      });

      var sdpRes = await fetch(APP_URL + '/api/realtime/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sdp: completeSdp,
          model: model,
          voice: sessionData.voice,
          instructions: sessionData.systemPrompt,
          tools: sessionData.tools,
          turnDetection: sessionData.turnDetection,
        }),
      });
      if (!sdpRes.ok) throw new Error('SDP exchange failed: ' + sdpRes.status);
      var answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    } catch(err) {
      console.error('[MediCall]', err);
      setStatusText('Error: ' + err.message);
      if (startBtn) startBtn.disabled = false;
    }
  }

  function endVoice() {
    stopWaveAnimation();
    var dur = callStartTime ? Math.round((Date.now() - callStartTime) / 1000) : null;
    callStartTime = null;
    if (localStream) { localStream.getTracks().forEach(function(t) { t.stop(); }); localStream = null; }
    if (dc) { try { dc.close(); } catch(_) {} dc = null; }
    if (pc) { try { pc.close(); } catch(_) {} pc = null; }
    if (conversationId) {
      var cid = conversationId;
      conversationId = null;
      var updates = { status: 'completed' };
      if (dur && dur > 0) updates.duration_seconds = dur;
      Promise.all(pendingSaves).then(function() {
        pendingSaves = [];
        fetch(APP_URL + '/api/conversations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: cid, updates: updates }),
        }).catch(function() {});
      });
    }
  }

  function toggleMute() {
    if (!localStream) return;
    muted = !muted;
    localStream.getAudioTracks().forEach(function(t) { t.enabled = !muted; });
    var btn = widget && widget.querySelector('#carbot-mute-btn');
    if (btn) {
      if (muted) {
        btn.style.background = 'rgba(255,255,255,0.08)';
        btn.style.boxShadow = 'none';
        btn.style.border = '1.5px solid rgba(255,255,255,0.12)';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
        setCallState('muted');
      } else {
        var color = getColor();
        btn.style.background = 'linear-gradient(135deg,' + color + ',' + color + 'bb)';
        btn.style.boxShadow = '0 0 20px ' + color + '55,0 4px 16px rgba(0,0,0,.4)';
        btn.style.border = 'none';
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
        setCallState('listening');
      }
    }
  }

  /* ─── Event handling ─────────────────────────────────── */
  function handleEvent(ev) {
    if (ev.type === 'input_audio_buffer.speech_started') {
      if (!muted) setCallState('listening');
    }
    if (ev.type === 'response.created' || ev.type === 'output_audio_buffer.started') {
      if (!muted) setCallState('speaking');
    }
    if (ev.type === 'response.output_audio_transcript.delta') {
      if (!currentAssistantMsg) { currentAssistantMsg = addMessage('ai', ''); currentAssistantText = ''; }
      currentAssistantText += ev.delta || '';
      currentAssistantMsg.querySelector('.carbot-msg-text').textContent = currentAssistantText;
      scrollTranscript();
    }
    if (ev.type === 'response.output_audio_transcript.done') {
      var t = ev.transcript || currentAssistantText || '';
      if (t) {
        if (currentAssistantMsg) currentAssistantMsg.querySelector('.carbot-msg-text').textContent = t;
        saveMessage('assistant', t);
      }
      currentAssistantMsg = null;
      currentAssistantText = '';
      if (!muted) setCallState('listening');
    }
    if (ev.type === 'input_audio_buffer.committed') {
      addMessage('user', '🎤 Voice message');
    }
    if (ev.type === 'response.function_call_arguments.done') {
      var toolArgs = {};
      try { toolArgs = JSON.parse(ev.arguments || '{}'); } catch(_) {}
      fetch(APP_URL + '/api/realtime/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName: ev.name, toolArgs: toolArgs, businessId: config.businessId, conversationId: conversationId }),
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (dc && dc.readyState === 'open') {
          dc.send(JSON.stringify({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: ev.call_id, output: JSON.stringify(data.result) } }));
          dc.send(JSON.stringify({ type: 'response.create' }));
        }
        if (ev.name === 'createAppointment' && data.result && data.result.pending_confirmation) {
          agentPrefillBooking(data.result.prefill || {}, data.result.conversationId, getColor());
        }
      }).catch(function() {});
    }
  }

  /* ─── UI state ───────────────────────────────────────── */
  function setCallState(state) {
    if (!widget) return;
    var color = getColor();
    var stateText = widget.querySelector('#carbot-state-text');
    var stateLabel = widget.querySelector('#carbot-state-label');
    var ringOuter = widget.querySelector('#carbot-ring-outer');
    var ringInner = widget.querySelector('#carbot-ring-inner');
    var listenRing = widget.querySelector('#carbot-listen-ring');
    var waveform = widget.querySelector('#carbot-waveform');

    if (state === 'speaking') {
      if (stateText) stateText.textContent = 'AI Speaking';
      if (stateLabel) stateLabel.style.color = color;
      if (ringOuter) ringOuter.style.display = 'block';
      if (ringInner) ringInner.style.display = 'block';
      if (listenRing) listenRing.style.display = 'none';
      if (waveform) { waveform.style.display = 'flex'; startWaveAnimation(color); }
      animateSpeakingRings(ringOuter, ringInner);
    } else if (state === 'listening') {
      if (stateText) stateText.textContent = 'Listening…';
      if (stateLabel) stateLabel.style.color = color;
      if (ringOuter) { ringOuter.style.display = 'none'; ringOuter.style.transform = 'scale(1)'; }
      if (ringInner) { ringInner.style.display = 'none'; ringInner.style.transform = 'scale(1)'; }
      if (listenRing) listenRing.style.display = 'block';
      if (waveform) { waveform.style.display = 'none'; stopWaveAnimation(); }
    } else if (state === 'muted') {
      if (stateText) stateText.textContent = 'Muted';
      if (stateLabel) stateLabel.style.color = '#64748b';
      if (ringOuter) ringOuter.style.display = 'none';
      if (ringInner) ringInner.style.display = 'none';
      if (listenRing) listenRing.style.display = 'none';
      if (waveform) { waveform.style.display = 'none'; stopWaveAnimation(); }
    }
  }

  function showActive() {
    if (!widget) return;
    var idle = widget.querySelector('#carbot-idle');
    var active = widget.querySelector('#carbot-active');
    if (idle) idle.style.display = 'none';
    if (active) active.style.display = 'flex';
  }

  function showIdle() {
    if (!widget) return;
    var idle = widget.querySelector('#carbot-idle');
    var active = widget.querySelector('#carbot-active');
    var waveform = widget.querySelector('#carbot-waveform');
    if (idle) idle.style.display = 'block';
    if (active) active.style.display = 'none';
    if (waveform) waveform.style.display = 'none';
    stopWaveAnimation();
    setStatusText(cachedAgentName);
    var startBtn = widget.querySelector('#carbot-start-btn');
    if (startBtn) startBtn.disabled = false;
  }

  function setStatusText(text) {
    var el = widget && widget.querySelector('#carbot-status-text');
    if (el) el.textContent = text;
  }

  /* ─── Speaking ring animation ────────────────────────── */
  var ringAnimFrame = null;
  function animateSpeakingRings(outer, inner) {
    if (ringAnimFrame) cancelAnimationFrame(ringAnimFrame);
    var start = null;
    function step(ts) {
      if (!outer || !inner) return;
      if (!start) start = ts;
      var t1 = ((ts - start) % 1400) / 1400;
      var t2 = ((ts - start + 350) % 1400) / 1400;
      outer.style.transform = 'scale(' + (1 + Math.sin(t1 * Math.PI * 2) * 0.125) + ')';
      inner.style.transform = 'scale(' + (1 + Math.sin(t2 * Math.PI * 2) * 0.1) + ')';
      ringAnimFrame = requestAnimationFrame(step);
    }
    ringAnimFrame = requestAnimationFrame(step);
  }

  /* ─── Waveform animation ─────────────────────────────── */
  var waveAnimFrames = [];
  var waveHeights = [6, 10, 14, 10, 6];

  function startWaveAnimation(color) {
    stopWaveAnimation();
    if (!widget) return;
    var bars = widget.querySelectorAll('.carbot-wbar');
    bars.forEach(function(bar, i) {
      bar.style.background = color;
      var start = null;
      var dur = (0.55 + i * 0.08) * 1000;
      var delay = i * 70;
      function step(ts) {
        if (!start) start = ts - delay;
        var t = ((ts - start) % (dur * 2)) / (dur * 2);
        var progress = t < 0.5 ? t * 2 : 2 - t * 2;
        bar.style.height = (3 + (waveHeights[i] - 3) * progress) + 'px';
        waveAnimFrames[i] = requestAnimationFrame(step);
      }
      waveAnimFrames[i] = requestAnimationFrame(step);
    });
  }

  function stopWaveAnimation() {
    waveAnimFrames.forEach(function(f) { if (f) cancelAnimationFrame(f); });
    waveAnimFrames = [];
    if (ringAnimFrame) { cancelAnimationFrame(ringAnimFrame); ringAnimFrame = null; }
    if (widget) {
      widget.querySelectorAll('.carbot-wbar').forEach(function(bar) { bar.style.height = '3px'; });
    }
  }

  /* ─── Transcript ─────────────────────────────────────── */
  function addMessage(role, text) {
    if (!widget) return null;
    var t = widget.querySelector('#carbot-transcript');
    var empty = widget.querySelector('#carbot-empty-state');
    if (empty) empty.style.display = 'none';

    var color = getColor();
    var wrap = document.createElement('div');
    wrap.className = 'carbot-msg-row carbot-msg-' + role;

    var avatar = document.createElement('div');
    avatar.className = 'carbot-avatar';
    if (role === 'ai') {
      avatar.style.cssText = 'background:' + color + '22;border:1px solid ' + color + '44;color:' + color;
      avatar.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>';
    } else {
      avatar.style.cssText = 'background:rgba(255,255,255,0.07);color:#64748b';
      avatar.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    }

    var bubble = document.createElement('div');
    bubble.className = 'carbot-bubble carbot-bubble-' + role;
    if (role === 'ai') {
      bubble.style.cssText = 'background:' + color + '12;border:1px solid ' + color + '25;border-top-left-radius:3px';
    } else {
      bubble.style.cssText = 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-top-right-radius:3px';
    }
    var span = document.createElement('span');
    span.className = 'carbot-msg-text';
    span.textContent = text;
    bubble.appendChild(span);

    if (role === 'user') { wrap.appendChild(bubble); wrap.appendChild(avatar); }
    else { wrap.appendChild(avatar); wrap.appendChild(bubble); }
    t.appendChild(wrap);
    scrollTranscript();
    return wrap;
  }

  function scrollTranscript() {
    var t = widget && widget.querySelector('#carbot-transcript');
    if (t) t.scrollTop = t.scrollHeight;
  }

  function saveMessage(role, content) {
    if (!conversationId || !content.trim()) return;
    var p = fetch(APP_URL + '/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: conversationId, role: role, content: content }),
    }).catch(function() {});
    pendingSaves.push(p);
  }

  /* ─── Helpers ────────────────────────────────────────── */
  function getColor() { return config._color || '#0d7377'; }

  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function formatDateLabel(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function formatAMPM(dt) {
    var h = dt.getHours(), m = dt.getMinutes();
    var ampm = h < 12 ? 'AM' : 'PM';
    var dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return dh + ':' + pad2(m) + ' ' + ampm;
  }

  function displayTimeToKey(dateStr, displayTime) {
    // Parse "9:30 AM" or "10:00 PM" back to HH:MM
    var match = displayTime.match(/(\\d+):(\\d+)\\s*(AM|PM)/i);
    if (!match) return dateStr + 'T00:00';
    var h = parseInt(match[1]);
    var m = parseInt(match[2]);
    var ampm = match[3].toUpperCase();
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return dateStr + 'T' + pad2(h) + ':' + pad2(m);
  }

  function stepDots(current, color) {
    return [1,2,3,4].map(function(n) {
      var active = n === current;
      var done = n < current;
      return '<div class="carbot-dot' + (active ? ' carbot-dot-active' : done ? ' carbot-dot-done' : '') + '" style="' + (active ? 'background:' + color : done ? 'background:' + color + ';opacity:.5' : '') + '"></div>';
    }).join('');
  }

  /* ─── Styles ─────────────────────────────────────────── */
  function injectStyles(cfg) {
    var color = cfg.widget && cfg.widget.primary_color ? cfg.widget.primary_color : '#22c55e';
    var theme  = (cfg.widget && cfg.widget.theme) || 'dark';
    config._color = color;

    if (document.getElementById('carbot-styles')) return;
    var s = document.createElement('style');
    s.id = 'carbot-styles';

    /* ── Theme tokens ── */
    var dark = {
      bg:          'rgba(8,14,16,.97)',
      border:      'rgba(255,255,255,.10)',
      shadow:      '0 24px 64px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.05)',
      headerBorder:'rgba(255,255,255,.07)',
      tabBorder:   'rgba(255,255,255,.07)',
      tabBg:       'transparent',
      tabHoverBg:  'rgba(255,255,255,.04)',
      tabActiveBg: 'rgba(255,255,255,.04)',
      transcriptBorder: 'rgba(255,255,255,.06)',
      emptyColor:  '#2a3f4d',
      greetingColor: '#4b6070',
      tapHintColor: '#3d5060',
      footerBg:    'rgba(0,0,0,.3)',
      footerColor: '#2a3f4d',
      footerBorder:'rgba(255,255,255,.05)',
      closeBg:     'rgba(255,255,255,.06)',
      closeColor:  '#64748b',
      closeHoverBg:'rgba(255,255,255,.12)',
      closeHoverColor: '#e2e8f0',
      inputBg:     'rgba(255,255,255,.05)',
      inputBorder: 'rgba(255,255,255,.10)',
      inputColor:  '#e2e8f0',
      inputFocusBg:'rgba(255,255,255,.07)',
      inputFocusBorder:'rgba(255,255,255,.22)',
      inputPlaceholder: '#334155',
      labelColor:  '#64748b',
      svcCardBg:   'rgba(255,255,255,.03)',
      svcCardBorder:'rgba(255,255,255,.09)',
      svcCardColor: '#e2e8f0',
      svcMetaColor: '#64748b',
      calDayColor: '#94a3b8',
      calDayHdrColor:'#475569',
      calPastColor: '#2d3f4d',
      calNavColor: '#94a3b8',
      calBg:       'transparent',
      slotBg:      'rgba(255,255,255,.04)',
      slotBorder:  'rgba(255,255,255,.10)',
      slotColor:   '#94a3b8',
      slotHoverBg: 'rgba(255,255,255,.08)',
      stepBtnBackBg: 'rgba(255,255,255,.06)',
      stepBtnBackColor: '#94a3b8',
      stepBtnBackBorder:'rgba(255,255,255,.12)',
      successTitleColor: '#f1f5f9',
      successSubColor: '#64748b',
      successTimeColor: '#94a3b8',
      successNoteColor: '#334155',
      hnamColor:   '#f1f5f9',
      msgAiBubbleColor: '#cbd5e1',
      msgUserBubbleColor: '#94a3b8',
      sumChipBg:   'rgba(255,255,255,.06)',
      sumChipColor:'#94a3b8',
    };

    var light = {
      bg:          '#ffffff',
      border:      'rgba(0,0,0,.10)',
      shadow:      '0 24px 64px rgba(0,0,0,.15),0 0 0 1px rgba(0,0,0,.06)',
      headerBorder:'rgba(0,0,0,.08)',
      tabBorder:   'rgba(0,0,0,.08)',
      tabBg:       'transparent',
      tabHoverBg:  'rgba(0,0,0,.03)',
      tabActiveBg: 'rgba(0,0,0,.04)',
      transcriptBorder: 'rgba(0,0,0,.07)',
      emptyColor:  '#94a3b8',
      greetingColor: '#64748b',
      tapHintColor: '#94a3b8',
      footerBg:    'rgba(0,0,0,.03)',
      footerColor: '#94a3b8',
      footerBorder:'rgba(0,0,0,.06)',
      closeBg:     'rgba(0,0,0,.05)',
      closeColor:  '#94a3b8',
      closeHoverBg:'rgba(0,0,0,.10)',
      closeHoverColor: '#1e293b',
      inputBg:     '#f8fafc',
      inputBorder: 'rgba(0,0,0,.12)',
      inputColor:  '#1e293b',
      inputFocusBg:'#fff',
      inputFocusBorder:'rgba(0,0,0,.25)',
      inputPlaceholder: '#94a3b8',
      labelColor:  '#64748b',
      svcCardBg:   '#f8fafc',
      svcCardBorder:'rgba(0,0,0,.09)',
      svcCardColor: '#1e293b',
      svcMetaColor: '#64748b',
      calDayColor: '#1e293b',
      calDayHdrColor:'#64748b',
      calPastColor: '#cbd5e1',
      calNavColor: '#1e293b',
      calBg:       'transparent',
      slotBg:      '#f8fafc',
      slotBorder:  'rgba(0,0,0,.10)',
      slotColor:   '#1e293b',
      slotHoverBg: '#f1f5f9',
      stepBtnBackBg: '#f1f5f9',
      stepBtnBackColor: '#64748b',
      stepBtnBackBorder:'rgba(0,0,0,.10)',
      successTitleColor: '#1e293b',
      successSubColor: '#64748b',
      successTimeColor: '#475569',
      successNoteColor: '#94a3b8',
      hnamColor:   '#1e293b',
      msgAiBubbleColor: '#1e293b',
      msgUserBubbleColor: '#475569',
      sumChipBg:   '#f1f5f9',
      sumChipColor:'#475569',
    };

    // We inline both sets and use the .carbot-theme-dark / .carbot-theme-light class to scope them.
    // This avoids needing to re-inject styles on theme switch.

    s.textContent = [
      /* FAB wrap */
      '#carbot-fab-wrap{position:fixed;bottom:20px;right:20px;z-index:2147483646;display:flex;align-items:center;justify-content:center}',
      '.carbot-ring1,.carbot-ring2{position:absolute;width:56px;height:56px;border-radius:50%;pointer-events:none;will-change:transform,opacity}',
      '.carbot-tooltip{position:absolute;bottom:calc(100% + 10px);right:0;background:rgba(8,14,16,.95);border:1px solid rgba(255,255,255,.1);color:#e2e8f0;font-size:11px;font-weight:600;white-space:nowrap;padding:5px 10px;border-radius:8px;pointer-events:none;font-family:Inter,system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.4)}',
      '.carbot-tooltip::after{content:"";position:absolute;top:100%;right:14px;border:4px solid transparent;border-top-color:rgba(255,255,255,.1)}',
      '.carbot-fab{position:relative;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;transition:transform .2s;will-change:transform}',
      '.carbot-fab:hover{transform:scale(1.06)}',
      '.carbot-fab:active{transform:scale(0.94)}',

      /* Widget base */
      '.carbot-widget{position:fixed;bottom:20px;right:20px;width:340px;border-radius:16px;overflow:hidden;z-index:2147483645;font-family:Inter,system-ui,-apple-system,sans-serif;opacity:0;transform:translateY(16px) scale(0.95);transition:opacity .22s ease,transform .22s ease}',

      /* DARK theme */
      '.carbot-theme-dark{background:' + dark.bg + ';border:1px solid ' + dark.border + ';box-shadow:' + dark.shadow + ';backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}',
      '.carbot-theme-dark .carbot-header{border-bottom-color:' + dark.headerBorder + '}',
      '.carbot-theme-dark .carbot-hname{color:' + dark.hnamColor + '}',
      '.carbot-theme-dark .carbot-tabs{border-bottom-color:' + dark.tabBorder + '}',
      '.carbot-theme-dark .carbot-tab{background:' + dark.tabBg + ';color:#475569}',
      '.carbot-theme-dark .carbot-tab:hover{color:#94a3b8;background:' + dark.tabHoverBg + '}',
      '.carbot-theme-dark .carbot-tab-active{background:' + dark.tabActiveBg + '}',
      '.carbot-theme-dark .carbot-transcript{border-bottom-color:' + dark.transcriptBorder + '}',
      '.carbot-theme-dark .carbot-empty-state{color:' + dark.emptyColor + '}',
      '.carbot-theme-dark .carbot-empty-icon{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}',
      '.carbot-theme-dark .carbot-greeting-text{color:' + dark.greetingColor + '}',
      '.carbot-theme-dark .carbot-tap-hint{color:' + dark.tapHintColor + '}',
      '.carbot-theme-dark .carbot-footer{background:' + dark.footerBg + ';color:' + dark.footerColor + ';border-top-color:' + dark.footerBorder + '}',
      '.carbot-theme-dark .carbot-closebtn{background:' + dark.closeBg + ';color:' + dark.closeColor + '}',
      '.carbot-theme-dark .carbot-closebtn:hover{background:' + dark.closeHoverBg + ';color:' + dark.closeHoverColor + '}',
      '.carbot-theme-dark .carbot-input{background:' + dark.inputBg + ';border-color:' + dark.inputBorder + ';color:' + dark.inputColor + '}',
      '.carbot-theme-dark .carbot-input:focus{background:' + dark.inputFocusBg + ';border-color:' + dark.inputFocusBorder + '}',
      '.carbot-theme-dark .carbot-input::placeholder{color:' + dark.inputPlaceholder + '}',
      '.carbot-theme-dark .carbot-select option{background:#0f1923;color:#e2e8f0}',
      '.carbot-theme-dark .carbot-label{color:' + dark.labelColor + '}',
      '.carbot-theme-dark .carbot-svc-card{background:' + dark.svcCardBg + ';border-color:' + dark.svcCardBorder + '}',
      '.carbot-theme-dark .carbot-svc-name{color:' + dark.svcCardColor + '}',
      '.carbot-theme-dark .carbot-svc-meta{color:' + dark.svcMetaColor + '}',
      '.carbot-theme-dark .carbot-cal-day{color:' + dark.calDayColor + '}',
      '.carbot-theme-dark .carbot-cal-dayhdr{color:' + dark.calDayHdrColor + '}',
      '.carbot-theme-dark .carbot-cal-past{color:' + dark.calPastColor + '}',
      '.carbot-theme-dark .carbot-cal-arrow,.carbot-theme-dark .carbot-cal-month{color:' + dark.calNavColor + '}',
      '.carbot-theme-dark .carbot-cal-arrow:hover{background:rgba(255,255,255,.08)}',
      '.carbot-theme-dark .carbot-slot{background:' + dark.slotBg + ';border-color:' + dark.slotBorder + ';color:' + dark.slotColor + '}',
      '.carbot-theme-dark .carbot-slot:hover:not(.carbot-slot-selected){background:' + dark.slotHoverBg + '}',
      '.carbot-theme-dark .carbot-step-back-btn{background:' + dark.stepBtnBackBg + ';color:' + dark.stepBtnBackColor + ';border:1px solid ' + dark.stepBtnBackBorder + '}',
      '.carbot-theme-dark .carbot-step-date-label{color:#475569}',
      '.carbot-theme-dark .carbot-sum-chip{background:' + dark.sumChipBg + ';color:' + dark.sumChipColor + '}',
      '.carbot-theme-dark .carbot-success-title{color:' + dark.successTitleColor + '}',
      '.carbot-theme-dark .carbot-success-sub{color:' + dark.successSubColor + '}',
      '.carbot-theme-dark .carbot-success-time{color:' + dark.successTimeColor + '}',
      '.carbot-theme-dark .carbot-success-note{color:' + dark.successNoteColor + '}',
      '.carbot-theme-dark .carbot-bubble{color:' + dark.msgAiBubbleColor + '}',
      '.carbot-theme-dark .carbot-bubble-user{color:' + dark.msgUserBubbleColor + '}',
      '.carbot-theme-dark .carbot-no-services{color:#475569}',
      '.carbot-theme-dark .carbot-slots-empty{color:#475569}',
      '.carbot-theme-dark .carbot-slots-loading{color:#475569}',
      '.carbot-theme-dark .carbot-step-indicator .carbot-dot{background:#2a3f4d}',
      '.carbot-theme-dark .carbot-step-title{color:#94a3b8}',

      /* LIGHT theme */
      '.carbot-theme-light{background:' + light.bg + ';border:1px solid ' + light.border + ';box-shadow:' + light.shadow + '}',
      '.carbot-theme-light .carbot-header{border-bottom-color:' + light.headerBorder + '}',
      '.carbot-theme-light .carbot-hname{color:' + light.hnamColor + '}',
      '.carbot-theme-light .carbot-tabs{border-bottom-color:' + light.tabBorder + '}',
      '.carbot-theme-light .carbot-tab{background:' + light.tabBg + ';color:#64748b}',
      '.carbot-theme-light .carbot-tab:hover{color:#1e293b;background:' + light.tabHoverBg + '}',
      '.carbot-theme-light .carbot-tab-active{background:' + light.tabActiveBg + '}',
      '.carbot-theme-light .carbot-transcript{border-bottom-color:' + light.transcriptBorder + '}',
      '.carbot-theme-light .carbot-empty-state{color:' + light.emptyColor + '}',
      '.carbot-theme-light .carbot-empty-icon{background:rgba(0,0,0,.04);border:1px solid rgba(0,0,0,.07)}',
      '.carbot-theme-light .carbot-greeting-text{color:' + light.greetingColor + '}',
      '.carbot-theme-light .carbot-tap-hint{color:' + light.tapHintColor + '}',
      '.carbot-theme-light .carbot-footer{background:' + light.footerBg + ';color:' + light.footerColor + ';border-top-color:' + light.footerBorder + '}',
      '.carbot-theme-light .carbot-closebtn{background:' + light.closeBg + ';color:' + light.closeColor + '}',
      '.carbot-theme-light .carbot-closebtn:hover{background:' + light.closeHoverBg + ';color:' + light.closeHoverColor + '}',
      '.carbot-theme-light .carbot-input{background:' + light.inputBg + ';border-color:' + light.inputBorder + ';color:' + light.inputColor + '}',
      '.carbot-theme-light .carbot-input:focus{background:' + light.inputFocusBg + ';border-color:' + light.inputFocusBorder + '}',
      '.carbot-theme-light .carbot-input::placeholder{color:' + light.inputPlaceholder + '}',
      '.carbot-theme-light .carbot-select option{background:#fff;color:#1e293b}',
      '.carbot-theme-light .carbot-label{color:' + light.labelColor + '}',
      '.carbot-theme-light .carbot-svc-card{background:' + light.svcCardBg + ';border-color:' + light.svcCardBorder + '}',
      '.carbot-theme-light .carbot-svc-name{color:' + light.svcCardColor + '}',
      '.carbot-theme-light .carbot-svc-meta{color:' + light.svcMetaColor + '}',
      '.carbot-theme-light .carbot-cal-day{color:' + light.calDayColor + '}',
      '.carbot-theme-light .carbot-cal-dayhdr{color:' + light.calDayHdrColor + '}',
      '.carbot-theme-light .carbot-cal-past{color:' + light.calPastColor + '}',
      '.carbot-theme-light .carbot-cal-arrow,.carbot-theme-light .carbot-cal-month{color:' + light.calNavColor + '}',
      '.carbot-theme-light .carbot-cal-arrow:hover{background:rgba(0,0,0,.05)}',
      '.carbot-theme-light .carbot-slot{background:' + light.slotBg + ';border-color:' + light.slotBorder + ';color:' + light.slotColor + '}',
      '.carbot-theme-light .carbot-slot:hover:not(.carbot-slot-selected){background:' + light.slotHoverBg + '}',
      '.carbot-theme-light .carbot-step-back-btn{background:' + light.stepBtnBackBg + ';color:' + light.stepBtnBackColor + ';border:1px solid ' + light.stepBtnBackBorder + '}',
      '.carbot-theme-light .carbot-step-date-label{color:#64748b}',
      '.carbot-theme-light .carbot-sum-chip{background:' + light.sumChipBg + ';color:' + light.sumChipColor + '}',
      '.carbot-theme-light .carbot-success-title{color:' + light.successTitleColor + '}',
      '.carbot-theme-light .carbot-success-sub{color:' + light.successSubColor + '}',
      '.carbot-theme-light .carbot-success-time{color:' + light.successTimeColor + '}',
      '.carbot-theme-light .carbot-success-note{color:' + light.successNoteColor + '}',
      '.carbot-theme-light .carbot-bubble{color:' + light.msgAiBubbleColor + '}',
      '.carbot-theme-light .carbot-bubble-user{color:' + light.msgUserBubbleColor + '}',
      '.carbot-theme-light .carbot-no-services{color:#64748b}',
      '.carbot-theme-light .carbot-slots-empty{color:#64748b}',
      '.carbot-theme-light .carbot-slots-loading{color:#64748b}',
      '.carbot-theme-light .carbot-step-indicator .carbot-dot{background:#cbd5e1}',
      '.carbot-theme-light .carbot-step-title{color:#475569}',
      '.carbot-theme-light .carbot-avatar{background:rgba(0,0,0,.05) !important;color:#64748b !important}',
      '.carbot-theme-light .carbot-bubble-user{background:rgba(0,0,0,.04) !important;border-color:rgba(0,0,0,.07) !important}',
      '.carbot-theme-light .carbot-endbtn{color:#dc2626;background:rgba(220,38,38,.08);border-color:rgba(220,38,38,.18)}',

      /* Header */
      '.carbot-header{position:relative;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;overflow:hidden}',
      '.carbot-hbg{position:absolute;inset:0;opacity:.2;pointer-events:none}',
      '.carbot-header-left{position:relative;display:flex;align-items:center;gap:10px}',
      '.carbot-header-right{position:relative;display:flex;align-items:center;gap:8px}',
      '.carbot-hicon{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
      '.carbot-hname{font-size:13px;font-weight:700;line-height:1.2}',
      '.carbot-hsub{display:flex;align-items:center;gap:5px;margin-top:2px}',
      '.carbot-hdot{width:6px;height:6px;border-radius:50%;animation:carbot-pulse 1.5s infinite}',
      '#carbot-status-text{font-size:10px;font-weight:500}',

      /* Waveform */
      '.carbot-waveform{display:flex;align-items:center;gap:2px;height:16px}',
      '.carbot-wbar{width:3px;border-radius:99px;height:3px;will-change:height}',

      /* Close button */
      '.carbot-closebtn{width:28px;height:28px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s}',

      /* Tabs */
      '.carbot-tabs{display:flex}',
      '.carbot-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:9px 6px;font-size:11px;font-weight:500;font-family:Inter,system-ui,sans-serif;cursor:pointer;border:none;transition:color .15s,background .15s}',
      '.carbot-tab-active{border-bottom:2px solid var(--tab-color) !important;color:var(--tab-color) !important}',

      /* Transcript */
      '.carbot-transcript{height:192px;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.08) transparent}',
      '.carbot-transcript::-webkit-scrollbar{width:4px}',
      '.carbot-transcript::-webkit-scrollbar-track{background:transparent}',
      '.carbot-transcript::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:4px}',
      '.carbot-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;font-size:11px}',
      '.carbot-empty-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center}',

      /* Messages */
      '.carbot-msg-row{display:flex;gap:7px;align-items:flex-start}',
      '.carbot-msg-user{flex-direction:row-reverse}',
      '.carbot-avatar{width:18px;height:18px;border-radius:50%;display:flex;flex-shrink:0;align-items:center;justify-content:center;margin-top:2px}',
      '.carbot-bubble{max-width:82%;padding:8px 10px;border-radius:12px;font-size:11px;line-height:1.55}',

      /* Controls */
      '.carbot-controls{padding:16px 20px}',
      '.carbot-idle{display:block;text-align:center}',
      '.carbot-orb-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;position:relative}',
      '.carbot-orb{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;z-index:2;transition:transform .15s}',
      '.carbot-orb:hover{transform:scale(1.05)}',
      '.carbot-orb:active{transform:scale(0.93)}',
      '.carbot-orb:disabled{opacity:.5;cursor:not-allowed;transform:none}',
      '.carbot-active-controls{display:flex;flex-direction:column;align-items:center;gap:10px}',
      '.carbot-ring-outer,.carbot-ring-inner{position:absolute;border-radius:50%;pointer-events:none}',
      '.carbot-ring-outer{width:96px;height:96px;top:50%;left:50%;margin:-48px 0 0 -48px}',
      '.carbot-ring-inner{width:112px;height:112px;top:50%;left:50%;margin:-56px 0 0 -56px}',
      '.carbot-listen-ring{position:absolute;width:80px;height:80px;border-radius:50%;border:1.5px solid;top:50%;left:50%;margin:-40px 0 0 -40px;pointer-events:none;animation:carbot-listen-pulse 1.8s ease-in-out infinite}',
      '.carbot-orb-active{z-index:3}',
      '.carbot-status-row{display:flex;align-items:center;gap:10px}',
      '.carbot-state-label{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:500}',
      '.carbot-sdot{width:6px;height:6px;border-radius:50%;animation:carbot-pulse 1.1s infinite}',
      '.carbot-endbtn{display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:500;cursor:pointer;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);transition:background .2s;font-family:inherit;color:#f87171}',
      '.carbot-endbtn:hover{background:rgba(239,68,68,.18)}',
      '.carbot-endbtn svg{margin-right:1px}',

      /* Footer */
      '.carbot-footer{padding:8px 16px;display:flex;align-items:center;justify-content:center;gap:5px;font-size:10px;font-family:Inter,system-ui,sans-serif}',

      /* ── Multi-step booking ── */
      '.carbot-steps-header{padding:12px 14px 8px;border-bottom:1px solid rgba(128,128,128,.12)}',
      '.carbot-step-indicator{display:flex;align-items:center;gap:5px;margin-bottom:6px}',
      '.carbot-dot{width:7px;height:7px;border-radius:50%;transition:background .2s}',
      '.carbot-step-title{font-size:13px;font-weight:700}',
      '.carbot-step-date-label{font-size:11px;margin-top:2px}',
      '.carbot-step-summary{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}',
      '.carbot-sum-chip{font-size:10px;padding:2px 8px;border-radius:99px;font-weight:500}',

      /* Service cards */
      '.carbot-svc-list{padding:8px 14px;display:flex;flex-direction:column;gap:6px;max-height:240px;overflow-y:auto;scrollbar-width:thin}',
      '.carbot-svc-card{padding:10px 12px;border-radius:10px;border:1.5px solid var(--svc-border,transparent);background:var(--svc-bg,transparent);cursor:pointer;transition:border-color .15s,background .15s}',
      '.carbot-svc-card:hover{filter:brightness(.97)}',
      '.carbot-svc-name{font-size:12px;font-weight:600}',
      '.carbot-svc-meta{font-size:11px;display:flex;gap:5px;align-items:center;margin-top:2px}',
      '.carbot-svc-dot{opacity:.4}',
      '.carbot-no-services{padding:20px 14px;text-align:center;font-size:12px}',

      /* Calendar */
      '.carbot-cal-nav{display:flex;align-items:center;justify-content:space-between;padding:8px 14px 6px}',
      '.carbot-cal-month{font-size:12px;font-weight:600}',
      '.carbot-cal-arrow{border:none;background:transparent;cursor:pointer;width:26px;height:26px;border-radius:6px;font-size:18px;display:flex;align-items:center;justify-content:center;transition:background .15s;line-height:1;padding:0}',
      '.carbot-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;padding:0 10px 8px}',
      '.carbot-cal-dayhdr{text-align:center;font-size:9px;font-weight:600;padding:3px 0;text-transform:uppercase;letter-spacing:.04em}',
      '.carbot-cal-day{text-align:center;font-size:11px;font-weight:500;padding:5px 2px;border-radius:6px;cursor:pointer;border:1.5px solid transparent;transition:background .12s,color .12s}',
      '.carbot-cal-day:not(.carbot-cal-past):hover{filter:brightness(.95)}',
      '.carbot-cal-past{cursor:default;opacity:.35}',
      '.carbot-cal-selected{border-radius:6px !important}',

      /* Time slots */
      '.carbot-slots-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:10px 14px;max-height:200px;overflow-y:auto;scrollbar-width:thin}',
      '.carbot-slot{padding:7px 4px;border-radius:8px;border:1.5px solid;font-size:11px;font-weight:500;cursor:pointer;text-align:center;font-family:Inter,system-ui,sans-serif;transition:background .12s,border-color .12s}',
      '.carbot-slots-loading,.carbot-slots-empty{padding:20px 14px;text-align:center;font-size:12px}',

      /* Step nav */
      '.carbot-step-nav{display:flex;justify-content:space-between;align-items:center;padding:8px 14px 12px;gap:8px}',
      '.carbot-step-btn{padding:8px 18px;border-radius:9px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,system-ui,sans-serif;color:#fff;transition:opacity .15s}',
      '.carbot-step-btn:hover{opacity:.88}',
      '.carbot-step-btn:disabled{opacity:.4;cursor:not-allowed}',
      '.carbot-step-back-btn{color:inherit}',

      /* Book form */
      '.carbot-book-form{padding:8px 14px;display:flex;flex-direction:column;gap:7px;max-height:300px;overflow-y:auto;scrollbar-width:thin}',
      '.carbot-field-row{display:flex;gap:8px}',
      '.carbot-field{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}',
      '.carbot-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}',
      '.carbot-input{width:100%;padding:7px 9px;border-radius:8px;border:1px solid;font-size:12px;font-family:Inter,system-ui,sans-serif;outline:none;box-sizing:border-box;transition:border-color .15s,background .15s}',
      '.carbot-select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22%3E%3Cpolyline points=%226 9 12 15 18 9%22/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;padding-right:26px}',
      '.carbot-textarea{resize:none;line-height:1.4}',
      '.carbot-book-msg{font-size:11px;line-height:1.4;padding:6px 8px;border-radius:6px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2)}',

      /* Book success */
      '.carbot-book-success{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 20px;gap:6px;text-align:center;min-height:200px}',
      '.carbot-success-icon{margin-bottom:4px}',
      '.carbot-success-title{font-size:14px;font-weight:700}',
      '.carbot-success-sub{font-size:11px;margin-top:2px}',
      '.carbot-success-time{font-size:13px;font-weight:600}',
      '.carbot-success-note{font-size:10px;margin-top:6px}',
      '.carbot-greeting-text{font-size:12px;line-height:1.5;margin:0 0 14px}',
      '.carbot-tap-hint{font-size:11px}',

      /* Keyframes */
      '@keyframes carbot-pulse{0%,100%{opacity:1}50%{opacity:.3}}',
      '@keyframes carbot-listen-pulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.12);opacity:1}}',
    ].join('');
    document.head.appendChild(s);
  }

})();
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
