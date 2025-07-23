import Swiper from 'swiper';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

(() => {

	new Swiper(".hero__slider", {
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
		}
	});

})();