import PlaceCard from "./PlaceCard";

const DayCard = () => {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h2 className="text-[1.1rem] font-semibold">Day 1 : Cluster Name</h2>
      </div>
      
      <div className="flex flex-col gap-2 bg-gray-200 p-5 rounded-2xl">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-2">
            <h3>Time</h3>
          </div>
          <div className="col-span-2">
            <h3>Activity</h3>
          </div>
          <div className="col-span-8">
            <h3>Description & Notes</h3>
          </div>
        </div>
        <PlaceCard />
        <PlaceCard />
        <PlaceCard />
      </div>
    </div>
  );
};

export default DayCard;
