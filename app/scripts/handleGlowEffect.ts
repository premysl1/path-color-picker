import type { MouseEvent } from 'react';

export default function handleMoveGlowEffect(e: MouseEvent<HTMLElement>) {
	const { currentTarget, clientX, clientY } = e;
	const rect = currentTarget.getBoundingClientRect();

	currentTarget.style.setProperty(`--x`, `${clientX - rect.left}px`);
	currentTarget.style.setProperty(`--y`, `${clientY - rect.top}px`);
};