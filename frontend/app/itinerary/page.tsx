import Image from "next/image";
import DayCard from "../components/DayCard";

const ItineraryPage = () => {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:gap-0 md:h-screen">
      {/* LEFT PANEL */}
      <div className="w-full md:w-1/3 bg-[linear-gradient(to_right,#fcb045,#fd1d1d,#833ab4)] p-5 md:p-10 flex flex-col justify-between gap-10 md:fixed left-0 top-0 md:h-full shadow-md">
        {/* Header */}
        <div className="flex flex-col items-center md:items-start gap-5">
          <Image
            src="/logo-white.png"
            alt="Itinera Logo"
            width={400}
            height={400}
            className="w-2/3"
          />

          {/* Trip Summary */}
          <div className="w-full bg-white/20 border border-white/30 text-white text-sm rounded-lg p-4">
            <p className="font-semibold">📍 Trip Summary</p>
            <p>
              Location: <span className="font-medium">{}</span>
            </p>
            <p>
              Start:{" "}
              <span className="font-medium">
                {new Date("").toLocaleString()}
              </span>
            </p>
            <p>
              End:{" "}
              <span className="font-medium">
                {new Date("").toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-2/3 md:ml-[33.33%] flex flex-col gap-5 p-5 md:p-10 overflow-y-auto">
        <DayCard />
        <DayCard />
      </div>
    </div>
  );
};

export default ItineraryPage;
