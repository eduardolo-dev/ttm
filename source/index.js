import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export default function App() {
	const [isInputMode, setIsInputMode] = useState(false);
	const [isCommandMode, setIsCommandMode] = useState(false);
	const [inputText, setInputText] = useState('');
	const [savedText, setSavedText] = useState('');

	useInput((input, key) => {
		if (!isInputMode && !isCommandMode && input === 'i') {
			setIsInputMode(true);
			setInputText('');
		} else if (!isInputMode && !isCommandMode && input === ':') {
			setIsCommandMode(true);
			setInputText(':');
		} else if (isInputMode) {
			if (key.return) {
				setSavedText(inputText);
				setInputText('');
				setIsInputMode(false);
			} else if (key.ctrl && input === 'c') {
				process.exit();
			} else if (key.backspace) {
				setInputText((prev) => prev.slice(0, -1));
			} else if (input && input.length === 1) {
				setInputText((prev) => prev + input);
			}
		} else if (isCommandMode) {
			if (inputText === '' || key.escape) {
				setIsCommandMode(false);
			} else if (key.return) {
				setInputText('');
				setIsCommandMode(false);
			} else if (key.ctrl && input === 'c') {
				process.exit();
			} else if (key.backspace) {
				setInputText((prev) => prev.slice(0, -1));
			} else if (input && input.length === 1) {
				setInputText((prev) => prev + input);
			}
		}
	});

	return (
		<Box flexDirection="column">
			{isInputMode ? (
				<Text>Escribe tu texto: {inputText}</Text>
			) : (
				<Text>Pulsa "i" para escribir texto</Text>
			)}
			{savedText && <Text color="green">Texto guardado: {savedText}</Text>}
		</Box>
	);
}
