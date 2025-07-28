import React, { useEffect, useState } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import { Workspace, Task } from './models/index.js';
import { useTerminalSize } from './hooks/index.js';

export default function App() {
	const { width: maxWidth, height: maxHeight } = useTerminalSize();
	const [workspaces, setWorkspaces] = useState([]);
	const [currentWorkspace, setCurrentWorkspace] = useState(0);
	const [tasks, setTasks] = useState([]);
	const [selectedTask, setSelectedTask] = useState(0);
	const [isInputMode, setIsInputMode] = useState(false);
	const [inputText, setInputText] = useState('');

	useEffect(() => {
		const loadWorkspaces = () => {
			try {
				const allWorkspaces = Workspace.findAll();
				if (allWorkspaces.length < 1) {
					allWorkspaces.push(Workspace.create('New Workspace'));
				}
				setWorkspaces(allWorkspaces);
				setCurrentWorkspace(allWorkspaces[0].id);
			} catch (error) {
				console.error('Error loading workspaces:', error);
			};
		};

		loadWorkspaces();
	}, []);

	useEffect(() => {
		const loadTasks = () => {
			try {
				const tasksFromWorkspace = Task.findByWorkspaceId(currentWorkspace);
				setTasks(tasksFromWorkspace);
			} catch (error) {
				console.error('Error loading tasks:', error);
			}
		}

		if (currentWorkspace) {
			loadTasks();
		}
	}, [currentWorkspace]);

	const createTask = () => {
		try {
			Task.create(inputText, currentWorkspace);

			const updatedTasks = Task.findByWorkspaceId(currentWorkspace);
			setTasks(updatedTasks);
			setSelectedTask(updatedTasks.length - 1);
			setInputText('');
		} catch (error) {
			console.error('Error creating task:', error);
		}
	}

	const toggle = () => {
		try {
			const taskToToggle = tasks[selectedTask];
			taskToToggle.toggle();

			const updatedTasks = Task.findByWorkspaceId(currentWorkspace);
			setTasks(updatedTasks);			
		} catch (error) {
			console.error('Error updating task:', error);
		}
	}

	useInput((input, key) => {
		if (isInputMode) {
			if (key.return) {
				createTask();
				setIsInputMode(false);
			} else if (key.escape) {
				setInputText('');
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
				toggle();
			} else if (input === 'i') {
				setIsInputMode(true);
				setInputText('');
			}
		}
	});

	return (
		<Box flexDirection="column" borderStyle="double" paddingTop={3} paddingBottom={1} paddingX={6} height={maxHeight}>
			<Box flexDirection="column" flexGrow={1}>
				{tasks.length > 0
					? tasks.map((task, idx) => (
						<Box key={task.title}>
							<Text color={selectedTask === idx ? 'cyan' : undefined}>
								{selectedTask === idx ? '>' : ' '} [{task.done ? 'x' : ' '}] {task.title}
							</Text>
						</Box>
					))
					: <Box marginTop={1}>
						<Text>Press "i" to add new task</Text>
					</Box>
				}
			</Box>

			{isInputMode && (
				<Box borderStyle="single" paddingY={1} paddingX={2} marginTop={1}>
					<Text>New task: {inputText}</Text>
				</Box>
			)}
		</Box>
	);
}
