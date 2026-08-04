import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach, expect } from 'vitest';
import App from '../../App'; // Import your root or ProjectView component

describe('Recurring tasks', () => {
  beforeEach(() => {
    // Clear localStorage before each run so tests remain isolated
    localStorage.clear();
  });

  it('checks if incrementing the count of recurring tasks adds to the balance', async () => {
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

    const recurringButton = within(taskForm).getByRole('button', { name: /recurring/i });
    await user.click(recurringButton);

    const coinInput = within(taskForm).getByRole("spinbutton");
    await user.clear(coinInput);
    await user.type(coinInput, '20');
    
    const submitBtn = within(taskForm).getByRole("button", {name: /^add$/i});
    await user.click(submitBtn);


    // 1. Locate the text span directly
    const taskTitle = screen.getByText(/buy groceries/i);

    // 2. Traverse upward to the main task wrapper
    const taskCard = taskTitle.closest('.group') as HTMLElement | null;
    const addCount = within(taskCard!).getByRole("button", {name: /︿/i});
    await user.click(addCount);
    await user.click(addCount);
    await user.click(addCount);

    const balanceDisplay = screen.getByText(/your balance/i).closest('div') as HTMLElement | null;

    const amount = within(balanceDisplay!).getByText(/60\s*coins/i);
    expect(amount).toBeInTheDocument();

    
    screen.debug(balanceDisplay!);


  });
}); 