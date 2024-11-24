import { BrowserRouter,Route,Routes,Navigate} from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Error from "./pages/Error"
import { GoogleOAuthProvider } from "@react-oauth/google"
const App = () => {
  const GoogleAuthWrapper = () => {
    return (
      <GoogleOAuthProvider clientId="657532976163-hi1h045iim689p11fs1hub90vapg2eqq.apps.googleusercontent.com">
        <Login ></Login>
      </GoogleOAuthProvider>
    )
  }
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GoogleAuthWrapper />} />
        <Route path = '/' element = {<Navigate to = '/login' />} />
        <Route path = '/dashboard' element = {<Dashboard />} />
        <Route path = '*' element = {<Error />} />
      </Routes>
    
    </BrowserRouter>
  )
}

export default App
