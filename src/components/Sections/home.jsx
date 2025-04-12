const Home = ({
  username,
  img,
  user: { first_name, last_name },
  about: { skill },
}) => {
  return (
    <div className="relative flex flex-col sm:flex-row justify-between items-center sm:items-start mx-5 sm:mx-10 h-auto sm:h-96 bg-frame_bg mt-5 p-10 pt-20">
      <div>
        <p className="text-white font-bold uppercase text-xl sm:text-3xl">
          I am {last_name} {first_name}
        </p>
        <p className="text-4xl sm:text-6xl text-text_color font-bold capitalize mt-6 sm:mt-12">
          {skill}
        </p>
      </div>

      {/* Image block for tablet+ screens only */}
      <div className="hidden w-full sm:w-1/3 md:flex justify-center sm:justify-end mt-6 sm:mt-0 mr-5 sm:mr-10">
        {" "}
        <div className="w-40 h-40 sm:w-48 sm:h-48 overflow-hidden border-2  rotate-45 shadow-lg shadow-black">
          <img
            src={img}
            alt={username}
            className="w-full h-full object-cover -rotate-45 scale-150"
            // className="w-full h-full object-cover transform -rotate-45"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
