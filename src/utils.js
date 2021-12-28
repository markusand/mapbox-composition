export const debounce = (fn, timeout = 100) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => { fn(...args); }, timeout);
	};
};

export const uuid = () => Math.random().toString(36).substring(7);

export const isObject = item => !!item && item.constructor === Object;
