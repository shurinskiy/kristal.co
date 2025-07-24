import { driveMenu } from "../../js/libs/driveMenu";

(() => {
	const navi = document.querySelector('.menu');
	if (! navi) return;

	const toggle = navi.querySelector('.menu__toggle');
	const body = navi.querySelector('.menu__body');

	const menu = driveMenu(body, [toggle], {
		omitToClose: '.modal',
		class: 'opened',
		open: function() {
			toggle.classList.add('opened');

			if (matchMedia('(max-width: 480px)').matches) {
				document.documentElement.style.setProperty('overflow', 'hidden');
				document.body.style.setProperty('padding-right', 'var(--sw, 0px)');
			}
		},
		close: function() {
			toggle.classList.remove('opened');
			document.documentElement.style.removeProperty('overflow');
			document.body.style.removeProperty('padding-right');
		}
	});

	body.querySelectorAll('a.menu__link[href*="#"]').forEach(link => {
		link.addEventListener('click', (e) => menu.menuClose(e));
	});

})();