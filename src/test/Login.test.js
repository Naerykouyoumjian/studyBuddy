import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';

test('renders login form', () => {
  render(
    <BrowserRouter>
      <Login onLogin={() => {}} />
    </BrowserRouter>
  );

  expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});

test('shows error for empty fields', async () => {
  render(
    <BrowserRouter>
      <Login onLogin={() => {}} />
    </BrowserRouter>
  );

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  // No fetch is called since required fields are not filled
  expect(await screen.findByText(/an error occurred/i)).toBeInTheDocument();
});
