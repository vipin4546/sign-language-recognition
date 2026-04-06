import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Demo from './pages/Demo.jsx'
import Docs from './pages/Docs.jsx'
import Navbar from './components/Navbar.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-ink">
        <Navbar />
        <Routes>
          <Route path="/"     element={<Landing />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
