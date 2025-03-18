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
import Edit from "./pages/EditBook";
import ShowBook from "./pages/ShowBook";
import AddBook from "./pages/AddBook";
import Navbar from "./pages/Navbar";
import EditUser from "./pages/EditUser";

function App() {

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<AllBooks />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/request-return" element={<RequestReturn />} />
          <Route path="/issue-book-request" element={<IssueBookRequest />} />
          <Route path="/return-book-request" element={<ReturnBookRequest />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/book/:id" element={<ShowBook />} />
          <Route path="/book/new" element={<AddBook />} />
          <Route path="/user/edit" element={<EditUser />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
