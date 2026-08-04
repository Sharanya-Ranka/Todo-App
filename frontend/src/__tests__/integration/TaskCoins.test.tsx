import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach } from 'vitest';
import App from '../../App'; // Import your root or ProjectView component

describe('Task Coin Economics', () => {
  beforeEach(() => {
    // Clear localStorage before each run so tests remain isolated
    localStorage.clear();
  });

  it('calculates the parent task coin value as the exact sum of its subtasks', async () => {
    const user = userEvent.setup();

    // 1. Render the main view
    render(<App />);

    // screen.debug(); // Optional: Debug the initial render

    const addTaskBtn = screen.getByRole("button", {name: "+ Add Task"});
    await user.click(addTaskBtn);
    // const container = addTaskBtn.parentElement?.parentElement;
    const taskForm = screen.getByRole("form", {name: "New Subtask Form"});

    const descriptionInput = within(taskForm).getByPlaceholderText(/subtask description/i);
    await user.type(descriptionInput, 'Buy groceries');

    const coinInput = within(taskForm).getByRole("spinbutton");
    await user.clear(coinInput);
    await user.type(coinInput, '20');

    const submitBtn = within(taskForm).getByRole("button", {name: /^add$/i});
    await user.click(submitBtn);


    screen.debug();
  });
}); 