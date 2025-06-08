import { render, screen } from '@testing-library/react'
import LoginButton from './LoginButton'

describe('LoginButton', () => {
  it('should render login button text', () => {
    render(<LoginButton />)
    expect(screen.getByText('Googleでログイン')).toBeInTheDocument()
  })

  it('should have correct CSS classes', () => {
    render(<LoginButton />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600', 'text-white', 'px-4', 'py-2', 'rounded')
  })
})