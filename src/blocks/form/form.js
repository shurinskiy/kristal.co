(() => {

	const form = document.querySelector('form.form');
	if (!form) return;

	const fieldset = form?.querySelector('fieldset.form__fields');
	const fields = form?.querySelectorAll('.form__field input');
	const alerts = form?.querySelector('.form__alerts');
	const button = form?.querySelector('.form__submit');

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		fieldset.disabled = true;
		button.disabled = true;
		
		const formData = new FormData(e.target);
		formData.append('lang', document.documentElement.lang || 'ru'); 

		try {
			// отправляем данные на сервер
			await fetch('mailto.php', { method: 'POST', body: formData }).then((response) => {
				if (response.ok) {
					// если сервер ответил нормально - отдаем данные
					return response.json();
				} else {
					// если все плохо - генерируем исключение
					throw new Error(response.statusText);
				}
			}).then((data) => {
				// если почта ушла
				if (data.status === 'success') {
					form.classList.add('success');
					e.target.reset(); 
				// если почта не ушла
				} else {
					alerts.innerHTML = data.text;

					if (data.errors) {
						// расставляем ошибки у полей не прошедших валидацию
						fields.forEach(field => {
							data.errors.map(error => {
								if (field.name == error) field.classList.add('error');
							});
						});
					}
				}
			});
				
		} catch (error) {
			// отображаем данные если сервер ответил не правильно
			alerts.innerHTML = error;
		} finally {
			fieldset.disabled = false;
			button.disabled = false;
		}
	});

})();