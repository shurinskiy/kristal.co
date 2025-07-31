import Swiper from 'swiper';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

(() => {

	const more = document.querySelector('a.hero__more');
	const slider = document.querySelector('.hero__slider');
	
	const updateButton = function(sw) {
		const anchor = sw.slides[sw.activeIndex].dataset?.anchor;
		anchor && (more.href = anchor);
	}

	new Swiper(slider, {
		modules: [ Autoplay, Pagination, Navigation ],
		loop: true,
		speed: 1000,
		spaceBetween: 0,
		navigation: {
			nextEl: `.hero__button_next`,
			prevEl: `.hero__button_prev`,
		},
		pagination: {
			el: '.hero__pagination',
			bulletClass: 'hero__dot',
			bulletActiveClass: 'active',
			clickable: true,
		},
		autoplay: { 
			delay: 10000,
			disableOnInteraction: true
		},
		on: {
			init: updateButton,
			slideChange: updateButton
		}
	});

})();