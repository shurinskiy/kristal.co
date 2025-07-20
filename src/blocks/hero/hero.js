import Swiper from 'swiper';
import { Autoplay, Navigation } from 'swiper/modules';

(() => {

	new Swiper(".hero__slider", {
		modules: [ Autoplay, Navigation ],
		loop: true,
		speed: 1000,
		spaceBetween: 0,
		navigation: {
			nextEl: `.hero__button_next`,
			prevEl: `.hero__button_prev`,
		},
		autoplay: { 
			delay: 10000,
			disableOnInteraction: true
		}
	});

})();