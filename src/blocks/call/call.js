(() => {
	const call = document.querySelector('.call');
	if (! call) return;
	
	call.addEventListener('click', e => {
		e.target.closest('.call__toggle') && call.classList.toggle('opened');
	});

	['click','touchstart'].forEach(event => {
		document.addEventListener(event, e => {
			e.target.closest('.call') || call.classList.remove('opened');
		}, { passive: false });
	});

})();