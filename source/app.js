import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Workspace, Task } from './models/index.js';

const tasksList = [
	{ label: 'Task 1', checked: false },
	{ label: 'Task 2', checked: false },
	{ label: 'Task 3', checked: false }
];

export default function App() {
	const [workspaces, setWorkspaces] = useState([]);
	const [currentWorkspace, setCurrentWorkspace] = useState(0);
	const [tasks, setTasks] = useState(tasksList);
	const [selectedTask, setSelectedTask] = useState(0);
	const [isInputMode, setIsInputMode] = useState(false);
	const [inputText, setInputText] = useState('');
	const [savedText, setSavedText] = useState('');

	useEffect(() => {
		const loadWorkspaces = () => {
			try {
				const allWorkspaces = Workspace.findAll();
				if (allWorkspaces.length < 1) {
					allWorkspaces.push(Workspace.create('New Workspace'));
				}
				setWorkspaces(allWorkspaces);
			} catch {
				console.error('Error loading workspaces:', error);
			};
		};
		loadWorkspaces();
	}, []);

	useInput((input, key) => {
		if (isInputMode) {
			if (key.return) {
				setSavedText(inputText);
				setIsInputMode(false);
			} else if (key.backspace || key.delete) {
				setInputText(prev => prev.slice(0, -1));
			} else if (input) {
				setInputText(prev => prev + input);
			}
		} else {
			if (key.upArrow) {
				setSelectedTask(prev => (prev === 0 ? tasks.length - 1 : prev - 1));
			} else if (key.downArrow) {
				setSelectedTask(prev => (prev === tasks.length - 1 ? 0 : prev + 1));
			} else if (input === ' ') {
				setTasks(prev =>
					prev.map((task, idx) =>
						idx === selectedTask ? { ...task, checked: !task.checked } : task
					)
				);
			} else if (input === 'i') {
				setIsInputMode(true);
				setInputText('');
			}
		}
	});

	return (
		<Box flexDirection="column" borderStyle="double" padding={1}>
			{isInputMode ? (
				<Text>
					Escribe tu texto: {inputText}
				</Text>
			) : (
				tasks.map((task, idx) => (
					<Box key={task.label}>
						<Text color={selectedTask === idx ? 'cyan' : undefined}>
							{selectedTask === idx ? '>' : ' '} [{task.checked ? 'x' : ' '}] {task.label}
						</Text>
					</Box>
				))
			)}
			{savedText && (
				<Box marginTop={1}>
					<Text color="green">Texto guardado: {savedText}</Text>
				</Box>
			)}
		</Box>
	);
}
