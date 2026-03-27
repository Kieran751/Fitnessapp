import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { Provider as JotaiProvider } from 'jotai'
import { routeTree } from './routeTree.gen'
import { seedExercises } from './data/exercises'
import './styles/globals.css'

// Seed exercises on first load
seedExercises().catch(console.error)

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JotaiProvider>
      <RouterProvider router={router} />
    </JotaiProvider>
  </StrictMode>,
)
