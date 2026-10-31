(function () {
    'use strict';

    var POSTHOG_KEY = 'phc_xksSR3xedexoX7uJ5iDJYCp8DGXcaBCSU9ajDkJX2HtG';
    var POSTHOG_HOST = 'https://us.i.posthog.com';
    var POSTHOG_UI_HOST = 'https://us.posthog.com';

    var initialized = false;
    var lastPageviewUrl = null;
    var lastPageviewAt = 0;

    function isLocalHost(host) {
        return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]';
    }

    function isTrackableEnvironment() {
        try {
            var protocol = window.location.protocol;
            if (protocol !== 'http:' && protocol !== 'https:') return false;

            var host = window.location.hostname;
            if (!host) return false;

            if (host === 'alpha-odiero.online' || host === 'www.alpha-odiero.online') return true;
            if (host.slice(-11) === '.vercel.app') return true;

            var testMode = /(?:[?&])ph_test=1(?:&|$)/.test(window.location.search);
            return testMode && isLocalHost(host);
        } catch (error) {
            return false;
        }
    }

    function hasAnalyticsConsent() {
        try {
            return typeof window.CookieConsent !== 'undefined' &&
                window.CookieConsent.isAccepted('analytics');
        } catch (error) {
            return false;
        }
    }

    function loadPostHogSnippet() {
        if (window.__phAnalyticsSnippetLoaded) return;
        window.__phAnalyticsSnippetLoaded = true;

        !function (t, e) { var o, n, p, r; e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) { function g(t, e) { var o = e.split('.'); 2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } } (p = t.createElement('script')).type = 'text/javascript', p.crossOrigin = 'anonymous', p.async = !0, p.src = s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js', (r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r); var u = e; for (void 0 !== a ? u = e[a] = [] : a = 'posthog', u.people = u.people || [], Object.defineProperty(u, 'toString', { configurable: !0, enumerable: !0, writable: !0, value: function (t) { var e = 'posthog'; return 'posthog' !== a && (e += '.' + a), t || (e += ' (stub)'), e } }), Object.defineProperty(u.people, 'toString', { configurable: !0, enumerable: !0, writable: !0, value: function () { return u.toString(1) + '.people (stub)' } }), o = 'init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug'.split(' '), n = 0; n < o.length; n++)g(u, o[n]); e._i.push([i, s, a]) }, e.__SV = 1) }(document, window.posthog || []);
    }

    function initPostHog() {
        if (initialized) return;
        if (!isTrackableEnvironment() || !hasAnalyticsConsent()) return;

        try {
            loadPostHogSnippet();

            var ph = window.posthog;
            if (!ph || typeof ph.init !== 'function') return;

            ph.init(POSTHOG_KEY, {
                api_host: POSTHOG_HOST,
                ui_host: POSTHOG_UI_HOST,
                defaults: '2026-08-30',
                capture_pageview: 'history_change',
                capture_pageleave: true,
                autocapture: true,
                capture_heatmaps: true,
                capture_dead_clicks: true,
                mask_all_text: true,
                persistence: 'localStorage+cookie',
                disable_session_recording: false,
                session_recording: {
                    maskAllInputs: true,
                    maskTextSelector: '.contact-details, .ph-mask',
                    recordBody: false,
                    recordHeaders: false,
                    maskCapturedNetworkRequestFn: function (request) {
                        if (request && typeof request.name === 'string') {
                            request.name = request.name.split('?')[0];
                        }
                        if (request) {
                            request.requestBody = undefined;
                            request.responseBody = undefined;
                        }
                        return request;
                    }
                },
                before_send: function (event) {
                    if (!event || event.event !== '$pageview') return event;

                    var url = event.properties && event.properties.$current_url;
                    var now = Date.now();

                    if (url && url === lastPageviewUrl && now - lastPageviewAt < 1000) {
                        return null;
                    }

                    lastPageviewUrl = url;
                    lastPageviewAt = now;
                    return event;
                },
                loaded: function (instance) {
                    try {
                        if (!hasAnalyticsConsent()) return;
                        if (instance.has_opted_out_capturing()) {
                            instance.opt_in_capturing();
                        }
                        instance.startSessionRecording();
                    } catch (error) {}
                }
            });

            initialized = true;
        } catch (error) {}
    }

    function capture(eventName, properties) {
        if (!initialized) return;

        try {
            var ph = window.posthog;
            if (!ph || typeof ph.capture !== 'function') return;

            var payload = {
                page_path: window.location.pathname,
                page_title: document.title
            };

            if (properties) {
                for (var key in properties) {
                    if (Object.prototype.hasOwnProperty.call(properties, key)) {
                        payload[key] = properties[key];
                    }
                }
            }

            ph.capture(eventName, payload);
        } catch (error) {}
    }

    function textOf(element) {
        return element ? (element.textContent || '').trim().replace(/\s+/g, ' ') : '';
    }

    function isExternalHttpLink(link) {
        try {
            if (!link || !link.href) return false;
            if (!/^https?:/i.test(link.href)) return false;
            return link.origin !== window.location.origin;
        } catch (error) {
            return false;
        }
    }

    function isWhatsAppLink(link) {
        return !!link && /(?:^|\.)wa\.me$|(?:^|\.)whatsapp\.com$/i.test(link.hostname);
    }

    function isCvLink(link) {
        if (!link) return false;
        var href = link.getAttribute('href') || '';
        var hasDownload = link.hasAttribute('download');
        var isDocument = /\.(pdf|docx?|rtf)(?:[?#]|$)/i.test(href);
        var isCv = /(?:^|[\/_.-])(cv|resume|curriculum)(?:[\/_.-]|$)/i.test(href);
        return hasDownload || (isDocument && isCv);
    }

    function isContactLink(link) {
        if (!link) return false;
        var href = link.getAttribute('href') || '';
        if (link.matches('.nav-contact-btn, .nav-start-project')) return true;
        if (/#contact(?:$|[?#])/i.test(href)) return true;
        if (/^mailto:/i.test(href) || /^tel:/i.test(href)) return true;
        return false;
    }

    function projectContext(element) {
        var slide = element.closest('.showcase-slide');
        if (!slide) return null;

        return {
            project_name: textOf(slide.querySelector('.showcase-card-title')),
            project_category: textOf(slide.querySelector('.showcase-category-badge'))
        };
    }

    function handleClick(event) {
        if (!initialized) return;

        var target = event.target;
        if (!target || typeof target.closest !== 'function') return;

        var link = target.closest('a');
        var modalTrigger = target.closest('[data-modal]');
        var slide = target.closest('.showcase-slide');

        if (link && isWhatsAppLink(link)) {
            capture('whatsapp_clicked', {
                link_url: link.href.split('?')[0],
                link_text: textOf(link)
            });
            return;
        }

        if (link && isCvLink(link)) {
            capture('cv_downloaded', {
                file_name: (link.getAttribute('href') || '').split('?')[0].split('/').pop(),
                link_text: textOf(link)
            });
            return;
        }

        if (slide && (modalTrigger || (link && link.target === '_blank'))) {
            var project = projectContext(target);
            capture('project_viewed', {
                project_name: project ? project.project_name : '',
                project_category: project ? project.project_category : '',
                action: modalTrigger ? 'details' : 'external'
            });
            return;
        }

        if (link && isContactLink(link)) {
            capture('contact_button_clicked', {
                link_text: textOf(link),
                link_url: link.getAttribute('href') || ''
            });
            return;
        }

        if (link && isExternalHttpLink(link)) {
            capture('external_link_clicked', {
                link_url: link.href,
                link_text: textOf(link),
                link_domain: link.hostname
            });
            return;
        }

        var nav = link ? link.closest('.nav-links, .mobile-nav-links, .footer-links, .page-back-btn') : null;
        if (nav && link) {
            capture('navigation_clicked', {
                link_text: textOf(link),
                link_url: link.getAttribute('href') || '',
                navigation_location: nav.classList.contains('mobile-nav-links') ? 'mobile' :
                    nav.classList.contains('footer-links') ? 'footer' :
                    nav.classList.contains('page-back-btn') ? 'back' : 'header'
            });
        }
    }

    function handleSubmit(event) {
        if (!initialized) return;

        var form = event.target;
        if (!form || form.id !== 'contactForm') return;

        capture('contact_form_submitted', {
            form_id: form.id,
            form_name: form.getAttribute('name') || ''
        });
    }

    function handleConsentChange(event) {
        var detail = event && event.detail;

        if (detail && detail.analytics) {
            if (!initialized) {
                initPostHog();
                return;
            }

            try {
                window.posthog.opt_in_capturing();
                window.posthog.startSessionRecording();
            } catch (error) {}
            return;
        }

        if (!initialized) return;

        try {
            window.posthog.stopSessionRecording();
            window.posthog.opt_out_capturing();
        } catch (error) {}
    }

    function setup() {
        initPostHog();

        document.addEventListener('cookieConsentChange', handleConsentChange);
        document.addEventListener('click', handleClick);
        document.addEventListener('submit', handleSubmit);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();
