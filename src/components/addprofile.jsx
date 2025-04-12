import { useNavigate } from "react-router-dom";
import RingLoader from "react-spinners/RingLoader";

const AddProfile = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex items-center h-96  justify-center ">
        <RingLoader color="#ff8c06" size={200} />
      </div>
      <div className="text-center text-4xl text-amber-600"> Coming Soon </div>
      <div
        onClick={() => navigate("/")}
        className="text-center text-2xl text-green-600 underline cursor-pointer mt-5"
      >
        Go Back
      </div>
    </>
  );
};

export default AddProfile;
