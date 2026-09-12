import { KeyboardEvent, useRef, useState } from 'react';
import { SIGNALS, Signal } from './signalContent';

export default function useSignalTabs(): {
	activeSignal: Signal;
	selectSignal: (signal: Signal) => void;
	tabRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>;
	onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
} {
	const [activeSignal, selectSignal] = useState<Signal>('Traces');
	const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const onKeyDown = (
		event: KeyboardEvent<HTMLButtonElement>,
		index: number,
	): void => {
		let nextIndex: number;
		switch (event.key) {
			case 'ArrowRight':
				nextIndex = (index + 1) % SIGNALS.length;
				break;
			case 'ArrowLeft':
				nextIndex = (index + SIGNALS.length - 1) % SIGNALS.length;
				break;
			case 'Home':
				nextIndex = 0;
				break;
			case 'End':
				nextIndex = SIGNALS.length - 1;
				break;
			default:
				return;
		}
		event.preventDefault();
		selectSignal(SIGNALS[nextIndex]);
		tabRefs.current[nextIndex]?.focus();
	};
	return { activeSignal, selectSignal, tabRefs, onKeyDown };
}
