import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Candidates from './pages/Candidates'
import CandidateDetail from './pages/CandidateDetail'
import Assessments from './pages/Assessments'
import AssessmentBuilder from './pages/AssessmentBuilder'

function App() {

  return (

    <Routes>

      <Route path='/' element={<Home />}></Route>
      <Route path='/jobs' element={<Jobs />}></Route>
      <Route path='/jobs/:jobId' element={<JobDetail />}></Route>
      <Route path='/candidates' element={<Candidates />}></Route>
      <Route path='/candidates/:id' element={<CandidateDetail />}></Route>
      <Route path='/assessments' element={<Assessments />}></Route>
      <Route path='/assessments/new' element={<AssessmentBuilder />}></Route>
      <Route path='/assessments/:id' element={<AssessmentBuilder />}></Route>

    </Routes>

  )

}

export default App
