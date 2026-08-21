/**
 * Cookie Consent UI - Banner & Preferences Modal
 */
document.addEventListener('DOMContentLoaded', function () {
    var needsBanner = !CookieConsent.hasConsent();
    var consent = CookieConsent.get() || CookieConsent.getDefault();
    var banner = null;

    // Create banner (only when no consent decision has been made yet)
    if (needsBanner) {
        banner = document.createElement('div');
        banner.className = 'cc-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie Consent');
        banner.innerHTML = '<div class="cc-banner-inner">' +
            '<div class="cc-banner-text">' +
                '<p class="cc-banner-title">We value your privacy</p>' +
                '<p class="cc-banner-desc">We use cookies and browser storage to improve your experience, analyze site traffic, and support marketing efforts. Choose how you\'d like to proceed.</p>' +
            '</div>' +
            '<div class="cc-banner-actions">' +
                '<button class="cc-btn cc-btn-accept" type="button">Accept All</button>' +
                '<button class="cc-btn cc-btn-reject" type="button">Reject All</button>' +
                '<button class="cc-btn cc-btn-manage" type="button">Manage Preferences</button>' +
            '</div>' +
        '</div>';
        document.body.appendChild(banner);
    }

    // Create preferences modal
    var modal = document.createElement('div');
    modal.className = 'cc-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Cookie Preferences');

    function buildCategoryRow(key, cat) {
        var checked = key === 'necessary' || consent[key] ? 'checked' : '';
        var disabled = key === 'necessary' ? 'disabled' : '';
        return '<div class="cc-category">' +
            '<div class="cc-category-info">' +
                '<p class="cc-category-label">' + cat.label + (key === 'necessary' ? ' (Always On)' : '') + '</p>' +
                '<p class="cc-category-desc">' + cat.description + '</p>' +
            '</div>' +
            '<label class="cc-toggle">' +
                '<input type="checkbox" data-cc-category="' + key + '" ' + checked + ' ' + disabled + ' />' +
                '<span class="cc-toggle-slider"></span>' +
            '</label>' +
        '</div>';
    }

    var categoriesHTML = '';
    var keys = Object.keys(CookieConsent.CATEGORIES);
    for (var i = 0; i < keys.length; i++) {
        categoriesHTML += buildCategoryRow(keys[i], CookieConsent.CATEGORIES[keys[i]]);
    }

    modal.innerHTML = '<div class="cc-modal-content">' +
        '<div class="cc-modal-header">' +
            '<h3>Cookie Preferences</h3>' +
            '<button class="cc-modal-close" type="button" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="cc-modal-body">' +
            '<p class="cc-modal-intro">Manage your cookie preferences below. Strictly necessary cookies are always enabled as they are essential for the website to function.</p>' +
            '<div class="cc-categories">' + categoriesHTML + '</div>' +
        '</div>' +
        '<div class="cc-modal-footer">' +
            '<button class="cc-btn cc-btn-save" type="button">Save Preferences</button>' +
        '</div>' +
    '</div>';

    document.body.appendChild(modal);

    // Focus management
    function openPreferences() {
        var stored = CookieConsent.get() || CookieConsent.getDefault();
        var checkboxes = modal.querySelectorAll('input[data-cc-category]');
        for (var j = 0; j < checkboxes.length; j++) {
            var cat = checkboxes[j].getAttribute('data-cc-category');
            checkboxes[j].checked = cat === 'necessary' ? true : !!stored[cat];
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        var firstInput = modal.querySelector('input:not(:disabled), .cc-modal-close');
        if (firstInput) firstInput.focus();
    }

    function closePreferences() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function hideBanner() {
        if (!banner) return;
        banner.classList.add('cc-hidden');
        setTimeout(function () { banner.remove(); }, 400);
    }

    function applyConsent(consentData) {
        var evt;
        try {
            evt = new CustomEvent('cookieConsentChange', { detail: consentData });
        } catch (e) {
            evt = document.createEvent('CustomEvent');
            evt.initCustomEvent('cookieConsentChange', true, true, consentData);
        }
        document.dispatchEvent(evt);
    }

    // Banner button handlers
    if (banner) {
        banner.querySelector('.cc-btn-accept').addEventListener('click', function () {
            var c = CookieConsent.acceptAll();
            applyConsent(c);
            hideBanner();
        });

        banner.querySelector('.cc-btn-reject').addEventListener('click', function () {
            var c = CookieConsent.rejectAll();
            applyConsent(c);
            hideBanner();
        });

        banner.querySelector('.cc-btn-manage').addEventListener('click', function () {
            openPreferences();
        });
    }

    // Modal close
    modal.querySelector('.cc-modal-close').addEventListener('click', function () {
        closePreferences();
    });

    modal.addEventListener('click', function (e) {
        if (e.target === modal) closePreferences();
    });

    // Save preferences
    modal.querySelector('.cc-btn-save').addEventListener('click', function () {
        var checkboxes = modal.querySelectorAll('input[data-cc-category]');
        var prefs = {};
        for (var k = 0; k < checkboxes.length; k++) {
            prefs[checkboxes[k].getAttribute('data-cc-category')] = checkboxes[k].checked;
        }
        prefs.necessary = true;
        var c = CookieConsent.save(prefs);
        applyConsent(c);
        closePreferences();
        hideBanner();
    });

    // Keyboard support
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closePreferences();
        }
    });

    // Footer & mobile menu "Cookie Settings" link
    var cookieSettingsLinks = document.querySelectorAll('[data-cc-open]');
    for (var m = 0; m < cookieSettingsLinks.length; m++) {
        cookieSettingsLinks[m].addEventListener('click', function (e) {
            e.preventDefault();
            // Close mobile menu if open
            var mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            if (CookieConsent.hasConsent()) {
                openPreferences();
            } else if (banner) {
                banner.classList.remove('cc-hidden');
            }
        });
    }
});
