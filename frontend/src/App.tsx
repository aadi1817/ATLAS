import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Planner from './pages/Planner'
import TripResult from './pages/TripResult'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<Planner />} />
        <Route path="/trip" element={<TripResult />} />
      </Routes>
    </BrowserRouter>
  )
}
