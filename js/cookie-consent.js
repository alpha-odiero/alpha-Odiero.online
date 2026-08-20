/**
 * Cookie Consent - Storage & Configuration
 * Frontend-only consent management using localStorage
 */

var CookieConsent = (function () {
    var STORAGE_KEY = 'cookie_consent';

    var CATEGORIES = {
        necessary: { label: 'Necessary Cookies', description: 'Essential for the website to function properly. These cannot be disabled.', required: true },
        analytics: { label: 'Analytics Cookies', description: 'Help us understand how visitors interact with the website by collecting anonymous data.', required: false },
        marketing: { label: 'Marketing Cookies', description: 'Used to track visitors across websites to display relevant advertisements.', required: false }
    };

    function getDefaultConsent() {
        return {
            necessary: true,
            analytics: false,
            marketing: false,
            consentGiven: false,
            updatedAt: null
        };
    }

    function getConsent() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                var parsed = JSON.parse(stored);
                if (parsed.consentGiven) return parsed;
            }
        } catch (e) {}
        return null;
    }

    function saveConsent(preferences) {
        var consent = {
            necessary: true,
            analytics: !!preferences.analytics,
            marketing: !!preferences.marketing,
            consentGiven: true,
            updatedAt: new Date().toISOString()
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        } catch (e) {}
        return consent;
    }

    function hasConsent() {
        return getConsent() !== null;
    }

    function isAccepted(category) {
        var consent = getConsent();
        if (!consent) return false;
        return consent[category] === true;
    }

    function acceptAll() {
        var prefs = { necessary: true, analytics: true, marketing: true };
        return saveConsent(prefs);
    }

    function rejectAll() {
        var prefs = { necessary: true, analytics: false, marketing: false };
        return saveConsent(prefs);
    }

    return {
        CATEGORIES: CATEGORIES,
        getDefault: getDefaultConsent,
        get: getConsent,
        save: saveConsent,
        hasConsent: hasConsent,
        isAccepted: isAccepted,
        acceptAll: acceptAll,
        rejectAll: rejectAll
    };
})();
