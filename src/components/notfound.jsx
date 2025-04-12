import { useNavigate } from "react-router-dom";
import RingLoader from "react-spinners/RingLoader";

const NotFound404 = () => {
  const navigate = useNavigate;
  return (
    <>
      <div className="flex items-center h-96   justify-center ">
        <RingLoader color="#ff8c06" size={200} />
      </div>
      <div className="text-red-600 text-center text-2xl font-bold ">
        {" "}
        Check Your Link ( Error 404)
      </div>
      <div
        onClick={() => navigate("/")}
        className="text-center text-2xl text-green-600 underline cursor-pointer mt-5"
      >
        Go Back
      </div>
    </>
  );
};

export default NotFound404;
