'use strict';

window.addEventListener ('load', () => {
    const $links = $('ul > .toctree-l1');
    const $sublinks = $('.toctree-l2');
    const $allLinks = $('ul > .toctree-l1,.toctree-l2');
    const $sections = $('.section');
    const $menu = $('.wy-menu');
    const $searchArea = $('.wy-side-nav-search')
    const searchHeight = $searchArea.outerHeight ()
    // change the DOM structure so that captions can slide over sidebar links
    let lastP = null;
    for (const child of $menu.children ()) {
        if (child.nodeName === 'P') {
            lastP = child;
        } else if (lastP !== null) {
            const $li = $('<li class="toctree-l1"></li>');
            $li.append (lastP);
            child.prepend ($li[0]);
            lastP = null;
        }
    }
    // link the sidebar links and the sections
    const $topLinks = $links.find ('a.reference.internal[href="#"]');
    $topLinks.each (function () {
        const text = this.innerText.toLowerCase ();
        $(this).attr ('href', '#' + text);
    });
    // limit faq to just one question per link
    const $faq = $('a.reference.internal[href="#frequently asked questions"]');
    const $faqlinks = $faq.siblings ().children ().children ();
    $faqlinks.each (function () {
        this.innerText = this.innerText.split ('?')[0] + '?';
    });
    // set the height values for the sticky css property
    const $linkGroups = $links.parents ('ul');
    const heights = {};
    const size = $links.find (':not(".current")').innerHeight ()
    $linkGroups.each (function () {
        const $sublinks = $(this).find ('li.toctree-l1');
        let height = -searchHeight + 2;
        for (const link of $sublinks) {
            const $link = $(link);
            heights[$link.children ().first ().attr ('href')] = -Math.ceil (height);
            height += size;
        }
    });
    const linksBySectionId = {};
    $sections.each (function () {
        linksBySectionId[this.id] = $allLinks.find ('a.reference.internal[href="#' + this.id + '"]').parent ().filter ('li');
    });
    let lock = null;
    let prevLock = null;
    let last = null;
    let lastLock = null;
    let $current = null;
    function open () {
        if (lock === null) {
            $current = $(this);
            if (prevLock !== this && $current.hasClass ('toctree-l1')) {
                lock = this;
                prevLock = lock;
                $links.removeClass ('current');
                $current.removeClass ('hidden');
                $current.addClass ('current', 400, 'linear', () => {
                    lock = null;
                    if (last !== null && lastLock === null) {
                        lastLock = last;
                        setTimeout (() => {
                            open.call (last);
                            lastLock = null;
                        }, 400);
                    }
                });
                // console.log ('setting height to ', heights[$current.children ().first ().attr ('href')])
                $current.parent ().css ('top', heights[$current.children ().first ().attr ('href')]);
            } else {
                $sublinks.removeClass ('current');
                $links.not ($current.parent ().parent ()).removeClass ('current')
                $current.addClass ('current');
            }
        } else {
            last = this;
        }
    }
    // $links.on ('mouseover', open)
    window.addEventListener ('scroll', () => {
        const fromTop = window.scrollY + window.innerHeight * 0.5;
        $sections.each (function () {
            if (this.offsetTop <= fromTop && this.offsetTop + this.offsetHeight > fromTop) {
                const sidelink = linksBySectionId[this.id];
                if (sidelink.length) {
                    const element = sidelink[0];
                    open.call (element);
                }
            }
        });
    });
    // change the width here...
    const width = 200;
    const height = width * 0.5625;
    const footerHeight = Math.max ((width / 400) * 32, 16);
    const iconSize = Math.max ((width / 400) * 24, 16);
    const footerPadding = Math.max ((width / 400) * 20, 10);
    const style = `.CLS-slider.swiper-wrapper{height: ${height}px}.CLS-footer{height: ${footerHeight}px;padding: 0 ${footerPadding}px}.CLS-prev > svg, .CLS-next > svg{width: ${iconSize}px; height: ${iconSize}px}`;
    // hack into the binance sdk /0-0\ /0v0\ /0-0\
    function onReadyStateChangeReplacement () {
        let result;
        if (this._onreadystatechange) {
            result = this._onreadystatechange.apply (this, arguments);
        }
        // after binance's setTimeout
        setTimeout (() => {
            $('.swiper-slide').css ('width', width + 'px');
            $('.swiper-container').css ('max-width', width + 'px');
            $('#widget').css ('display', 'initial').trigger ('resize');
            $('#widget-wrapper').css ('border-style', 'solid');
        }, 0);
        return result;
    }

    const openRequest = window.XMLHttpRequest.prototype.open;
    function openReplacement (method, url, async, user, password) {
        if (this.onreadystatechange) {
            this._onreadystatechange = this.onreadystatechange;
        }
        this.onreadystatechange = onReadyStateChangeReplacement;
        return openRequest.call (this, method, url, async, user, password);
    }

    window.XMLHttpRequest.prototype.open = openReplacement;
    window.binanceBrokerPortalSdk.initBrokerSDK ('#widget', {
        'apiHost': 'https://www.binance.com',
        'brokerId': 'R4BD3S82',
        'slideTime': 5.0e8,
        'overrideStyle': style,
    });
});
