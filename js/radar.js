/*!
 * Technology Radar
 * https://github.com/urre/radar
 * @author Urban Sanden
 * MIT licensed.
 */

(function () {
	'use strict';

	var AREAS = ['techniques', 'tools', 'frameworks', 'platforms'];
	var STATUSES = ['hold', 'assess', 'trial', 'adopt'];

	// How far around the circle each area's blips are rotated
	var QUADRANT_ROTATIONS = {
		techniques: 105,
		tools: 110,
		platforms: 135,
		frameworks: 120
	};

	// Radar width the scatter offsets below were tuned for
	var BASE_RADAR_WIDTH = 1030;

	var radar = document.querySelector('.radar');
	var blipsEl = document.getElementById('blips');
	var layoutToggle = document.getElementById('layout');
	var tooltip = null;

	// Only allow http(s) and relative links, never javascript: or data: URLs
	function safeUrl(value) {
		try {
			var url = new URL(String(value), document.baseURI);
			return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '#';
		} catch (e) {
			return '#';
		}
	}

	function el(tag, attrs, children) {
		var node = document.createElement(tag);
		Object.keys(attrs || {}).forEach(function (key) {
			node.setAttribute(key, attrs[key]);
		});
		(children || []).forEach(function (child) {
			node.append(child);
		});
		return node;
	}

	function getJSON(url) {
		return fetch(url).then(function (res) {
			if (!res.ok) throw new Error(url + ': ' + res.status);
			return res.json();
		});
	}

	// Gravatar accepts SHA-256 hashes of the trimmed, lowercased email
	function gravatarUrl(email, size) {
		if (!email || !window.crypto || !crypto.subtle) return Promise.resolve(null);
		var data = new TextEncoder().encode(String(email).trim().toLowerCase());
		return crypto.subtle.digest('SHA-256', data).then(function (buf) {
			var hex = Array.from(new Uint8Array(buf), function (b) {
				return b.toString(16).padStart(2, '0');
			}).join('');
			return 'https://www.gravatar.com/avatar/' + hex + '?s=' + size;
		});
	}

	function renderUser(data) {
		var user = data.user && data.user[0];
		if (!user) return;

		var link = el('a', { class: 'white', href: safeUrl(user.website) }, [user.name || '']);
		var p = el('p', {}, [link]);
		var header = el('header', { role: 'banner', class: 'header' }, [
			el('h1', {}, [document.title]),
			p
		]);

		if (user.background) {
			header.style.backgroundImage = 'url(' + JSON.stringify(safeUrl(user.background)) + ')';
		}

		document.body.prepend(header);

		gravatarUrl(user.email, 64).then(function (src) {
			if (src) p.prepend(el('img', { src: src, alt: '' }));
		});
	}

	function renderBlips(data) {
		var blips = (data.blips || []).filter(function (blip) {
			return AREAS.indexOf(blip.area) !== -1 && STATUSES.indexOf(blip.status) !== -1;
		});

		blips.forEach(function (blip) {
			var href = safeUrl(blip.link);
			var title = String(blip.title || '');

			var dot = el('a', {
				class: 'blip blip--' + blip.area,
				href: href,
				target: '_blank',
				rel: 'noopener noreferrer',
				'aria-label': title,
				'data-area': blip.area,
				'data-status': blip.status,
				'data-title': title
			});
			blipsEl.append(dot);

			var item = el('a', { href: href, target: '_blank', rel: 'noopener noreferrer' }, [
				title,
				el('span', {}, [blip.status])
			]);
			item.addEventListener('mouseenter', function () { showTooltip(dot); });
			item.addEventListener('mouseleave', hideTooltip);
			item.addEventListener('focus', function () { showTooltip(dot); });
			item.addEventListener('blur', hideTooltip);

			radar.querySelector('.' + blip.area).append(el('ul', {}, [el('li', {}, [item])]));
		});

		positionBlips();
	}

	function positionBlips() {
		var dots = blipsEl.querySelectorAll('.blip');
		if (!dots.length || radar.classList.contains('compact')) return;

		var center = radar.offsetWidth / 2;
		var scale = radar.offsetWidth / BASE_RADAR_WIDTH;
		var ringWidth = {
			// Inset so the scatter offset keeps hold blips inside the circle
			hold: radar.offsetWidth * 0.88,
			assess: radar.querySelector('.assess').offsetWidth,
			trial: radar.querySelector('.trial').offsetWidth,
			adopt: radar.querySelector('.adopt').offsetWidth
		};

		dots.forEach(function (dot) {
			var area = dot.dataset.area;
			var radius = (ringWidth[dot.dataset.status] - dot.offsetWidth) / 2;
			var angle = 0.16 * (QUADRANT_ROTATIONS[area] - 1);
			var left = center + radius * Math.cos(angle) + (Math.random() * 100 + 5) * scale;
			var top = center + radius * Math.sin(angle) + (Math.random() * 50 + 5) * scale;

			if (area === 'frameworks') {
				left -= 100 * scale;
				top += 10 * scale;
			}

			left = Math.floor(left);
			top = Math.floor(top);

			dot.style.left = left + 'px';
			dot.style.top = top + 'px';
		});
	}

	function showTooltip(target) {
		hideTooltip();
		var title = target.dataset.title;
		if (!title || radar.classList.contains('compact')) return;

		tooltip = el('div', { class: 'tooltip ' + target.dataset.area, role: 'tooltip' }, [title]);
		tooltip.style.maxWidth = window.innerWidth < 340 * 1.5 ? (window.innerWidth / 2) + 'px' : '340px';
		document.body.append(tooltip);
		target.classList.add('is-active');
		tooltip._target = target;

		var rect = target.getBoundingClientRect();
		tooltip.style.left = (rect.left + window.scrollX + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
		tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - 20) + 'px';
	}

	function hideTooltip() {
		if (!tooltip) return;
		tooltip._target.classList.remove('is-active');
		tooltip.remove();
		tooltip = null;
	}

	function bindBlipEvents() {
		blipsEl.addEventListener('mouseover', function (e) {
			var dot = e.target.closest('.blip');
			if (dot) showTooltip(dot);
		});
		blipsEl.addEventListener('mouseout', function (e) {
			if (e.target.closest('.blip')) hideTooltip();
		});
		blipsEl.addEventListener('focusin', function (e) {
			var dot = e.target.closest('.blip');
			if (dot) showTooltip(dot);
		});
		blipsEl.addEventListener('focusout', hideTooltip);
	}

	// Radar when the toggle is on, list otherwise
	function applyLayout() {
		radar.classList.toggle('compact', !layoutToggle.checked);
		hideTooltip();
		positionBlips();
	}

	function debounce(fn, wait) {
		var timer;
		return function () {
			clearTimeout(timer);
			timer = setTimeout(fn, wait);
		};
	}

	bindBlipEvents();
	layoutToggle.addEventListener('change', applyLayout);
	window.addEventListener('resize', debounce(applyLayout, 150));
	applyLayout();

	getJSON('user.json').then(renderUser).catch(console.error);
	getJSON('blips.json').then(renderBlips).catch(console.error);
}());
