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

			this.querySelectorAll('a.menu__link[href*="#"]').forEach(link => {
				link.addEventListener('click', (e) => menu.menuClose(e));
			});
		},
		close: function() {
			toggle.classList.remove('opened');
		}
	});

})();