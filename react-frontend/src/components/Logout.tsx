import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.delete("http://localhost:3000/api/v1/users/logout", {withCredentials: true});
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchMyBooks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/borrowed_books", { withCredentials: true });
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch my books:", error);
    }
  };

  const fetchIssueRequests = ()=>{
    navigate("/issue-book-request");
  }

  const fetchReturnRequests = ()=>{
    navigate("/return-book-request");
  }

  return (
    <>
      <button className="bg-blue-500 mx-3 text-white px-4 py-2 rounded-md" onClick={handleLogout}>Logout</button>
      <button className="bg-blue-500 mx-3 text-white px-4 py-2 rounded-md" onClick={fetchMyBooks}>fetchMyBooks</button>
      <button className="bg-blue-500 mx-3 text-white px-4 py-2 rounded-md" onClick={fetchIssueRequests}>fetchIssueRequests</button>
      <button className="bg-blue-500 mx-3 text-white px-4 py-2 rounded-md" onClick={fetchReturnRequests}>fetchReturnRequests</button>
    </>
  );
}