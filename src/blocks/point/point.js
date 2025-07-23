import enquire from 'enquire.js';
import Swiper from 'swiper';

(() => {
	const sliders = document.querySelectorAll('.point__images.swiper');
	if (! sliders) return;

	let swipers = [];

	const enableSwiper = (el, i) => {
		swipers[i] = new Swiper(el, {
			centeredSlides: false,
			watchOverflow: true,
			spaceBetween: 24,
			threshold: 10,
			breakpoints: {
				0: {
					slidesPerView: 1.17,
					centeredSlides: true,
					spaceBetween: 20
				},
				481: {
					centeredSlides: true,
					slidesPerView: 1.5,
					spaceBetween: 24
				},
				641: {
					centeredSlides: false,
					slidesPerView: 2.3,
					spaceBetween: 24
				},
				781: {
					slidesPerView: 2.2,
					spaceBetween: 24
				}
			}
		});
	}

	enquire.register("screen and (max-width: 780px)", {
		match: function() {
			sliders.forEach((slider, i) => enableSwiper(slider, i));
		},
		unmatch: function() {
			swipers.forEach(sw => (sw !== undefined) && sw.destroy(true, true));
		}
	});

})();