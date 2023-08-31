import { useWritable } from './store';
import { browser } from '$app/environment';

export const theme = () => {
	const localStorage = browser ? window.localStorage : null;
	type themeType = 'light' | 'dark' | 'custom' | 'random' | null;
	if (localStorage) {
		const themeValue = localStorage.getItem('theme');
		if (themeValue) {
			const t = themeValue as themeType;
			return useWritable<themeType>('theme', t);
		}
	}
	return useWritable<themeType>('theme', 'light');
};
