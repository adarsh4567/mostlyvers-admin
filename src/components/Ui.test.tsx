import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader, Status } from './Ui';

describe('shared UI', () => {
  it('renders accessible page hierarchy and readable statuses', () => {
    render(<><PageHeader title="Books" subtitle="Manage stories" /><Status value="NOT_CONFIGURED" /></>);
    expect(screen.getByRole('heading', { name: /Books/ })).toBeInTheDocument();
    expect(screen.getByText('NOT CONFIGURED')).toBeInTheDocument();
  });
});
