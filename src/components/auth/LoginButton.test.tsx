import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Authenticator } from '@aws-amplify/ui-react'
import LoginButton from './LoginButton'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Authenticator.Provider>
    {children}
  </Authenticator.Provider>
)

describe('LoginButton', () => {
  it('should render login button text', () => {
    render(<LoginButton />, { wrapper: TestWrapper })
    expect(screen.getByText('Googleでログイン')).toBeInTheDocument()
  })

  it('should have correct CSS classes', () => {
    render(<LoginButton />, { wrapper: TestWrapper })
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600', 'text-white', 'px-4', 'py-2', 'rounded')
  })
})