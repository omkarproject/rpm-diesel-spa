(function() {
  // Prevent double injection
  if (window.__rpmBroadcastInitialized) return;
  window.__rpmBroadcastInitialized = true;

  function initBroadcastApp() {
    // 1. Inject Bulletproof Scoped Styles
    if (!document.getElementById('sys-broadcast-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'sys-broadcast-styles';
      styleEl.textContent = `
        /* SYSTEM BROADCAST ROOT & BANNER STYLES */
        #sys-broadcast-banner {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          z-index: 999999999 !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: translateY(-130%) !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2) !important;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          line-height: 1.4 !important;
        }

        #sys-broadcast-banner.sys-bcast-visible {
          transform: translateY(0) !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }

        #sys-broadcast-banner.sys-bcast-green {
          background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
          border-bottom: 2px solid #34d399 !important;
          color: #ffffff !important;
        }

        #sys-broadcast-banner.sys-bcast-yellow {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
          border-bottom: 2px solid #fbbf24 !important;
          color: #ffffff !important;
          animation: sysBcastPulse 3s infinite ease-in-out !important;
        }

        @keyframes sysBcastPulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.12); }
        }

        .sys-bcast-container {
          width: 100% !important;
          max-width: 1280px !important;
          margin: 0 auto !important;
          padding: 10px 16px !important;
          box-sizing: border-box !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 12px !important;
        }

        @media (min-width: 768px) {
          .sys-bcast-container {
            padding: 12px 24px !important;
            gap: 16px !important;
          }
        }

        .sys-bcast-left {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          flex: 1 1 auto !important;
          min-width: 0 !important;
        }

        .sys-bcast-icon-wrap {
          flex-shrink: 0 !important;
          width: 38px !important;
          height: 38px !important;
          border-radius: 12px !important;
          background: rgba(255, 255, 255, 0.22) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #ffffff !important;
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3) !important;
        }

        .sys-bcast-icon-wrap svg {
          width: 20px !important;
          height: 20px !important;
          fill: currentColor !important;
        }

        .sys-bcast-text-wrap {
          flex: 1 1 auto !important;
          min-width: 0 !important;
          text-align: left !important;
        }

        .sys-bcast-title {
          margin: 0 !important;
          font-size: 13.5px !important;
          font-weight: 800 !important;
          letter-spacing: 0.03em !important;
          text-transform: uppercase !important;
          color: #ffffff !important;
          line-height: 1.25 !important;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;
        }

        @media (min-width: 768px) {
          .sys-bcast-title {
            font-size: 14.5px !important;
          }
        }

        .sys-bcast-desc {
          margin: 2px 0 0 0 !important;
          font-size: 12.5px !important;
          font-weight: 600 !important;
          color: rgba(255, 255, 255, 0.95) !important;
          line-height: 1.35 !important;
          word-break: break-word !important;
        }

        @media (min-width: 768px) {
          .sys-bcast-desc {
            font-size: 13.5px !important;
          }
        }

        .sys-bcast-close-btn {
          flex-shrink: 0 !important;
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.2) !important;
          border: none !important;
          color: #ffffff !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: background 0.2s, transform 0.15s !important;
          padding: 0 !important;
          outline: none !important;
        }

        .sys-bcast-close-btn:hover {
          background: rgba(255, 255, 255, 0.35) !important;
          transform: scale(1.08) !important;
        }

        .sys-bcast-close-btn:active {
          transform: scale(0.92) !important;
        }

        .sys-bcast-close-btn svg {
          width: 15px !important;
          height: 15px !important;
          stroke: currentColor !important;
          stroke-width: 2.5 !important;
          fill: none !important;
        }

        /* RED HIGH URGENCY MODAL */
        #sys-broadcast-modal {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 999999999 !important;
          background: rgba(15, 23, 42, 0.85) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 16px !important;
          box-sizing: border-box !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: opacity 0.3s ease !important;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }

        #sys-broadcast-modal.sys-bcast-visible {
          opacity: 1 !important;
          pointer-events: auto !important;
        }

        .sys-bcast-modal-dialog {
          position: relative !important;
          width: 100% !important;
          max-width: 460px !important;
          background: #ffffff !important;
          border-radius: 24px !important;
          overflow: hidden !important;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6) !important;
          border: 2px solid #ef4444 !important;
          text-align: center !important;
          transform: scale(0.9) !important;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          box-sizing: border-box !important;
        }

        #sys-broadcast-modal.sys-bcast-visible .sys-bcast-modal-dialog {
          transform: scale(1) !important;
        }

        .sys-bcast-modal-top {
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%) !important;
          padding: 24px 20px 20px 20px !important;
          color: #ffffff !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          box-sizing: border-box !important;
        }

        .sys-bcast-modal-alert-icon {
          width: 58px !important;
          height: 58px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.2) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin-bottom: 12px !important;
          animation: sysBcastAlertBounce 2s infinite !important;
        }

        @keyframes sysBcastAlertBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .sys-bcast-modal-alert-icon svg {
          width: 28px !important;
          height: 28px !important;
          fill: #ffffff !important;
        }

        .sys-bcast-modal-heading {
          margin: 0 !important;
          font-size: 20px !important;
          font-weight: 900 !important;
          color: #ffffff !important;
          letter-spacing: -0.01em !important;
          line-height: 1.25 !important;
        }

        .sys-bcast-modal-content {
          padding: 24px 22px !important;
          background: #ffffff !important;
          box-sizing: border-box !important;
        }

        html.dark .sys-bcast-modal-content {
          background: #0f172a !important;
        }

        .sys-bcast-modal-message {
          margin: 0 0 22px 0 !important;
          font-size: 15px !important;
          font-weight: 500 !important;
          color: #334155 !important;
          line-height: 1.5 !important;
          white-space: pre-wrap !important;
          word-break: break-word !important;
        }

        html.dark .sys-bcast-modal-message {
          color: #cbd5e1 !important;
        }

        .sys-bcast-ack-btn {
          width: 100% !important;
          padding: 13px 20px !important;
          background: #dc2626 !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 14px !important;
          font-size: 15px !important;
          font-weight: 800 !important;
          letter-spacing: 0.02em !important;
          cursor: pointer !important;
          transition: background 0.2s, transform 0.15s !important;
          box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4) !important;
          outline: none !important;
        }

        .sys-bcast-ack-btn:hover {
          background: #b91c1c !important;
          transform: translateY(-1px) !important;
        }

        .sys-bcast-ack-btn:active {
          transform: translateY(1px) !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    // 2. Inject Clean Markup
    if (!document.getElementById('sys-broadcast-banner')) {
      const bannerEl = document.createElement('div');
      bannerEl.id = 'sys-broadcast-banner';
      bannerEl.innerHTML = `
        <div class="sys-bcast-container">
          <div class="sys-bcast-left">
            <div id="sys-broadcast-icon-wrap" class="sys-bcast-icon-wrap">
              <!-- Injected dynamically -->
            </div>
            <div class="sys-bcast-text-wrap">
              <h4 id="sys-broadcast-banner-title" class="sys-bcast-title"></h4>
              <p id="sys-broadcast-banner-desc" class="sys-bcast-desc"></p>
            </div>
          </div>
          <button type="button" id="sys-broadcast-banner-close" class="sys-bcast-close-btn" aria-label="Dismiss message">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;
      document.body.prepend(bannerEl);
    }

    if (!document.getElementById('sys-broadcast-modal')) {
      const modalEl = document.createElement('div');
      modalEl.id = 'sys-broadcast-modal';
      modalEl.innerHTML = `
        <div class="sys-bcast-modal-dialog">
          <div class="sys-bcast-modal-top">
            <div class="sys-bcast-modal-alert-icon">
              <svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            </div>
            <h2 id="sys-broadcast-modal-title" class="sys-bcast-modal-heading"></h2>
          </div>
          <div class="sys-bcast-modal-content">
            <p id="sys-broadcast-modal-desc" class="sys-bcast-modal-message"></p>
            <button type="button" id="sys-broadcast-modal-close" class="sys-bcast-ack-btn">
              Acknowledge &amp; Close
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    const banner = document.getElementById('sys-broadcast-banner');
    const modal = document.getElementById('sys-broadcast-modal');
    const iconWrap = document.getElementById('sys-broadcast-icon-wrap');
    const bannerTitle = document.getElementById('sys-broadcast-banner-title');
    const bannerDesc = document.getElementById('sys-broadcast-banner-desc');
    const bannerCloseBtn = document.getElementById('sys-broadcast-banner-close');

    const modalTitle = document.getElementById('sys-broadcast-modal-title');
    const modalDesc = document.getElementById('sys-broadcast-modal-desc');
    const modalCloseBtn = document.getElementById('sys-broadcast-modal-close');

    let currentDisplayedId = null;
    let hideTimer = null;
    let isHovered = false;

    // SVG Icon Templates
    const bellSvg = `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>`;
    const warnSvg = `<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;

    // Robust App Identification
    function detectCurrentApp() {
      const path = (window.location.pathname || '').toLowerCase();
      const href = (window.location.href || '').toLowerCase();
      if (path.includes('driver_request') || href.includes('driver_request') || document.getElementById('driver-request-form') || document.getElementById('vehicle-no-part-1')) {
        return 'driver';
      }
      if (path.includes('diesel_filled') || href.includes('diesel_filled') || document.getElementById('station-filling-form') || document.getElementById('station-user-select')) {
        return 'station';
      }
      return 'admin';
    }

    const currentApp = detectCurrentApp();

    // Target matching helper
    function matchesTarget(target, app) {
      if (!target || target === 'all') return true;
      const t = String(target).toLowerCase().trim();
      if (t === app) return true;
      if (app === 'driver' && (t.includes('driver') || t.includes('form'))) return true;
      if (app === 'station' && (t.includes('station') || t.includes('pump') || t.includes('fuel'))) return true;
      if (app === 'admin' && (t.includes('admin') || t.includes('incharge') || t.includes('dashboard'))) return true;
      return false;
    }

    // In-memory seen list so broadcast shows once per page session
    const inMemorySeenList = [];
    function markAsSeen(id) {
      if (id && !inMemorySeenList.includes(id)) {
        inMemorySeenList.push(id);
      }
    }

    function hideBanner() {
      if (!banner) return;
      banner.classList.remove('sys-bcast-visible');
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    }

    function hideModal() {
      if (!modal) return;
      modal.classList.remove('sys-bcast-visible');
    }

    // Hover listeners to pause auto-dismiss
    banner.addEventListener('mouseenter', () => { isHovered = true; });
    banner.addEventListener('mouseleave', () => {
      isHovered = false;
      // If timer had finished while hovered, dismiss after small grace period
      if (currentDisplayedId && !hideTimer) {
        hideTimer = setTimeout(() => {
          if (!isHovered) {
            hideBanner();
            markAsSeen(currentDisplayedId);
            currentDisplayedId = null;
            if (window._triggerBroadcastCheck) window._triggerBroadcastCheck();
          }
        }, 1500);
      }
    });

    bannerCloseBtn.addEventListener('click', () => {
      hideBanner();
      if (currentDisplayedId) markAsSeen(currentDisplayedId);
      currentDisplayedId = null;
      if (window._triggerBroadcastCheck) window._triggerBroadcastCheck();
    });

    modalCloseBtn.addEventListener('click', () => {
      hideModal();
      if (currentDisplayedId) markAsSeen(currentDisplayedId);
      currentDisplayedId = null;
      if (window._triggerBroadcastCheck) window._triggerBroadcastCheck();
    });

    // Firebase database lookup with fallback
    function getDatabase() {
      if (typeof db !== 'undefined' && db && typeof db.ref === 'function') return db;
      if (typeof window.db !== 'undefined' && window.db && typeof window.db.ref === 'function') return window.db;
      if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
        try { return firebase.database(); } catch(e) {}
      }
      return null;
    }

    let retryCount = 0;
    function initListeners() {
      const database = getDatabase();
      if (database) {
        startBroadcastListener(database);
        startBrandingListener(database);
      } else if (retryCount < 100) {
        retryCount++;
        setTimeout(initListeners, 150);
      }
    }
    initListeners();

    function startBroadcastListener(database) {
      let lastSnapData = {};
      window._triggerBroadcastCheck = function() {
        processBroadcasts(lastSnapData);
      };

      database.ref('broadcasts/active').on('value', snap => {
        const data = snap.val() || {};
        lastSnapData = data;
        processBroadcasts(data);
      });

      function processBroadcasts(data) {
        // 1. If currently displayed broadcast was deleted or stopped by admin, hide immediately
        if (currentDisplayedId && !data[currentDisplayedId]) {
          hideBanner();
          hideModal();
          currentDisplayedId = null;
        }

        // 2. Filter broadcasts matching current app and not yet seen
        const candidates = [];
        for (const key of Object.keys(data)) {
          const b = data[key];
          if (!b) continue;
          if (!matchesTarget(b.target, currentApp)) continue;
          if (inMemorySeenList.includes(b.id || key)) continue;
          candidates.push(b);
        }

        if (candidates.length === 0) return;

        // 3. Sort candidates: RED alerts first, otherwise newest first
        candidates.sort((a, b) => {
          if (a.level === 'red' && b.level !== 'red') return -1;
          if (b.level === 'red' && a.level !== 'red') return 1;
          const timeA = a.timestamp || 0;
          const timeB = b.timestamp || 0;
          return timeB - timeA;
        });

        // 4. If nothing is currently showing, show the top candidate
        const nextBroadcast = candidates[0];
        if (!currentDisplayedId && nextBroadcast) {
          showBroadcast(nextBroadcast);
        } else if (currentDisplayedId && nextBroadcast && nextBroadcast.level === 'red') {
          // If a RED alert comes in while a banner is displayed, escalate immediately!
          hideBanner();
          showBroadcast(nextBroadcast);
        }
      }

      function showBroadcast(b) {
        const bId = b.id || 'bcast_' + Date.now();
        currentDisplayedId = bId;

        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }

        if (b.level === 'red') {
          // Show High Urgency Modal
          modalTitle.textContent = b.header || 'CRITICAL NOTICE';
          modalDesc.textContent = b.description || '';
          modal.classList.add('sys-bcast-visible');
        } else {
          // Show Low (Green) or Medium (Yellow) Banner
          banner.className = '';
          if (b.level === 'yellow') {
            banner.className = 'sys-bcast-yellow';
            iconWrap.innerHTML = warnSvg;
          } else {
            banner.className = 'sys-bcast-green';
            iconWrap.innerHTML = bellSvg;
          }

          bannerTitle.textContent = b.header || 'SYSTEM ANNOUNCEMENT';
          bannerDesc.textContent = b.description || '';
          banner.classList.add('sys-bcast-visible');

          // Auto-hide after 12 seconds unless paused by hover
          const displayDuration = 12000;
          hideTimer = setTimeout(function autoDismiss() {
            if (isHovered) {
              hideTimer = null; // will dismiss on mouseleave
              return;
            }
            hideBanner();
            markAsSeen(bId);
            currentDisplayedId = null;
            if (window._triggerBroadcastCheck) window._triggerBroadcastCheck();
          }, displayDuration);
        }
      }
    }

    // Global App Branding Realtime Sync Listener
    function startBrandingListener(database) {
      database.ref('settings/branding').on('value', snap => {
        let rawData = snap.val();
        if (!rawData) return;

        try {
          localStorage.setItem('rpm_app_branding', JSON.stringify(rawData));
        } catch(e) {}

        if (rawData.appName || rawData.logoUrl || rawData.faviconUrl) {
          if (!rawData.all && !rawData.admin && !rawData.driver && !rawData.station) {
            rawData = { all: rawData };
          }
        }

        const globalConfig = rawData['all'] || {};
        const appConfig = rawData[currentApp] || {};

        const data = {
          appName: appConfig.appName || globalConfig.appName,
          faviconUrl: appConfig.faviconUrl || globalConfig.faviconUrl,
          logoUrl: appConfig.logoUrl || globalConfig.logoUrl
        };

        if (data.appName) {
          document.title = data.appName;
          const nameElements = document.querySelectorAll('.sys-brand-name');
          nameElements.forEach(el => el.textContent = data.appName);
        }

        if (data.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.id = 'favicon-link';
            link.rel = 'icon';
            document.head.appendChild(link);
          } else {
            link.href = data.faviconUrl;
          }
        }

        if (data.logoUrl) {
          const logoElements = document.querySelectorAll('.sys-brand-logo, #sidebar-logo-img, #header-logo-img, #splash-logo-img, #login-logo-img');
          logoElements.forEach(img => {
            img.src = data.logoUrl;
          });
          let earlyStyle = document.getElementById('early-brand-style');
          if (!earlyStyle) {
            earlyStyle = document.createElement('style');
            earlyStyle.id = 'early-brand-style';
            document.head.appendChild(earlyStyle);
          }
          earlyStyle.textContent = '.sys-brand-logo { content: url("' + data.logoUrl + '") !important; }';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBroadcastApp);
  } else {
    initBroadcastApp();
  }
})();
