/* eslint-disable import/prefer-default-export */

export const debounce = (fn, timeout = 100) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => { fn(...args); }, timeout);
	};
};
