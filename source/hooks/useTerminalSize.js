import { useState, useEffect } from 'react';

export function useTerminalSize() {
	const [size, setSize] = useState({
	  	width: process.stdout.columns,
	  	height: process.stdout.rows
	});
  
	useEffect(() => {
		const handleResize = () => {
			setSize({
				width: process.stdout.columns,
				height: process.stdout.rows
			});
		};
  
	  	process.stdout.on('resize', handleResize);
  
		return () => {
			process.stdout.off('resize', handleResize);
		};
	}, []);
  
	return size;
}