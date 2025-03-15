import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AllBooks from "./pages/AllBooks";
import MyBooks from "./pages/MyBooks";
import RequestReturn from "./pages/RequestReturn";
import Logout from "./components/Logout";
import IssueBookRequest from "./pages/IssueBookRequest";
import ReturnBookRequest from "./pages/ReturnBookRequest";

function App() {

  return (
    <>
      <Router>
        <Logout />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<AllBooks />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/request-return" element={<RequestReturn />} />
          <Route path="/issue-book-request" element={<IssueBookRequest />} />
          <Route path="/return-book-request" element={<ReturnBookRequest />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
